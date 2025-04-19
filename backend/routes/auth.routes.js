import express from "express"
import {signup,signin,logout,getcurrentUser} from "../controllers/auth.controller.js"

const authRouter = express.Router()



authRouter.post("/signup",signup)
authRouter.post("/signin",signin)
authRouter.post("/logout",logout)

// todo: protect route
authRouter.post("/getcurrentuser",getcurrentUser) 

export default authRouter
