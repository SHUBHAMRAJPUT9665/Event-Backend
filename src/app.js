import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from 'cors'
import userRoute from "./routes/user.route.js";
import eventRoute from './routes/event.route.js'
const app = express();

const allowedOrigins = [process.env.FRONTEND_URL];
app.use(cors({
  origin:allowedOrigins,
  credentials: true,
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

//user  routes
app.use("/api/v1/user", userRoute);

// event route
app.use("/api/v1/event",eventRoute)


// all api end points
app.get('/', (req, res) => {
  const apiEndpoints = {
    "User Routes": {
      "POST /api/v1/user/register": "Register a new user",
      "POST /api/v1/user/login": "Login a user",
      "POST /api/v1/user/logout": "Logout a user",
      "POST /api/v1/user/profile": "Get user profile (requires login)",
    },
    "Event Routes": {
      "POST /api/v1/event/create-event": "Create a new event (Admin only)",
      "GET /api/v1/event/participants/:eventId": "Get event participants by event ID",
      "POST /api/v1/event/join/:eventId": "Join an event (requires login)",
      "POST /api/v1/event/cancel-participant/:eventId": "Cancel participation in an event (requires login)",
    }
  };

  res.json({
    message: "Event Management API",
    endpoints: apiEndpoints,
    deployedUrl: "https://event-manage-backend.onrender.com"
  });
});





app.all("*", (req, res) => {
  res.status(404).send("oops ! 404 not found");
});

export { app };
