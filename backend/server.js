const express = require('express');
const cors = require('cors');
require("./jobs/monitoringJob");

const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");
const monitoringRoutes = require("./routes/monitoringRoutes");


const app = express();
const PORT = 5000;
const startedAt = Date.now();


// Middleware
app.use(cors()); // Allows frontend (port 5173) to communicate with backend
app.use(express.json()); // Allows parsing JSON data

// Authentication Routes
app.use(
  "/api/auth",
  authRoutes
);
app.use("/api/applications", applicationRoutes);
app.use("/api/monitoring", monitoringRoutes);

// Test API Route
app.get('/api/status', (req, res) => {
  res.json({
    message: "Backend is successfully connected!",
    timestamp: new Date(),
    status: "ACTIVE"
  });
});

app.get('/metrics', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startedAt) / 1000);

  res.set('Content-Type', 'text/plain');
  res.send([
    '# HELP app_monitor_backend_up Backend process availability',
    '# TYPE app_monitor_backend_up gauge',
    'app_monitor_backend_up 1',
    '# HELP app_monitor_backend_uptime_seconds Backend process uptime in seconds',
    '# TYPE app_monitor_backend_uptime_seconds counter',
    `app_monitor_backend_uptime_seconds ${uptimeSeconds}`,
    ''
  ].join('\n'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

