import express from "express"
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/users.routes.js"
import SessionsRouter from "./routes/sessions.routes.js"
import Coursesrouter from "./routes/courses.routes.js"
import reviewRouter from "./routes/reviews.routes.js"
import { connectDB } from "./lib/db.js"
import cookieParser from 'cookie-parser'
import dotenv from "dotenv"
import cors from 'cors';
import initializeSocket from "./socket/socket.js"
import http from "http"
import messageRouter from "./routes/messages.routes.js"
import AdminRouter from "./routes/admin.routes.js"


dotenv.config()

const app = express()
const PORT = process.env.PORT;

const server = http.createServer(app);
const io = initializeSocket(server);

global.io = io;

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
app.use('/api/reviews', reviewRouter);
app.use('/api/courses', Coursesrouter);
app.use('/api/messages', messageRouter);
app.use('/api/admin',AdminRouter)

server.listen(PORT,() => {
    console.log("Server is running on port: "+ PORT);
  connectDB();
});