import { v4 as uuid } from "uuid";

const PATTERNS = [
  /password/i,
  /token=/i,
  /authorization/i,
  /ssh-rsa/i
];

export function analyze(
  src: string,
  dst: string,
  payload: Buffer | string | null
) {
  if (!payload) return null;

  const text = payload.toString("utf8", 0, 200);
    
//   for (const p of PATTERNS) {
//     if (p.test(text)) {
//         console.log(`Alert: Pattern ${p} matched between ${src} and ${dst}`);
//       return {
//         id: uuid(),
//         time: new Date().toISOString(),
//         src,
//         dst,
//         reason: `Matched ${p}`,
//         payload: text
//       };
//     }
//   }

    return {
        id: uuid(),
        time: new Date().toISOString(),
        src,
        dst,
        reason: "Testing",
        payload_preview: text.toString().slice(0, 50),
        severity: "medium",
        payload_ascii: text.replace(/[^ -~]+/g, '.'),
        raw_hex: payload.toString("hex"),
        payload_label: "Test Payload",
        protocol: "TCP",
        src_port: 12345,
        dst_port: 80
      };

}
