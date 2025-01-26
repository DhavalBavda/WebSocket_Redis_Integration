import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { redisPublisher , redisSubscriber } from './Redis.js';


const app = express();
app.use(express.json())

const httpServer = createServer(app);
const io = new Server(httpServer);

// Redis clients
// const redisPublisher = createClient({ url: "redis://localhost:6379" });
// const redisSubscriber = createClient({ url: "redis://localhost:6379" });

// (async () => {
//   await redisPublisher.connect();
//   await redisSubscriber.connect();

  // Subscribe to room messages
  // redisSubscriber.subscribe('room-messages', (message) => {
  //   const { room, content } = JSON.parse(message);
  //   console.log(`Server 2: Received message for room ${room}: ${content}`);

  //   // Broadcast to users in the room
  //   io.to(room).emit('message', content);
  // });

  // io.on('connection', (socket) => {
  //   console.log(`Server 2: Client connected - ${socket.id}`);

  //   // Handle room join
  //   socket.on('joinRoom', (room) => {
  //     socket.join(room);
  //     console.log(`Server 2: Client ${socket.id} joined room ${room}`);
  //   });

  //   // Handle message send
  //   socket.on('message', (room, content) => {
  //     console.log(`Server 2: Received message for room ${room}: ${content}`);

  //     // Publish message to Redis
  //     redisPublisher.publish(
  //       'room-messages',
  //       JSON.stringify({ room, content })
  //     );
  //   });

  //   socket.on('disconnect', () => {
  //     console.log(`Server 2: Client disconnected - ${socket.id}`);
  //   });
  // });

  // console.log('Server 2 running...');
// })();

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log(`Server 1: Client disconnected - ${socket.id}`);
  });

  redisSubscriber.on("message", (channel, message) => {

    if (channel === "notifcation") {
      io.emit("notification-message", message);
    }

  });

});

app.post("/subscribe-to-notifiction", async (req, res) => {
  try {
    redisSubscriber.subscribe('notifcation',(err)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log("Subscribed to notification");
        }
    })
    res.json({ message: "you have subscribed to notifications" });
  } catch (error) {
    console.log(error);
    res.json({ err: error });
  }
});

app.post('/sendNotification',async (req,res)=>{
    try {
      console.log(req.body);
      const { message } = req.body;
      redisPublisher.publish("notifcation", message);
      res.json("200");
    } catch (error) {
      console.log(error);
    }
});

httpServer.listen(3002, () => {
  console.log("Server 2 listening on http://localhost:3002");
});
