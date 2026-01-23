import fs from "fs";
import { execSync, spawn } from "child_process";
import { emitAlert } from "./socket";

const EVE_PATH = "/var/log/suricata/eve.json";

function isSuricataRunning(): boolean {
  try {
    execSync("pgrep -x suricata", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function startSuricataService() {
  if (isSuricataRunning()) {
    console.log("Suricata service is already running");
    return;
  }

  console.log("Starting Suricata service...");
  try {
    // Remove stale pidfile if it exists
    try {
      execSync("rm -f /var/run/suricata.pid /run/suricata.pid");
    } catch (e) {
      // ignore
    }

    // Start suricata service with proper config override and custom pidfile
    const proc = spawn("sudo", [
      "suricata",
      "-c", "/etc/suricata/suricata.yaml",
      "-i", "wlp0s20f3",
      "-l", "/var/log/suricata",
      "-D",
      "--pidfile", "/tmp/suricata.pid"
    ], {
      stdio: "inherit"  // Show all output in terminal
    });

    proc.on("error", (err) => {
      console.error("Failed to spawn Suricata:", err);
    });

    proc.on("exit", (code) => {
      console.log("Suricata exited with code:", code);
    });

    // Wait a moment for service to start
    setTimeout(() => {
      console.log("Suricata service started");
    }, 2000);
  } catch (error) {
    console.error("Failed to start Suricata service:", error);
  }
}

export function startSuricataReader() {
  // First, try to start the service
  startSuricataService();

  let fileSize = 0;
  let retries = 0;
  const maxRetries = 10;

  function initializeReader() {
    try {
      fileSize = fs.statSync(EVE_PATH).size;
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
    } catch (error) {
      if (retries < maxRetries) {
        retries++;
        console.log(`eve.json not ready, retrying... (${retries}/${maxRetries})`);
        setTimeout(initializeReader, 1000);
      } else {
        console.error("Could not initialize Suricata reader after retries");
      }
    }
  }

  initializeReader();
}

function processLine(line: string) {
  try {
    const event = JSON.parse(line);
    if (event.event_type !== "alert") return;

    console.log("SURICATA ALERT GENERATED");

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
  } catch (error) {
    console.error("Error processing Suricata line:", error instanceof Error ? error.message : error);
    console.error("Line was:", line);
  }
}
