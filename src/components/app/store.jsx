import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from 'redux';
import authReducer from '../features/AuthSlice';
import sondageReducer from '../features/SondageSlices';

const rootReducer = combineReducers({
  auth: authReducer,
  sondage: sondageReducer,
});

const persistedReducer = persistReducer(
  {
    key: "root",
    storage,
    whitelist: ["auth", "sondage"],
  },
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
