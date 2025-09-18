const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const logFile = "suspicious_events.log";

// API to log events
app.post("/log", (req, res) => {
  const { event, time } = req.body;
  const logEntry = `[${time}] ${event}\n`;
  fs.appendFileSync(logFile, logEntry);
  console.log("Logged:", logEntry);
  res.json({ success: true });
});

// API to fetch logs
app.get("/logs", (req, res) => {
  if (fs.existsSync(logFile)) {
    const data = fs.readFileSync(logFile, "utf-8");
    res.send(`<pre>${data}</pre>`);
  } else {
    res.send("No logs yet.");
  }
});

// API to generate a proctoring report
app.get("/report", (req, res) => {
  const report = {
    candidateName: "Candidate XYZ",
    interviewDuration: "N/A",
    integrityScore: 100,
    suspiciousEvents: {
      noFace: 0,
      multipleFaces: 0,
      phoneDetected: 0,
    }
  };

  if (fs.existsSync(logFile)) {
    const data = fs.readFileSync(logFile, "utf-8");
    const lines = data.split("\n").filter(line => line.length > 0);

    lines.forEach(line => {
      if (line.includes("No face detected")) {
        report.suspiciousEvents.noFace++;
        report.integrityScore -= 5;
      } else if (line.includes("Multiple faces detected")) {
        report.suspiciousEvents.multipleFaces++;
        report.integrityScore -= 15;
      } else if (line.includes("phone detected")) {
        report.suspiciousEvents.phoneDetected++;
        report.integrityScore -= 20;
      }
    });
  }

  // Ensure the score doesn't drop below 0
  if (report.integrityScore < 0) {
    report.integrityScore = 0;
  }

  res.json(report);
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});