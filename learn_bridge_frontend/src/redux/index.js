import { configureStore } from "@reduxjs/toolkit"
import authReducer from './slices/authSlice'
import courseReducer from "./slices/courseSlice"
import sessionReducer from "./slices/SessionSlice"
import userReducer from "./slices/UserSlice"
import chatReducer from "./slices/ChatSlice"
// import adminReducer from "./admin/adminSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    sessions: sessionReducer,
    users: userReducer,
    chat: chatReducer,
    // admin: adminReducer,
  },
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: {
  //       // Ignore these action types
  //       ignoredActions: ["chat/connectSocket/fulfilled"],
  //       // Ignore these field paths in all actions
  //       ignoredActionPaths: ["payload.socket", "meta.arg.socket"],
  //       // Ignore these paths in the state
  //       ignoredPaths: ["chat.socket"],
  //     },
  //   }),
})

export default store