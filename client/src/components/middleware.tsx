"use client";

import { SocketProvider } from "@/store/context/socketContext";
import { store } from "@/store/store";
import { getUser } from "@/store/userSlice";
import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import React, { useEffect, useMemo } from "react";
import { Provider } from "react-redux";

function Middleware({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(getUser());
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        breakpoints: {
          values: {
            xs: 0,
            sm: 600,
            md: 800,
            lg: 1200,
            xl: 1536,
          },
        },
      }),
    []
  );

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SocketProvider>{children}</SocketProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default Middleware;
