import express from "express"
import authRouter from "./routes/auth.routes.js"
import { connectDB } from "./lib/db.js"
import cookieParser from 'cookie-parser'
import dotenv from "dotenv"
import cors from 'cors';

dotenv.config()

const app = express()
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(express.json());

app.use(cors({ 
  origin:"http://localhost:5173",
  credentials:true
}))

app.use('/api/auth', authRouter);

app.listen(PORT,() => {
    console.log("Server is running on port: "+ PORT);
  connectDB();
  });