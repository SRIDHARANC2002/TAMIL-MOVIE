import { configureStore } from "@reduxjs/toolkit";
import watchListSlice from "./Slices/watchlist";
import registerationSlice from "./Slices/registeration";
import authSlice from "./Slices/auth";

export const store = configureStore({
  reducer: {
    watchList: watchListSlice,
    registeration: registerationSlice,
    auth: authSlice,
  },
});
