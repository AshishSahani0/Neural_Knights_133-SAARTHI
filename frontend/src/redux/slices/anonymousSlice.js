import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  callStatus: "idle", // idle | connecting | matched | chatting | videoCall
  remotePeerId: null,
  roomId: null,
};

const anonymousSlice = createSlice({
  name: "anonymous",
  initialState,
  reducers: {
    setAnonymousStatus: (state, action) => {
      state.callStatus = action.payload;
      if (action.payload === "idle") Object.assign(state, initialState);
    },
    setAnonymousRoomId: (state, action) => { state.roomId = action.payload; },
    setAnonymousRemotePeerId: (state, action) => { state.remotePeerId = action.payload; },
    clearAnonymousSession: (state) => Object.assign(state, initialState),
  },
});

export const { setAnonymousStatus, setAnonymousRoomId, setAnonymousRemotePeerId, clearAnonymousSession } = anonymousSlice.actions;
export default anonymousSlice.reducer;
