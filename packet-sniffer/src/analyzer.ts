import { v4 as uuid } from "uuid";

import { PATTERNS } from "./patterns";

export function analyze(
  src: string,
  dst: string,
  payload: Buffer | string | null,
  protocol: "TCP" | "UDP"
) {
  if (!payload) return null;

  const text = payload.toString("utf8", 0, 200);
  let reason = "No Pattern Matched";
  const severity = () => {
    for (const p of PATTERNS) {
      if (p.test(text)) {
        reason = `Matched pattern: ${p.toString()}`;
        return "high";
      }
    }
    return "low";
  };

    return {
        id: uuid(),
        time: new Date().toISOString(),
        src,
        dst,
        reason: reason,
        payload_preview: text.toString().slice(0, 50),
        severity: severity(),
        payload_ascii: text.replace(/[^ -~]+/g, '.'),
        raw_hex: payload.toString("hex"),
        payload_label: "unlabeled",
        protocol: protocol,
        src_port: 12345,
        dst_port: 80
      };

}
