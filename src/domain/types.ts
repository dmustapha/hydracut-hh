// File: src/domain/types.ts
export const resultStates = [
  "VERIFIED_WITHIN_BOUNDS",
  "PARTIAL",
  "UNKNOWN",
  "ERROR",
] as const;

export type ResultState = (typeof resultStates)[number];
export type Scope = "production" | "development" | "optional" | "peer";
export type JobPhase =
  | "VALIDATE"
  | "FETCH"
  | "HASH"
  | "EXTRACT"
  | "ADVISORY_QUERY"
  | "GRAPH_WRITE"
  | "VERIFY_COUNTS"
  | "TRAVERSE"
  | "COMPARE"
  | "RECEIPT";

export interface SourceStamp {
  source: "github" | "osv" | "cisa-kev" | "first-epss" | "hydradb";
  url: string;
  method: "GET" | "POST";
  apiVersion: string;
  requestTupleSha256: string;
  responseStatus: number;
  etag?: string;
  lastModified?: string;
  retrievedAt: string;
  modifiedAt?: string;
  payloadSha256: string;
  cacheState: "HIT" | "MISS" | "REVALIDATED";
  retryCount: number;
  rateLimitRemaining?: string;
  rateLimitReset?: string;
  errorCode?: string;
  stale: boolean;
}

export interface RepositoryIdentity {
  repository: string;
  commitSha: string;
  manifestBlobSha: string;
  lockfileBlobSha: string;
  manifestSha256: string;
  lockfileSha256: string;
  manifestBytes: number;
  lockfileBytes: number;
  apiVersion: "2026-03-10" | "local-upload-v1";
  source: "github" | "upload";
  sourceStamps: SourceStamp[];
  retrievedAt: string;
}

export interface PackageInstance {
  key: string;
  snapshotKey: string;
  location: string;
  name: string;
  version: string;
  purl: string;
}

export interface DependencyEdge {
  key: string;
  snapshotKey: string;
  fromKey: string;
  toKey: string;
  scope: Scope;
}

export interface ExtractedSnapshot {
  key: string;
  identity: RepositoryIdentity;
  lockfileVersion: 1 | 2 | 3;
  packages: PackageInstance[];
  applicationEdges: DependencyEdge[];
  edges: DependencyEdge[];
  rootPackageKeys: string[];
  maxDepth: number;
  extractionSha256: string;
}

export interface TopologyEvidence {
  snapshotKey: string;
  repository: string;
  packageCount: number;
  relationshipCount: number;
  rootCount: number;
  maxDepth: number;
  extractionSha256: string;
  readbackVerified: true;
  collisionRegistryVerified: true;
}

export interface AdvisoryRangeEvent {
  introduced?: string;
  fixed?: string;
  lastAffected?: string;
  limit?: string;
}

export interface AdvisoryEvidence {
  osvId: string;
  aliases: string[];
  packageName: string;
  ecosystem: "npm";
  exactVersion: string;
  purl: string;
  rangeEvents: AdvisoryRangeEvent[];
  publishedAt: string;
  modifiedAt: string;
  withdrawnAt?: string;
  cvssVector?: string;
  fixedVersions: string[];
  references: string[];
  source: SourceStamp;
}

export interface ExploitationEvidence {
  cve?: string;
  kev: "LISTED" | "NOT_LISTED" | "UNKNOWN";
  kevCatalogVersion?: string;
  epssProbability?: string;
  epssPercentile?: string;
  epssDate?: string;
  sources: SourceStamp[];
}

export interface ExposurePair {
  sourceKey: string;
  applicationKey: string;
  scopes: Scope[];
  witnessNodeKeys: string[];
  witnessRelationshipTypes: string[];
  depth: number;
}

export interface TraversalBounds {
  sourceSelectors: string[];
  targetSelector: string;
  relationshipTypes: string[];
  maxLen: number;
  pathCount: 1;
  resultLimit: number;
  matchedSourceCount: number;
  matchedTargetCount: number;
  expectedPairKeyDigest: string;
}

export interface TraversalReceipt {
  query: string;
  querySha256: string;
  bounds: TraversalBounds;
  pairs: ExposurePair[];
  pairDigest: string;
  pairKeyDigest: string;
  readEpoch: number;
  bookmark: string;
  elapsedMs: number;
  cursorPresent: boolean;
  duplicatePairCount: number;
  state: ResultState;
  refusalReasons: string[];
}

export interface ProposedFixDiscoveryEvidence {
  pullNumber: number;
  actorLogin: string;
  actorType: string;
  headRef: string;
  changedFiles: string[];
  fileListSha256: string;
  sourceStamps: SourceStamp[];
}

export interface ProposedFix {
  key: string;
  repository: string;
  origin: "github-pr" | "github-commit" | "github-branch" | "upload";
  sourceUrl?: string;
  headSha?: string;
  discoveryEvidence?: ProposedFixDiscoveryEvidence;
  manifestSha256: string;
  lockfileSha256: string;
  snapshotKey: string;
  changedPackageCount: number;
  state: ResultState;
}

export interface ProposedFixOutcome {
  proposedFixKey: string;
  removed: string[];
  persistent: string[];
  introduced: string[];
  unknown: string[];
  otherFindings: {
    removed: string[];
    persistent: string[];
    introduced: string[];
  };
  changedPackageCount: number;
}

export interface PlanConstraints {
  requiredFixKeys: string[];
  forbiddenFixKeys: string[];
  maxRepositoryChanges?: number;
}

export interface PortfolioPlan {
  key: string;
  incidentKey: string;
  proposedFixKeys: string[];
  baselinePairKeys: string[];
  baselineSnapshotKeys: string[];
  verificationSourceCoordinates: string[];
  verificationBaselinePairKeys: string[];
  scopes: Scope[];
  predictedResidualPairKeys: string[];
  constraints: PlanConstraints;
  exhaustiveWithinBounds: boolean;
  state: "DRAFT" | "VERIFYING" | "VERIFIED" | "FAILED";
}

export interface JobStatus {
  id: string;
  kind: string;
  phase: JobPhase;
  state: "QUEUED" | "RUNNING" | "COMPLETE" | "FAILED" | "CANCELLED";
  attempt: number;
  errorCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CanonicalReceipt {
  schemaVersion: "1.0.0";
  createdAt: string;
  resultState: ResultState;
  portfolioKey: string;
  incidentKey: string;
  selectedSourceKeys: string[];
  inputs: RepositoryIdentity[];
  topologies: TopologyEvidence[];
  sources: SourceStamp[];
  advisories: AdvisoryEvidence[];
  exploitation: ExploitationEvidence[];
  baseline: TraversalReceipt;
  verificationUniverse: {
    kind: "selected-incident" | "bounded-portfolio";
    sourceKeys: string[];
    baseline: TraversalReceipt;
  };
  final: TraversalReceipt;
  proposedFixes: ProposedFix[];
  outcomes: ProposedFixOutcome[];
  plan: PortfolioPlan;
  hydraDbImageDigest: string;
  graphSchemaVersion: string;
  limitations: string[];
  supersedes?: string;
}
