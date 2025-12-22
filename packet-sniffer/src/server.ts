import { startSocket } from "./socket";
import { startSniffer } from "./sniffer";

startSocket(8080);
startSniffer();
