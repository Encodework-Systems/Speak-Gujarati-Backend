// Import required libraries and modules
const express = require("express"); // Import the Express framework
const dotenv = require("dotenv"); // Load environment variables from .env file

dotenv.config(); // Load environment variables from .env file (if present)
const cors = require("cors"); // Enable CORS (Cross-Origin Resource Sharing)
const path = require("path"); // Handle file paths

const axios = require("axios");
const auth = require("./middleware/auth.socket.middleware");
const db = require("./models"); // Database Setup

// Import custom HTTP exception utility
const httpException = require("./utils/httpException.utils");

// Import common utility functions
const commonUtils = require("./utils/common.utils");

// Import internal server error utility
const errorUtils = require("./utils/error.utils");
const {
  setGlobalVariable,
  getGlobalVariable,
} = require("./utils/globalVariable.utils");
setGlobalVariable("isServerStarted", 0);
// Create an Express application
const app = express();

// Choose data parsing method based on encryption setting
if (process.env.IS_ENCRYPT == 1) {
  app.use(express.text()); // If encryption is enabled, expect text data
} else {
  app.use(express.json()); // If encryption is not enabled, expect JSON data
}

// Middleware for handling encryption/decryption

app.use(cors()); // Enable CORS for all routes
app.options("*", cors()); // CORS preflight
app.use(express.static(path.join(__dirname, "../public"))); // Serve static files from the 'public' directory
var isDatabaseConnected = 0;
try {
  // Connect to the database using Mongoose

  console.log(db.url);
  db.mongoose
    .connect(db.url)
    .then(() => {
      console.log("Connected to the database!");
      isDatabaseConnected = 1;
    })
    .catch((err) => {
      console.log("Active Connections:", db.mongoose.connection.readyState);
      console.error("Error connecting to the database:", err);
      process.exit(1); // Terminate the application on database connection failure
    });
} catch (dbError) {
  console.error("Error initializing the database:", dbError);
  process.exit(1); // Terminate the application on database initialization error
}

const port = Number(process.env.PORT || 3000); // Define the server port

// Define routes for user-related API endpoints
var version = "1";
app.use(
  `/api/v` + version + `/user`,
  require("./routes/API/v" + version + "/user.route")
);

// Handle 404 errors by creating an HTTP exception with a status code of 404 ("Endpoint Not Found")
app.all("*", (req, res, next) => {
  const err = new httpException(404, "Endpoint Not Found");
  next(err);
});

// Error handling middleware
app.use(errorUtils);

// const server = http.createServer(app);
// const io = socketIo(server);
// const userSocketMap = new Map(); // Create a Map to store user IDs and their corresponding socket connections

// io.use(async (socket, next) => {
//   const token = socket.handshake.query.token; // Get the token key from the client

//   if (token !== undefined) {
//     // Validate the token and get the user ID

//     const validUser = await isValidUserToken(token);

//     if (validUser) {
//       // If the token is valid, bind the socket to the user ID
//       const socketId = socket.id;

//       if (typeof userSocketMap[validUser["userId"]] !== "undefined") {
//         userSocketMap[validUser["userId"]][validUser["userDeviceId"]] =
//           socketId;
//       } else {
//         userSocketMap[validUser["userId"]] = {};
//         userSocketMap[validUser["userId"]][validUser["userDeviceId"]] =
//           socketId;
//       }

//       socket["userId"] = validUser["userId"];
//       socket["userDeviceId"] = validUser["userDeviceId"];
//       return next(); // Allow the connection
//     }
//   }

//   // If the token is not valid, reject the connection
//   return next(new Error("Authentication failed."));
// });

// io.on("connection", async (socket) => {
//   let userId = socket["userId"];
//   let userDeviceId = socket["userDeviceId"];

//   if (userId != "server") {
//     await db.user.findByIdAndUpdate(userId, {
//       isOnline: true,
//       lastOnlineTime: new Date(),
//     });

//     await db.user.device.findByIdAndUpdate(userDeviceId, {
//       isOnline: true,
//       lastOnlineTime: new Date(),
//     });
//   }

//   socket.on("send-all", (message) => {
//     io.emit("data-all", message);
//   });
//   socket.on("send-admin", (message) => {
//     io.emit("data-admin", message);
//   });

//   socket.on("send-wait-complete-event", (message) => {
//     io.emit("data-wait-complete-event", message);
//   });

//   socket.on("send-event", (message) => {
//     var jsonMessage = JSON.parse(message);
//     console.log(jsonMessage);

//     if (jsonMessage["type"] == "event-started") {
//       var sockets = [];
//       var sendUsers = jsonMessage["sendUsers"];
//       var isSenderR1T1 = jsonMessage["isSenderR1T1"];
//       var displayImages = jsonMessage["displayImages"];
//       delete jsonMessage["sendUsers"];
//       delete jsonMessage["isSenderR1T1"];
//       delete jsonMessage["displayImages"];

//       for (var i = 0; i < sendUsers.length; i++) {
//         sockets = getUserSockets(sendUsers[i]);
//         jsonMessage["isSenderR1T1"] = isSenderR1T1[i];
//         jsonMessage["displayImages"] = displayImages[i];
//         emitDataToSockets(sockets, "data-event", JSON.stringify(jsonMessage));
//       }
//     } else {
//       var sockets = [];
//       var sendUsers = jsonMessage["sendUsers"];
//       var resultImages = jsonMessage["resultImages"];
//       var correctHits = jsonMessage["correctHits"];
//       var userData = jsonMessage["userData"];
//       // var displayImages = jsonMessage['displayImages'];
//       delete jsonMessage["resultImages"];
//       delete jsonMessage["sendUsers"];
//       delete jsonMessage["correctHits"];
//       delete jsonMessage["userData"];

//       for (var i = 0; i < sendUsers.length; i++) {
//         sockets = getUserSockets(sendUsers[i]);
//         jsonMessage["resultImages"] = resultImages[i];
//         jsonMessage["correctHits"] = correctHits[i];
//         jsonMessage["userData"] = userData[i];

//         emitDataToSockets(sockets, "data-event", JSON.stringify(jsonMessage));
//       }
//     }

//     // const sockets = getUsersSockets(jsonMessage['sendUsers']);
//     // delete jsonMessage['sendUsers'];
//     // console.log(jsonMessage);
//     //emitDataToSockets(sockets, 'data-event', JSON.stringify(jsonMessage));
//   });

//   socket.on("send-data-for-logout", (message) => {
//     var jsonMessage = JSON.parse(message);
//     // Retrieve the sockets for the specified user and device
//     const sockets = getUserDeviceSockets(
//       jsonMessage["userId"],
//       jsonMessage["userDeviceId"]
//     );
//     // Iterate through each socket ID and disconnect the corresponding socket
//     sockets.forEach((socketId) => {
//       io.sockets.sockets.forEach((socket) => {
//         // If the given socket ID exists in the list of all sockets, disconnect it
//         if (socket.id === socketId) socket.disconnect(true);
//       });
//     });
//   });

//   // socket.on('send-data', (message) => {
//   //     var jsonMessage = JSON.parse(message);
//   //     const sockets = getUserSockets(jsonMessage['userId']);
//   //     emitDataToSockets(sockets, 'my-data', message);

//   // });

//   // socket.on('my-data', (message) => {
//   //     const sockets = getUserSockets(userId);
//   //     emitDataToSockets(sockets, 'my-data', message);
//   // });

//   // Handle disconnection
//   socket.on("disconnect", async () => {
//     console.log("userDisconnected:" + socket["userId"]);
//     console.log("loginDisconnected:" + socket["userDeviceId"]);

//     await db.user.device.findByIdAndUpdate(socket["userDeviceId"], {
//       isOnline: false,
//       lastOfflineTime: new Date(),
//     });

//     if (typeof userSocketMap[socket["userId"]] !== "undefined") {
//       if (
//         typeof userSocketMap[socket["userId"]][socket["userDeviceId"]] !==
//         "undefined"
//       ) {
//         delete userSocketMap[socket["userId"]][socket["userDeviceId"]];

//         const onlineUserDevices = Object.keys(
//           userSocketMap[socket["userId"]]
//         ).length;
//         if (onlineUserDevices == 0) {
//           await db.user.findByIdAndUpdate(socket["userId"], {
//             isOnline: false,
//             lastOfflineTime: new Date(),
//           });
//         }
//       }
//     }
//   });
// });

// function emitDataToSockets(targetSocketIds, event, data) {
//   targetSocketIds.forEach((targetSocketId) => {
//     console.log(targetSocketId);
//     console.log(data);
//     io.to(targetSocketId).emit(event, data);
//     //console.log(`Message sent to socket ID ${targetSocketId}: ${data}`);
//   });
// }

// function getUserSockets(Id) {
//   Id = Id + "";

//   var userSockets = [];
//   if (typeof userSocketMap[Id] !== "undefined") {
//     for (const userDeviceIdL in userSocketMap[Id]) {
//       userSockets.push(userSocketMap[Id][userDeviceIdL]);
//     }
//   }

//   return userSockets;
// }

// function getUsersSockets(userIdArray) {
//   var userSockets = [];

//   for (var i = 0; i < userIdArray.length; i++) {
//     var Id = userIdArray[i] + "";
//     if (typeof userSocketMap[Id] !== "undefined") {
//       for (const userDeviceIdL in userSocketMap[Id]) {
//         userSockets.push(userSocketMap[Id][userDeviceIdL]);
//       }
//     }
//   }

//   return userSockets;
// }

// function getUserDeviceSockets(Id, userDeviceId) {
//   Id = Id + "";

//   var userSockets = [];
//   if (typeof userSocketMap[Id] !== "undefined") {
//     for (const userDeviceIdL in userSocketMap[Id]) {
//       if (userDeviceIdL == userDeviceId) {
//         userSockets.push(userSocketMap[Id][userDeviceIdL]);
//       }
//     }
//   }

//   return userSockets;
// }

// // Function to validate the user's token and return their user ID
// async function isValidUserToken(token) {
//   if (token == "serverClient4") {
//     var validReturn = {
//       userId: "server",
//       userDeviceId: "server",
//     };

//     return validReturn;
//   }

//   // Implement your validation logic here, such as checking the token against a database
//   // Return the user ID if the token is valid, or null if it's not
//   // Example: Replace this with your actual validation logic
//   var validUser = await auth(token);
//   if (validUser) {
//     var validReturn = {
//       userId: validUser["currentUser"]._id + "",
//       userDeviceId: validUser["currentUserDevice"]._id + "",
//     };
//     return validReturn;
//   } else {
//     return false;
//   }
// }

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
  setGlobalVariable("isServerStarted", 1);
});  
