require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://fraud-guard-v2-9gd7.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const envOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",").map(item => item.trim())
      : [];

    const allOrigins = [...allowedOrigins, ...envOrigins];

    const isAllowed = allOrigins.some(allowed => {
      return origin === allowed || origin === allowed.replace(/\/$/, "");
    }) || origin.endsWith('.vercel.app');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
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
