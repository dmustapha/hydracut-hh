import { CommandSurface } from "../../components/command-surface";
import { listIncidentQueue } from "../../db/repository";

export const dynamic = "force-dynamic";

export default async function IncidentsPage() {
  return <CommandSurface incidents={await listIncidentQueue()} />;
}
