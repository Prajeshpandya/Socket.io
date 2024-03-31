import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  Typography,
  TextField,
  Button,
  Container,
  Box,
  Stack,
} from "@mui/material";

export default function App() {
  //the url of frontend and back same but here its not so its cross origin problem!
  // to solve that we need to add the CORS origin in backend App.js

  //here we use useMemo bcz everytime msg's value change the socket will be changed! so it only change after refresh means its not change after change state of the page!
  const socket = useMemo(() => io("http://localhost:3000",{
    withCredentials:true
  }), []);
  // The useMemo Hook only runs when one of its dependencies update. so here it runs only once

  const [msgArr, setMsgArr] = useState([]);
  const [msg, setMsg] = useState("");
  const [room, setRoom] = useState("");
  const [sId, setSid] = useState("");
  const [joinRoom, setJoinRoom] = useState("");

  //WHEN DATA TRANSFER FOR 1 TO MANY OR ONE TO ALL...
  // const submitHandler = (e) => {
  //   e.preventDefault();
  //   socket.emit("message", `${msg} from ${socket.id}`);
  //   setMsg("");
  // };

  //WHEN DATA TRANSFER FOR 1 TO 1...
  const submitHandler = (e) => {
    e.preventDefault();
    socket.emit("message", { msg, room });
    setMsg("");
  };

  const JoinRoomHandler = (e) => {
    e.preventDefault();
    socket.emit("join-room",joinRoom)
    setJoinRoom("")
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSid(socket.id);
      console.log("connected!", socket.id);
    });

    //here server receive the msg then server return emmit that msg with event "receive-message" and here below we listen that event,
    //we can also do that for broadcast! change .broadcast.emit in serverside!

    // socket.on("receive-message",(data)=>{
    //   console.log(data)
    // })

    //for 1-1 msg transfer...
    socket.on("receive-message", (data) => {
      console.log(data);
      setMsgArr((prev) => [...prev, data]);
    });

    //for room chat!


    //for test the emmits of the server
    // socket.on("welcome",(s)=>{
    //   console.log(s)
    // })

    return () => {
      //the perticular user will disconnect after the save that code means after render once!
      socket.disconnect();
    };
  }, []);

  return (
    <Container maxWidth="sm">
      <Box sx={{ height: 300 }} />
      <Typography varient="h1" component="div" gutterBottom>
        welcome to Socket.io!
      </Typography>
      <Typography varient="h1" component="div" gutterBottom>
        {sId}
      </Typography>

      {/* add this field for room chat */}
      <form onSubmit={JoinRoomHandler}>
        <TextField
          id="outLined-basic"
          onChange={(e) => {
            setJoinRoom(e.target.value);
          }}
          value={joinRoom}
          label="joinRoom"
          varient="outLined"
        />
        <Button type="submit" varient="contained" color="primary">
          Send
        </Button>
      </form>

      {/* for individual chat */}
      <form onSubmit={submitHandler}>
        <TextField
          id="outLined-basic"
          onChange={(e) => {
            setRoom(e.target.value);
          }}
          value={room}
          label="Room"
          varient="outLined"
        />
        <TextField
          id="outLined-basic"
          onChange={(e) => {
            setMsg(e.target.value);
          }}
          value={msg}
          label="message"
          varient="outLined"
        />
        <Button type="submit" varient="contained" color="primary">
          Send
        </Button>
      </form>
      <Stack>
        {msgArr.map((m, i) => (
          <Typography key={i} varient="h6" component="div" gutterBottom>
            {m}
          </Typography>
        ))}
      </Stack>
    </Container>
  );
}
