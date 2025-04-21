import express from "express"
import {signup,signin,logout,getcurrentUser,updatePassword, updateDetails} from "../controllers/auth.controller.js"

const authRouter = express.Router()



authRouter.post("/signup",signup)
authRouter.post("/signin",signin)
// todo: protect route
authRouter.post("/me",getcurrentUser) 
authRouter.post("/logout",logout)
authRouter.put("/updatepassword",updatePassword)
authRouter.put("/updatedetails",updateDetails)

export default authRouter
