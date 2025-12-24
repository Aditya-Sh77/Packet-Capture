const Cap = require("cap").Cap;
const decoders = require("cap").decoders;
const PROTOCOL = decoders.PROTOCOL;

import { analyze } from "./analyzer";
import { emitAlert } from "./socket";

console.log("Packet Sniffer Starting...");

export function startSniffer() {
    const cap = new Cap();
    const devices = Cap.deviceList();

    console.log("Available devices:", devices.map((d: any) => d.name));

    if (!devices.length) {
        console.error("No capture devices found");
        process.exit(1);
    }

    const device = devices[0].name;
    const filter = "tcp or udp";
    const bufSize = 10 * 1024 * 1024;
    const buffer = Buffer.alloc(65535);

    cap.open(device, filter, bufSize, buffer);
    console.log("Sniffing on", device);

    cap.on("packet", (nbytes: number) => {
        try {
            let ret = decoders.Ethernet(buffer);
            
            if (ret.info.type !== PROTOCOL.ETHERNET.IPV4) {
                console.log("Unsupported Ethertype:", ret.info.type);
                return;
            }

            ret = decoders.IPV4(buffer, ret.offset);
            const src = ret.info.srcaddr;
            const dst = ret.info.dstaddr;

            if (ret.info.protocol === PROTOCOL.IP.TCP) {
                const tcp = decoders.TCP(buffer, ret.offset);
                const payloadOffset = tcp.offset;
                const payload = buffer.slice(payloadOffset, nbytes);
                const alert = analyze(src, dst, payload, "TCP");
                if (alert) emitAlert(alert);
            }else if (ret.info.protocol === PROTOCOL.IP.UDP) {
                const udp = decoders.UDP(buffer, ret.offset);
                const payloadOffset = udp.offset;
                const payload = buffer.slice(payloadOffset, nbytes);
                const alert = analyze(src, dst, payload, "UDP");
                if (alert) emitAlert(alert);
            }
        } catch {
            console.log("Error decoding packet");
            // malformed packets happen
        }
    });
}
