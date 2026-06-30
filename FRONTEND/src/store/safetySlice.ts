import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SafetyStatusType = 'SAFE' | 'ALERT' | 'EMERGENCY';

interface AlertItem {
  id: string;
  title: string;
  timestamp: number;
}

interface SafetyState {
  safetyStatus: SafetyStatusType;
  activeAlerts: AlertItem[];
}

const initialState: SafetyState = {
  safetyStatus: 'SAFE',
  activeAlerts: [],
};

const safetySlice = createSlice({
  name: 'safety',
  initialState,
  reducers: {
    setSafetyStatus(state, action: PayloadAction<SafetyStatusType>) {
      state.safetyStatus = action.payload;
    },
    addAlert(state, action: PayloadAction<AlertItem>) {
      state.activeAlerts.push(action.payload);
      if (state.safetyStatus !== 'EMERGENCY') {
        state.safetyStatus = 'ALERT';
      }
    },
    clearAlerts(state) {
      state.activeAlerts = [];
      if (state.safetyStatus === 'ALERT') {
        state.safetyStatus = 'SAFE';
      }
    },
  },
});

export const { setSafetyStatus, addAlert, clearAlerts } = safetySlice.actions;
export default safetySlice.reducer;
