// File: tests/domain.test.ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canonicalDigest, canonicalJson } from "../src/domain/canonical";
import { solveCoveragePlan } from "../src/domain/planner";
import { finalizeReceipt } from "../src/domain/receipt";
import type { CanonicalReceipt, TraversalReceipt } from "../src/domain/types";

describe("canonical truth", () => {
  it("sorts keys and preserves array order", () => {
    expect(canonicalJson({ z: 1, a: [2, 1] })).toBe('{"a":[2,1],"z":1}');
    expect(canonicalDigest({ a: 1 })).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("production image contract", () => {
  it("ships the selected public brand assets with the standalone server", () => {
    const dockerfile = readFileSync(new URL("../Dockerfile", import.meta.url), "utf8");
    expect(dockerfile).toContain("COPY --from=build --chown=nextjs:nodejs /app/public ./public");
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

describe("canonical receipt", () => {
  it("refuses to finalize a receipt when the final traversal is not verified", () => {
    const traversal = (state: TraversalReceipt["state"]): TraversalReceipt => ({
      query: "RETURN path",
      querySha256: "a".repeat(64),
      bounds: {
        sourceSelectors: ["source"],
        targetSelector: "portfolio",
        relationshipTypes: ["PROD_DEPENDS_ON"],
        maxLen: 1,
        pathCount: 1,
        resultLimit: 1,
        matchedSourceCount: 1,
        matchedTargetCount: 1,
        expectedPairKeyDigest: canonicalDigest([]),
      },
      pairs: [],
      pairDigest: canonicalDigest([]),
      pairKeyDigest: canonicalDigest([]),
      readEpoch: 1,
      bookmark: "bookmark",
      elapsedMs: 1,
      cursorPresent: false,
      duplicatePairCount: 0,
      state,
      refusalReasons: state === "VERIFIED_WITHIN_BOUNDS" ? [] : ["ADVERSARIAL_PARTIAL"],
    });
    const baseline = traversal("VERIFIED_WITHIN_BOUNDS");
    const partial = traversal("PARTIAL");
    const input = {
      schemaVersion: "1.0.0",
      createdAt: "2026-08-20T00:00:00.000Z",
      resultState: "PARTIAL",
      portfolioKey: "portfolio",
      incidentKey: "incident",
      selectedSourceKeys: ["source"],
      inputs: [],
      topologies: [],
      sources: [],
      advisories: [],
      exploitation: [],
      baseline,
      verificationUniverse: { kind: "selected-incident", sourceKeys: ["source"], baseline },
      final: partial,
      proposedFixes: [],
      outcomes: [],
      plan: {
        key: "plan",
        incidentKey: "incident",
        proposedFixKeys: [],
        baselinePairKeys: [],
        baselineSnapshotKeys: [],
        verificationSourceCoordinates: [],
        verificationBaselinePairKeys: [],
        scopes: ["production"],
        predictedResidualPairKeys: [],
        constraints: { requiredFixKeys: [], forbiddenFixKeys: [] },
        exhaustiveWithinBounds: true,
        state: "FAILED",
      },
      hydraDbImageDigest: "image",
      graphSchemaVersion: "schema",
      limitations: [],
    } as CanonicalReceipt;

    expect(() => finalizeReceipt(input)).toThrow("FINAL_TRAVERSAL_NOT_VERIFIED");
  });
});
