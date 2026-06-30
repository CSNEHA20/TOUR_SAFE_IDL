import { configureStore } from '@reduxjs/toolkit';
import safetyReducer from './safetySlice';
import offlineQueueReducer from './offlineQueueSlice';
import connectionReducer from './connectionSlice';

export const store = configureStore({
  reducer: {
    safety: safetyReducer,
    offlineQueue: offlineQueueReducer,
    connection: connectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
