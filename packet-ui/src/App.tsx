import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Alert } from "./types/alert";
import { severityColor } from "./utils/severity";

/* =======================
   App
======================= */
export default function App() {
  /* ---- state ---- */
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selected, setSelected] = useState<Alert | null>(null);
  const [capture, setCapture] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  /* ---- refs (for streaming correctness) ---- */
  const alertsRef = useRef<Alert[]>([]);
  const captureRef = useRef<boolean>(capture);
  const socketRef = useRef<Socket | null>(null);

  /* =======================
     Effects
  ======================= */

  // keep capture ref synced
  useEffect(() => {
    captureRef.current = capture;
  }, [capture]);

  // keep alerts ref synced
  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  //dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // WebSocket connection (transport isolated)
  useEffect(() => {
    const socket = io("https://localhost:8443", {
      transports: ["websocket"]
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket.io backend ✅");
    });

    socket.on("alert", (alert) => {
      console.log("Received alert:", alert.id);
      if (!captureRef.current) return;

      const next = [alert, ...alertsRef.current].slice(0, 1000);
      alertsRef.current = next;
      setAlerts(next);
      setSelected(prev => prev ?? alert);
    });

    socket.on("disconnect", () => {
      console.log("socket.io disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* =======================
     UI
  ======================= */
  return (
    <div className="flex h-screen font-sans bg-white dark:bg-gray-900 text-black dark:text-white">
      {/* ================= Sidebar ================= */}
      <div className="w-[30%] border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Packet Alerts</h2>
          <button
            onClick={() => setDarkMode((dark) => !dark)}

            className="px-3 py-1 rounded-lg text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <section className="flex justify-center items-center">
          <button
            className="px-3 py-1 rounded-lg text-sm mt-3 mb-3 mr-10 w-[30%] bg-gray-200 hover:bg-gray-300 hover:cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() => setCapture((c) => !c)}
          >
            {capture ? "Stop Capture" : "Start Capture"}
          </button>

          <button
            className="px-3 py-1 rounded-lg text-sm mt-3 mb-3 w-[30%] bg-gray-200 hover:bg-gray-300 hover:cursor-pointer dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() => {
              socketRef.current?.send(JSON.stringify({ type: "clear" }));
              alertsRef.current = [];
              setAlerts([]);
              setSelected(null);
            }}
          >
            Clear alerts
          </button>
        </section>

        <div className="text-gray-500 dark:text-gray-400 text-sm mb-3">
          Live stream — {alerts.length} alerts
        </div>

        <div className="overflow-y-auto flex-1 space-y-2">
          {alerts.map((al) => (
            <div
              key={al.id}
              onClick={() => setSelected(al)}
              className={`${selected?.id === al.id ? 'bg-gray-300 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'} hover:bg-gray-300 dark:hover:bg-gray-700 rounded-xl p-3 shadow-sm cursor-pointer flex justify-between items-center`}
            >
              <div>
                <div className="font-semibold">
                  {al.src}:{al.src_port} → {al.dst}:{al.dst_port}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {al.payload_preview?.slice(0, 20) || "<no preview>"}
                </div>
                <div className="text-xs text-gray-400">{al.time}</div>
              </div>
              <span
                className={`text-xs text-white px-2 py-1 rounded-full ${severityColor(
                  al.severity
                )}`}
              >
                {al.severity.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Detail View ================= */}
      <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-black">
        {!selected ? (
          <div className="text-gray-500">
            <h3 className="text-lg font-semibold">No alert selected</h3>
            <p>Click an alert on the left to inspect details.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex justify-between">
              <h3 className="text-lg font-semibold">Alert: {selected.id}</h3>
              <div className="text-xs text-gray-400">{selected.time}</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="font-semibold">Src</div>
                <div>{selected.src}:{selected.src_port}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="font-semibold">Dst</div>
                <div>{selected.dst}:{selected.dst_port}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="font-semibold">Protocol</div>
                <div>{selected.protocol}</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Reason</h4>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                {selected.reason}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-1">Payload preview</h4>
              {selected.payload_label === "TLS/ENCRYPTED" ? (
                <>
                  <span className="p-2 rounded bg-yellow-100 dark:bg-yellow-800 text-sm">
                    Encrypted TLS payload
                  </span>
                  <button
                    className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                    onClick={() => setShowPreview((p) => !p)}
                  >
                    Show Anyway
                  </button>
                  {showPreview && (
                    <pre className="mt-2 bg-slate-900 text-slate-200 p-3 rounded">
                      {selected.payload_preview}
                    </pre>
                  )}
                </>
              ) : selected.payload_label === "EMPTY" ? (
                <div className="p-3 bg-gray-50 rounded">No payload</div>
              ) : (
                <pre className="bg-slate-900 text-slate-200 p-3 rounded">
                  {selected.payload_ascii}
                </pre>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-1">Raw hex</h4>
              <pre className="bg-black text-green-400 p-3 rounded text-xs">
                {selected.raw_hex}
              </pre>
            </div>

            <div className="flex gap-2">
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded"
                onClick={() => {
                  socketRef.current?.send(
                    JSON.stringify({ type: "ack", id: selected.id })
                  );
                }}
              >
                Acknowledge
              </button>

              <button
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                onClick={() =>
                  navigator.clipboard.writeText(
                    JSON.stringify(selected, null, 2)
                  )
                }
              >
                Copy JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
