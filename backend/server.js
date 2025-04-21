import express from "express"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/users.routes.js"
import SessionsRouter from "./routes/sessions.routes.js"
import Coursesrouter from "./routes/courses.routes.js"
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
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
credentials:true
}));

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/sessions', SessionsRouter);
// app.use('/api/messages', require('./src/routes/messages.routes'));
app.use('/api/courses', Coursesrouter);

app.listen(PORT,() => {
    console.log("Server is running on port: "+ PORT);
  connectDB();
  });