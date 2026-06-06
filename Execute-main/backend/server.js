require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174'],
  
  credentials: true
}));

app.use(cookieParser());

const { dbConnect } = require("./config/mongoose-connection");
dbConnect();

const appRoutes = require("./routes/app");

app.get("/", (req, res) => {
  res.send("FraudGuard Backend API is running");
});

app.use("/api", appRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
