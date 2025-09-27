import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  callStatus: "idle", // idle | ready | calling | receiving | connected | ended
  offer: null,
  answer: null,
  iceCandidates: [],
  callError: null,
  peerId: null,
  remotePeerId: null,
};

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    setCallStatus: (state, action) => {
      state.callStatus = action.payload;
      if (action.payload === "ended" || action.payload === "idle") {
        Object.assign(state, initialState);
      }
    },
    setOffer: (state, action) => { state.offer = action.payload; },
    setAnswer: (state, action) => { state.answer = action.payload; },
    addIceCandidate: (state, action) => {
      if (
        action.payload?.candidate &&
        !state.iceCandidates.some((c) => c.candidate === action.payload.candidate)
      ) {
        state.iceCandidates.push(action.payload);
      }
    },
    setCallError: (state, action) => { state.callError = action.payload; },
    setPeerId: (state, action) => { state.peerId = action.payload; },
    setRemotePeerId: (state, action) => { state.remotePeerId = action.payload; },
    clearVideoCall: (state) => { Object.assign(state, initialState); },
  },
});

export const {
  setCallStatus,
  setOffer,
  setAnswer,
  addIceCandidate,
  setCallError,
  setPeerId,
  setRemotePeerId,
  clearVideoCall,
} = videoSlice.actions;

export default videoSlice.reducer;