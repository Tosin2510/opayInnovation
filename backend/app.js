import express from "express";
import bankRouter from "./routes/bankroutes/auth.js";
import router from "./routes/authroutes/login.js";
import cors from 'cors';
const app = express();
app.use(cors())
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router,'/user')
app.use(bankRouter, "/bank")
// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

export default app;