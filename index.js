const app = require("express")();

const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
  cors: {
    origin: "*", // this allows access from all origins
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.send("server is runnings");
});

io.on("connection", (socket) => {
  // socket is used for real time data transmission that data can be audio messages or video
  socket.emit("me", socket.id);
  socket.on("disconnect", () => {
    socket.broadcast.emit("callended");
  });
  socket.on("calluser", ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit("calluser", { signal: signalData, from, name });
  });
  socket.on("answercall", (data) => {
    io.to(data.to).emit("callaccepted", data.signal);
  });
});

// add the following lines to set the necessary headers on the WebSocket upgrade request
io.engine.on("headers", (headers) => {
  headers.push({
    key: "Access-Control-Allow-Origin",
    value: "*",
  });
  headers.push({
    key: "Access-Control-Allow-Headers",
    value: "Origin, X-Requested-With, Content-Type, Accept",
  });
});

server.listen(PORT, () => {
  console.log("listening on port", PORT);
});
