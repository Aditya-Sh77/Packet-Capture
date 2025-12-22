import { SocketAddress } from "node:net";
import { Server } from "socket.io";

let io: Server;

export function startSocket(port: number) {
  io = new Server(port, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  console.log(`Socket.IO running on http://localhost:${port}`);
}

export function emitAlert(alert: any) {
  if (!io) return;
  console.log("Emitting alert:", alert.id);
  io.emit("alert", alert);
}
