// File: src/domain/planner.ts
import type {
  PlanConstraints,
  PortfolioPlan,
  ProposedFix,
  ProposedFixOutcome,
  Scope,
} from "./types";
import { canonicalDigest } from "./canonical";

interface Choice {
  fix: ProposedFix;
  outcome: ProposedFixOutcome;
}

interface Score {
  residualProduction: number;
  residualAll: number;
  repositories: number;
  churn: number;
  stableKey: string;
}

interface SearchInput {
  incidentKey: string;
  baselinePairs: string[];
  baselineSnapshotKeys: string[];
  verificationSourceCoordinates: string[];
  verificationBaselinePairKeys: string[];
  scopes: Scope[];
  productionPairs: Set<string>;
  choices: Choice[];
  constraints: PlanConstraints;
  maxStates: number;
}

function groupChoices(choices: Choice[]): Choice[][] {
  const groups = new Map<string, Choice[]>();
  for (const choice of choices) {
    const group = groups.get(choice.fix.repository) ?? [];
    group.push(choice);
    groups.set(choice.fix.repository, group);
  }
  return [...groups.values()].map((group) =>
    group.sort((a, b) => a.fix.key.localeCompare(b.fix.key)),
  );
}

function residualPairs(baseline: string[], selected: Choice[]): string[] {
  const removed = new Set(selected.flatMap((choice) => choice.outcome.removed));
  const introduced = selected.flatMap((choice) => choice.outcome.introduced);
  return [...new Set([...baseline.filter((pair) => !removed.has(pair)), ...introduced])].sort();
}

function score(input: SearchInput, selected: Choice[]): Score {
  const residual = residualPairs(input.baselinePairs, selected);
  return {
    residualProduction: residual.filter((pair) => input.productionPairs.has(pair)).length,
    residualAll: residual.length,
    repositories: new Set(selected.map((choice) => choice.fix.repository)).size,
    churn: selected.reduce((sum, choice) => sum + choice.outcome.changedPackageCount, 0),
    stableKey: selected.map((choice) => choice.fix.key).sort().join("|"),
  };
}

function compare(left: Score, right: Score): number {
  return (
    left.residualProduction - right.residualProduction ||
    left.residualAll - right.residualAll ||
    left.repositories - right.repositories ||
    left.churn - right.churn ||
    left.stableKey.localeCompare(right.stableKey)
  );
}

function optimisticResidual(input: SearchInput, choices: Choice[]): { production: number; all: number } {
  const removable = new Set(choices.flatMap((choice) => choice.outcome.removed));
  const residual = input.baselinePairs.filter((pair) => !removable.has(pair));
  return { production: residual.filter((pair) => input.productionPairs.has(pair)).length, all: residual.length };
}

function allowed(input: SearchInput, selected: Choice[]): boolean {
  const keys = new Set(selected.map((choice) => choice.fix.key));
  if (input.constraints.requiredFixKeys.some((key) => !keys.has(key))) return false;
  if (input.constraints.forbiddenFixKeys.some((key) => keys.has(key))) return false;
  const limit = input.constraints.maxRepositoryChanges;
  return limit === undefined || selected.length <= limit;
}

export function solveCoveragePlan(input: SearchInput): PortfolioPlan {
  const forbidden = new Set(input.constraints.forbiddenFixKeys);
  const groups = groupChoices(input.choices.filter((choice) => !forbidden.has(choice.fix.key)));
  let explored = 0;
  let best: Choice[] | undefined;
  const dominance = new Map<string, Score>();
  const visit = (index: number, selected: Choice[]): void => {
    if (explored >= input.maxStates) return;
    if (index < groups.length) {
      const current = score(input, selected);
      const selectedKeys = new Set(selected.map((choice) => choice.fix.key));
      const requiredProgress = input.constraints.requiredFixKeys.filter((key) => selectedKeys.has(key)).sort().join("|");
      const stateKey = `${index}:${selected.length}:${requiredProgress}:${residualPairs(input.baselinePairs, selected).join("|")}`;
      const prior = dominance.get(stateKey);
      if (prior && compare(prior, current) <= 0) return;
      dominance.set(stateKey, current);
      if (best) {
        const possible = [...selected, ...groups.slice(index).flat()];
        const optimistic = optimisticResidual(input, possible);
        const incumbent = score(input, best);
        if (optimistic.production > incumbent.residualProduction ||
          (optimistic.production === incumbent.residualProduction && optimistic.all > incumbent.residualAll)) return;
      }
      visit(index + 1, selected);
      const group = groups[index];
      if (!group) throw new Error("PLANNER_GROUP_MISSING");
      for (const choice of group) visit(index + 1, [...selected, choice]);
      return;
    }
    explored += 1;
    if (!allowed(input, selected)) return;
    if (!best || compare(score(input, selected), score(input, best)) < 0) best = selected;
  };
  visit(0, []);
  if (!best) throw new Error("NO_FEASIBLE_PLAN_WITHIN_BOUNDS");
  const selected = best;
  const key = canonicalDigest({ incidentKey: input.incidentKey, baselinePairs: [...input.baselinePairs].sort(),
    baselineSnapshotKeys: [...input.baselineSnapshotKeys].sort(),
    verificationSourceCoordinates: [...input.verificationSourceCoordinates].sort(),
    verificationBaselinePairKeys: [...input.verificationBaselinePairKeys].sort(),
    scopes: [...input.scopes].sort(),
    fixes: selected.map((x) => x.fix.key).sort(), constraints: input.constraints,
    exhaustiveWithinBounds: explored < input.maxStates });
  return {
    key,
    incidentKey: input.incidentKey,
    proposedFixKeys: selected.map((choice) => choice.fix.key).sort(),
    baselinePairKeys: [...input.baselinePairs].sort(),
    baselineSnapshotKeys: [...input.baselineSnapshotKeys].sort(),
    verificationSourceCoordinates: [...input.verificationSourceCoordinates].sort(),
    verificationBaselinePairKeys: [...input.verificationBaselinePairKeys].sort(),
    scopes: [...input.scopes].sort(),
    predictedResidualPairKeys: residualPairs(input.baselinePairs, selected),
    constraints: input.constraints,
    exhaustiveWithinBounds: explored < input.maxStates,
    state: "DRAFT",
  };
}
