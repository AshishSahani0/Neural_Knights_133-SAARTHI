import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import instituteReducer from "./slices/instituteSlice.js";
import studentsReducer from "./slices/studentsSlice.js";
import psychologistReducer from "./slices/psychologistSlice.js";
import userReducer from "./slices/userSlice.js";
import bookingReducer from "./slices/bookingSlice";
import mainAdminReducer from "./slices/mainAdminSlice";
import chatReducer from "./slices/chatSlice";
import videoReducer from "./slices/videoSlice";
import anonymousReducer from "./slices/anonymousSlice";
import journalReducer from "./slices/journalSlice";
import emergencyReducer from "./slices/emergencySlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    mainAdmin: mainAdminReducer,
    institute: instituteReducer,
    students: studentsReducer,
    psychologist: psychologistReducer,
    user: userReducer,
    bookings: bookingReducer,
    chat: chatReducer,
    video: videoReducer,
    anonymous: anonymousReducer,
    journal: journalReducer,
    emergency: emergencyReducer,


  },
});

export default store;

