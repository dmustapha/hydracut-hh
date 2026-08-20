import { notFound } from "next/navigation";
import { canonicalDigest } from "../../../domain/canonical";
import { ReceiptView } from "../../../components/receipt-view";
import { findReceipt } from "../../../db/repository";

export const dynamic = "force-dynamic";

export default async function ProofPage({ params }: { params: Promise<{ digest: string }> }) {
  const { digest } = await params;
  const row = await findReceipt(digest);
  if (!row) notFound();
  const recomputed = canonicalDigest(row.receipt);
  if (recomputed !== digest) throw new Error("RECEIPT_DIGEST_MISMATCH");
  return <ReceiptView digest={digest} receipt={row.receipt} />;
}
