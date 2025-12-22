import { Severity } from "../types/alert";

export function severityColor(s: Severity) {
  if (s === "high") return "bg-red-500";
  if (s === "medium") return "bg-yellow-500";
  return "bg-emerald-400";
}
