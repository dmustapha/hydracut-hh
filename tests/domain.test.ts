// File: tests/domain.test.ts
import { describe, expect, it } from "vitest";
import { canonicalDigest, canonicalJson } from "../src/domain/canonical";
import { solveCoveragePlan } from "../src/domain/planner";

describe("canonical truth", () => {
  it("sorts keys and preserves array order", () => {
    expect(canonicalJson({ z: 1, a: [2, 1] })).toBe('{"a":[2,1],"z":1}');
    expect(canonicalDigest({ a: 1 })).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("coverage planner", () => {
  it("uses deterministic tie-breaking and reports bounded exhaustiveness", () => {
    const makeChoice = (key: string, repository: string, removed: string[]) => ({
      fix: { key, repository, origin: "github-commit" as const, manifestSha256: "a".repeat(64), lockfileSha256: "b".repeat(64), snapshotKey: key, changedPackageCount: 1, state: "VERIFIED_WITHIN_BOUNDS" as const },
      outcome: { proposedFixKey: key, removed, persistent: [], introduced: [], unknown: [],
        otherFindings: { removed: [], persistent: [], introduced: [] }, changedPackageCount: 1 },
    });
    const plan = solveCoveragePlan({ incidentKey: "i", baselinePairs: ["a", "b"], baselineSnapshotKeys: ["s1"],
      verificationSourceCoordinates: ["pkg@1"], verificationBaselinePairKeys: ["a", "b"], scopes: ["production"], productionPairs: new Set(["a", "b"]), choices: [
      makeChoice("fix-b", "r2", ["b"]), makeChoice("fix-a", "r1", ["a"]),
    ], constraints: { requiredFixKeys: [], forbiddenFixKeys: [] }, maxStates: 100 });
    expect(plan.proposedFixKeys).toEqual(["fix-a", "fix-b"]);
    expect(plan.predictedResidualPairKeys).toEqual([]);
    expect(plan.exhaustiveWithinBounds).toBe(true);
    const rebound = solveCoveragePlan({ incidentKey: "i", baselinePairs: ["a", "b"], baselineSnapshotKeys: ["s1"],
      verificationSourceCoordinates: ["other@2"], verificationBaselinePairKeys: ["a", "b"], scopes: ["production"], productionPairs: new Set(["a", "b"]),
      choices: [makeChoice("fix-b", "r2", ["b"]), makeChoice("fix-a", "r1", ["a"])],
      constraints: { requiredFixKeys: [], forbiddenFixKeys: [] }, maxStates: 100 });
    expect(rebound.key).not.toBe(plan.key);
    const scopeRebound = solveCoveragePlan({ incidentKey: "i", baselinePairs: ["a", "b"], baselineSnapshotKeys: ["s1"],
      verificationSourceCoordinates: ["pkg@1"], verificationBaselinePairKeys: ["a", "b"], scopes: ["development"],
      productionPairs: new Set(["a", "b"]), choices: [makeChoice("fix-b", "r2", ["b"]), makeChoice("fix-a", "r1", ["a"])],
      constraints: { requiredFixKeys: [], forbiddenFixKeys: [] }, maxStates: 100 });
    expect(scopeRebound.key).not.toBe(plan.key);
  });

  it("never lets a cheaper constraint-ineligible state dominate a required fix", () => {
    const choice = { fix: { key: "required-fix", repository: "r1", origin: "github-commit" as const,
      manifestSha256: "a".repeat(64), lockfileSha256: "b".repeat(64), snapshotKey: "required-fix",
      changedPackageCount: 4, state: "VERIFIED_WITHIN_BOUNDS" as const }, outcome: {
      proposedFixKey: "required-fix", removed: [], persistent: ["a"], introduced: [], unknown: [],
      otherFindings: { removed: [], persistent: [], introduced: [] }, changedPackageCount: 4 } };
    const plan = solveCoveragePlan({ incidentKey: "i", baselinePairs: ["a"], baselineSnapshotKeys: ["s1"],
      verificationSourceCoordinates: ["pkg@1"], verificationBaselinePairKeys: ["a"], scopes: ["production"], productionPairs: new Set(["a"]),
      choices: [choice], constraints: { requiredFixKeys: ["required-fix"], forbiddenFixKeys: [] }, maxStates: 10 });
    expect(plan.proposedFixKeys).toEqual(["required-fix"]);
  });

  it("removes forbidden proposed fixes before dominance pruning", () => {
    const choice = (key: string) => ({ fix: { key, repository: "r1", origin: "github-commit" as const,
      manifestSha256: "a".repeat(64), lockfileSha256: "b".repeat(64), snapshotKey: key,
      changedPackageCount: 1, state: "VERIFIED_WITHIN_BOUNDS" as const }, outcome: {
      proposedFixKey: key, removed: ["a"], persistent: [], introduced: [], unknown: [],
      otherFindings: { removed: [], persistent: [], introduced: [] }, changedPackageCount: 1 } });
    const plan = solveCoveragePlan({ incidentKey: "i", baselinePairs: ["a"], baselineSnapshotKeys: ["s1"],
      verificationSourceCoordinates: ["pkg@1"], verificationBaselinePairKeys: ["a"], scopes: ["production"], productionPairs: new Set(["a"]),
      choices: [choice("a-forbidden"), choice("z-valid")],
      constraints: { requiredFixKeys: [], forbiddenFixKeys: ["a-forbidden"] }, maxStates: 10 });
    expect(plan.proposedFixKeys).toEqual(["z-valid"]);
  });
});
