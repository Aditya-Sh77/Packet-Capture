import { startSocket } from "./socket";
import { startSniffer } from "./sniffer";
import { start } from "repl";
import { startSuricataReader } from "./suricata";

startSocket(8080);
startSniffer();
startSuricataReader();
