import { useEffect, useRef, useCallback } from "react";
import { WSContext } from "./Contexts";

interface WSContextType {
  ws: React.RefObject<WebSocket | null>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

interface WSContextProviderProps {
  children: React.ReactNode;
}

const WSContextProvider: React.FC<WSContextProviderProps> = ({ children }) => {
  const ws = useRef<WebSocket | null>(null);

  const setupWebSocket = useCallback((socket: WebSocket) => {
    socket.onopen = () => {
      // Connection established
    };
    socket.onclose = () => {
      // Connection closed
    };
    // Optionally handle messages here:
    // socket.onmessage = (event) => { ... };
  }, []);

  const connect = useCallback(async (): Promise<void> => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // Already connected, so do nothing.
      return;
    }
    const url = `${import.meta.env.VITE_WS_URL}`;
    ws.current = new WebSocket(url);
    setupWebSocket(ws.current);
  }, [setupWebSocket]);

  const disconnect = useCallback(async (): Promise<void> => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  useEffect(() => {
    // Cleanup on unmount to close the connection.
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const wsContextData: WSContextType = { ws, connect, disconnect };

  return (
    <WSContext.Provider value={wsContextData}>{children}</WSContext.Provider>
  );
};

export default WSContextProvider;
