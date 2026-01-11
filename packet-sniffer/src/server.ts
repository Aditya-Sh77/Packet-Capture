import { startSocket } from "./socket";
import { startSniffer } from "./sniffer";
import { start } from "repl";
import { startSuricataReader } from "./suricata";

startSocket(8443);
startSniffer();
startSuricataReader();
