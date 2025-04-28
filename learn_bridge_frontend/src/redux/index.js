import { configureStore } from "@reduxjs/toolkit"
import authReducer from './slices/authSlice'
import courseReducer from "./slices/courseSlice"
import sessionReducer from "./slices/SessionSlice"
import userReducer from "./slices/UserSlice"
import chatReducer from "./slices/ChatSlice"
import adminReducer from "./slices/adminSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    sessions: sessionReducer,
    users: userReducer,
    chat: chatReducer,
    admin: adminReducer,
  },
 })

export default store