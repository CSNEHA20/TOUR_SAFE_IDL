import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OfflineQueueState {
  pendingCount: number;
  isSyncing: boolean;
}

const initialState: OfflineQueueState = {
  pendingCount: 0,
  isSyncing: false,
};

const offlineQueueSlice = createSlice({
  name: 'offlineQueue',
  initialState,
  reducers: {
    setPendingCount(state, action: PayloadAction<number>) {
      state.pendingCount = action.payload;
    },
    incrementPendingCount(state) {
      state.pendingCount += 1;
    },
    decrementPendingCount(state) {
      if (state.pendingCount > 0) {
        state.pendingCount -= 1;
      }
    },
    setSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
    },
  },
});

export const { setPendingCount, incrementPendingCount, decrementPendingCount, setSyncing } = offlineQueueSlice.actions;
export default offlineQueueSlice.reducer;
