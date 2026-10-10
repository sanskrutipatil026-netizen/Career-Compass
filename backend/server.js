const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const dns = require("dns");

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/feedback", require("./routes/feedback"));

// Skill assessment routes
const skillAssessmentRoutes =
  require("./routes/skillAssessment");

app.use(
  "/api/skill-assessment",
  skillAssessmentRoutes
);

// Interview routes
const interviewRoutes =
  require("./routes/interview");

app.use(
  "/api/interview",
  interviewRoutes
);

// Resume analysis routes
const resumeAnalysisRoutes =
  require("./routes/resumeAnalysis");

app.use(
  "/api/resume-analysis",
  resumeAnalysisRoutes
);


// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error");
    console.log(err);
  });

// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running");
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});