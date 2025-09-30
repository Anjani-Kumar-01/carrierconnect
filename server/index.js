const express = require("express");
const app = express();
const port = 3000;

// DB connection
const connectDB = require("./config/database");
connectDB().catch(err => console.error("DB connection error:", err));

// Middleware
app.use(express.json());

// Routes
const jobRoutes = require("./routes/JobRoutes");
app.use("/api/jobs", jobRoutes);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
  res.send("Hello World!");
});



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
