import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConnectionState {
  isConnected: boolean; // WebSocket connected
  isNetworkAvailable: boolean; // Internet available
}

const initialState: ConnectionState = {
  isConnected: false,
  isNetworkAvailable: true,
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
    },
    setNetworkAvailable(state, action: PayloadAction<boolean>) {
      state.isNetworkAvailable = action.payload;
    },
  },
});

export const { setConnected, setNetworkAvailable } = connectionSlice.actions;
export default connectionSlice.reducer;
