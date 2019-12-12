import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import api from "./api/api";

mongoose.connect("mongodb://127.0.0.1:27017/Cargo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("error", (err) => {
  console.log(`Mongoose default connection error: ${err}`);
  process.exit(1);
});

const app = express();
const port = 4000;
app.use(
  cors({
    origin: "http://localhost:3000",
  }),
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", api);
const server = app.listen(port, () => {
  console.log("App listening ");
});
