// File: src/domain/sarif.ts
import type { CanonicalReceipt } from "./types";

export function toSarif(receipt: CanonicalReceipt, digest: string): object {
  const rules = receipt.advisories.map((advisory) => ({
    id: advisory.osvId,
    name: `${advisory.packageName}@${advisory.exactVersion}`,
    shortDescription: { text: `OSV advisory ${advisory.osvId}` },
    helpUri: `https://osv.dev/vulnerability/${advisory.osvId}`,
    properties: { aliases: advisory.aliases, cvssVector: advisory.cvssVector },
  }));
  const results = receipt.final.pairs.map((pair) => ({
    ruleId: pair.sourceKey.split(":")[0] ?? "OSV-UNKNOWN",
    level: "warning",
    message: { text: `Dependency-level potential exposure reaches ${pair.applicationKey}.` },
    locations: [{
      physicalLocation: { artifactLocation: { uri: pair.applicationKey } },
    }],
    properties: {
      "hydracut/receiptDigest": digest,
      "hydracut/resultState": receipt.resultState,
      "hydracut/pairKey": `${pair.sourceKey}:${pair.applicationKey}`,
      "hydracut/maxLen": receipt.final.bounds.maxLen,
      "hydracut/pathCount": 1,
    },
  }));
  return {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [{
      tool: { driver: { name: "HydraCut", version: "1.0.0", rules } },
      results,
      properties: { receiptDigest: digest },
    }],
  };
}
