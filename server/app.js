import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const port = 3000;

app.get("/", (req, res) => {
  res.send("HELLO WORLD!");
});


const secretKey = "cnskjnjnkj";

app.get("/login", (req, res, next) => {
  const token = jwt.sign({ _id: "dnkjadm" }, secretKey);
  res
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure:true
    })
    .json({
      message: "Login Success",
    });
});

// middleware for authentication!
io.use((socket, next) => {

    cookieParser()(socket.request,socket.request.res,(err)=>{
      if(err) return next(err)
      const token = socket.request.cookies.token

      if(!token) return next(new Error("Authentication error!"))

      const decoded = jwt.verify(token , secretKey)

        next()
    })
});


io.on("connection", (socket) => {
  console.log("User connected!", socket.id);

  socket.on("disconnect", () => {
    console.log("User Dissconnect", socket.id);
  });

  //WHEN DATA TRANSFER FOR 1 TO MANY OR ONE TO ALL...
  // socket.on("message",(data)=>{
  //   console.log(data)
  //   socket.emit("receive-message",data)
  //   // socket.broadcast.emit("receive-message",data)
  // })

  //WHEN DATA TRANSFER FOR 1 TO 1 with room...
  socket.on("message", ({ msg, room }) => {
    io.to(room).emit("receive-message", msg);
    console.log({ msg, room });
  });

  //for joining the room
  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`user ${socket.id} joined room ${room}`);
  });

  //when we need to send perticular socket..
  // socket.emit("welcome",`Welcome to the server ${socket.id}`)

  //when we need to send to broadcast means send to everyone expact self!
  // socket.broadcast.emit( "welcome",`${socket.id} joined the server!`)
});

//make sure here we listen the io_server not app
server.listen(port, () => {
  console.log(`Server is running on port ${port}!`);
});
