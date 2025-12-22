import { useEffect, useRef } from "react";
import { Alert } from "../types/alert";

export function useAlertsStream(
  enabled: boolean,
  onAlert: (a: Alert) => void
) {
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    // TEMP: raw WebSocket
    const ws = new WebSocket("ws://127.0.0.1:8080");

    ws.onopen = () => {
      console.log("Connected to backend");
    };

    ws.onmessage = (ev) => {
      if (!enabledRef.current) return;

      const msg = JSON.parse(ev.data);
      if (msg.type === "alert") {
        onAlert(msg.data);
      }
    };

    ws.onerror = () => {
      console.error("WS error");
    };

    return () => ws.close();
  }, []);
}
