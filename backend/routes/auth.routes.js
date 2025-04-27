import express from "express"
import {signup,signin,logout,getcurrentUser,updatePassword, updateDetails} from "../controllers/auth.controller.js"

import {protect} from "../middlewares/auth.middleware.js"
const authRouter = express.Router()



authRouter.post("/signup",signup)
authRouter.post("/signin",signin)

authRouter.post("/me",protect,getcurrentUser) 
authRouter.post("/logout",protect,logout)
authRouter.put("/updatepassword",protect,updatePassword)
authRouter.put("/updatedetails",protect,updateDetails)

export default authRouter
