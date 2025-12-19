import { useSocket } from "@/store/context/socketContext";
import React from "react";

function SocketMiddleware({ children }: { children: React.ReactNode }) {
  const { socket } = useSocket();

  return <>{children}</>;
}

export default SocketMiddleware;
