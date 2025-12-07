"use client";

import { SocketProvider } from "@/store/context/socketContext";
import { store } from "@/store/store";
import { getUser } from "@/store/userSlice";
import React, { useEffect } from "react";
import { Provider } from "react-redux";

function Middleware({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(getUser());
  }, []);

  return (
    <Provider store={store}>
      <SocketProvider>{children}</SocketProvider>
    </Provider>
  );
}

export default Middleware;
