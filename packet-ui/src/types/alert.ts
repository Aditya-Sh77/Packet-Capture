export type AlertSource = "network" | "suricata" | "all";

export type Severity = "low" | "medium" | "high";

export interface Alert {
  id: string;
  time: string;
  source: AlertSource;

  src: string;
  dst: string;
  src_port?: number;
  dst_port?: number;
  protocol?: string;

  severity: Severity;
  reason: string;

  // Optional details (source-specific)
  payload_label?: string;
  payload_preview?: string;
  payload_ascii?: string;
  raw_hex?: string;

  suricata?: {
    signature?: string;
    category?: string;
    rule_id?: number;
  };
}
