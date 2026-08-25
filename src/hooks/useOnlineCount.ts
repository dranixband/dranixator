import { useEffect, useState } from "react";
import { socket } from "../services/socket";

// Number of clients currently connected to the server (server-reported).
export function useOnlineCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const onUpdate = (n: number) => setCount(n);
    socket.on("online:update", onUpdate);
    return () => {
      socket.off("online:update", onUpdate);
    };
  }, []);

  return count;
}
