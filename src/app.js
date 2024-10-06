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

app.use("/api/v1/event",eventRoute)


app.all("*", (req, res) => {
  res.status(404).send("oops ! 404 not found");
});

export { app };
