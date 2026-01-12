import { SocketAddress } from "node:net";
import { Server } from "socket.io";
import { readFileSync } from "node:fs";
import path from "node:path";
import * as https from "https";
const express = require("express");


let io: Server | null = null;

export function startSocket(port: number) {
 const app = express();

  const httpsServer = https.createServer({
    key: readFileSync(path.join(process.cwd(), 'certs', 'key.pem')),
    cert: readFileSync(path.join(process.cwd(), 'certs', 'cert.pem'))
  }, app);

  io = new Server(httpsServer, {
    cors: {
      origin: "*"
    }
  });

  httpsServer.listen(port, () => {
    console.log(`Socket.IO running on https://localhost:${port}`);
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

export function emitAlert(alert: any) {
  if (!io) return;
  //console.log("Emitting alert:", alert.id);
  io.emit("alert", alert);
}
