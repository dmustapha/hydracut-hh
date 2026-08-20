// File: src/domain/receipt.ts
import { canonicalDigest, canonicalJson } from "./canonical";
import type { CanonicalReceipt, TraversalReceipt } from "./types";

const mandatoryLimitations = [
  "Dependency-level potential exposure is not function reachability or exploitability.",
  "One shortest witness is retained per reachable source-to-application pair.",
  "A cleared selected incident does not certify application or portfolio safety.",
];

function assertTraversal(traversal: TraversalReceipt): void {
  if (canonicalDigest(traversal.pairs) !== traversal.pairDigest) {
    throw new Error("PAIR_DIGEST_MISMATCH");
  }
  if (traversal.state !== "VERIFIED_WITHIN_BOUNDS") return;
  const expectedLimit =
    traversal.bounds.matchedSourceCount * traversal.bounds.matchedTargetCount;
  if (traversal.bounds.resultLimit !== expectedLimit) {
    throw new Error("UNSAFE_RESULT_LIMIT");
  }
  if (traversal.cursorPresent || traversal.duplicatePairCount > 0) {
    throw new Error("INCOMPLETE_TRAVERSAL");
  }
}

export function finalizeReceipt(input: CanonicalReceipt): {
  digest: string;
  json: string;
  receipt: CanonicalReceipt;
} {
  assertTraversal(input.baseline);
  assertTraversal(input.verificationUniverse.baseline);
  assertTraversal(input.final);
  if (input.final.state !== "VERIFIED_WITHIN_BOUNDS") {
    throw new Error("FINAL_TRAVERSAL_NOT_VERIFIED");
  }
  if (input.verificationUniverse.sourceKeys.length !== input.final.bounds.matchedSourceCount ||
    input.verificationUniverse.sourceKeys.length !== input.verificationUniverse.baseline.bounds.matchedSourceCount) {
    throw new Error("VERIFICATION_UNIVERSE_MISMATCH");
  }
  if (input.resultState !== input.final.state || input.plan.state !==
    (input.final.state === "VERIFIED_WITHIN_BOUNDS" ? "VERIFIED" : "FAILED")) {
    throw new Error("RECEIPT_RESULT_STATE_MISMATCH");
  }
  const receipt = {
    ...input,
    limitations: [...new Set([...input.limitations, ...mandatoryLimitations])].sort(),
  };
  const json = canonicalJson(receipt);
  return { digest: canonicalDigest(receipt), json, receipt };
}

export function allowedConclusion(receipt: CanonicalReceipt): string {
  if (receipt.final.state !== "VERIFIED_WITHIN_BOUNDS") {
    return `Verification ${receipt.final.state.toLowerCase()}: ${receipt.final.refusalReasons.join(", ")}`;
  }
  const residual = receipt.final.pairs.filter((pair) => receipt.selectedSourceKeys.includes(pair.sourceKey)).length;
  if (residual === 0) {
    return "Selected incident cleared in the verified proposed-fix graph within displayed bounds.";
  }
  return `${residual} selected-incident source-to-application pairs remain within displayed bounds.`;
}
