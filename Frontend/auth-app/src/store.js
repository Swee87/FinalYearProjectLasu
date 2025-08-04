import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // Using regular localStorage
import authReducer from "./redux/authSlice";
import productReducer from "./Procurement/features/productSlice";
import cartReducer from "./Procurement/features/cartSlice";

const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["isAuthenticated", "user", "isInitialized"], // Include all necessary fields
  version: 1, // Add version for future migrations
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedReducer,
    products: productReducer,
    cart: cartReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);