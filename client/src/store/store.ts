import { configureStore } from "@reduxjs/toolkit";

import userSlice from "./userSlice";
import chatSlice from "./chatSlice";
import notificationSlice from "./notificationSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    chat: chatSlice,
    notification: notificationSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
