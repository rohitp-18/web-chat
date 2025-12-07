"use client";

import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { useMediaQuery, useTheme, Box } from "@mui/material";
import Header from "@/components/Header";
import { AppDispatch, RootState } from "@/store/store";
import { getAllChats } from "@/store/chatSlice";
import AllChats from "@/components/chat/allChats";
import Chat from "@/components/chat/chats";
import About from "@/components/about";
import ProtectRoute from "@/components/ProtectRoute";

const Home = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const { chat } = useSelector((state: RootState) => state.chat);
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    if (user) {
      dispatch(getAllChats());
    }
  }, [dispatch, user]);

  if (isMobile) {
    return (
      <ProtectRoute>
        <main className="bg-linear-to-br from-gray-100 to-blue-50 h-screen overflow-hidden">
          {user && (
            <>
              <Header chat={chat ? true : false} />
              <main className={`flex w-full h-screen ${chat ? "" : "pb-16"}`}>
                <div className={`${chat ? "hidden" : "flex"} shrink-0 w-full`}>
                  <AllChats />
                </div>
                <div className={`${chat ? "flex flex-1" : "hidden"}`}>
                  {chat && <Chat />}
                </div>
              </main>
            </>
          )}
        </main>
      </ProtectRoute>
    );
  }

  return (
    <ProtectRoute>
      <Box
        sx={{
          display: "flex",
          bgcolor: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          minHeight: "100vh",
        }}
      >
        {user && (
          <>
            <Header />
            <div className="h-screen flex grow overflow-hidden">
              <Box
                sx={{
                  display: { xs: chat ? "none" : "flex", md: "flex" },
                  minWidth: { md: 350 },
                  maxWidth: { xs: "100%", md: 450 },
                  width: { xs: "100%", md: "auto" },
                  flexShrink: 0,
                }}
              >
                <AllChats />
              </Box>
              <div
                className={`grow ${chat ? "flex" : "hidden md:flex h-full"}`}
              >
                {chat ? <Chat /> : <About />}
              </div>
            </div>
          </>
        )}
      </Box>
    </ProtectRoute>
  );
};

export default Home;
