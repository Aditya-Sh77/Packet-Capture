import fs from "fs";
import { emitAlert } from "./socket";

const EVE_PATH = "/var/log/suricata/eve.json";

export function startSuricataReader() {
  let fileSize = 0;

  // Initialize size
  try {
    fileSize = fs.statSync(EVE_PATH).size;
  } catch {
    console.error("Cannot stat eve.json");
    return;
  }

  console.log("Suricata reader watching eve.json");

  fs.watch(EVE_PATH, (event) => {
    if (event !== "change") return;

    const stats = fs.statSync(EVE_PATH);
    if (stats.size <= fileSize) return;

    const stream = fs.createReadStream(EVE_PATH, {
      start: fileSize,
      end: stats.size,
      encoding: "utf8"
    });

    fileSize = stats.size;

    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk;
      let lines = buffer.split("\n");
      buffer = lines.pop()!;

      for (const line of lines) {
        processLine(line);
      }
    });
  });
}

function processLine(line: string) {
  try {
    const event = JSON.parse(line);
    if (event.event_type !== "alert") return;

    console.log("SURICATA ALERT:", event);

    emitAlert({
      id: event.flow_id.toString(),
      time: event.timestamp,
      source: "suricata",
      src: event.src_ip,
      dst: event.dest_ip,
      src_port: event.src_port,
      dst_port: event.dest_port,
      protocol: event.proto,
      payload_preview: event.alert.http?.toString() || null, 
      severity:
        event.alert.severity === 1
          ? "high"
          : event.alert.severity === 2
          ? "medium"
          : "low",
      reason: `Signature ${event.alert.signature}, Category: ${event.alert.category}`,
      suricata: {
        rule_id: event.alert.signature_id,
        category: event.alert.category
      }
    });
  } catch {
    console.log("Malformed Suricata line");
    // ignore partial or malformed lines
  }
}
