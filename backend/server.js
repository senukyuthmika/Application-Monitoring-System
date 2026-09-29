const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allows frontend (port 5173) to communicate with backend
app.use(express.json()); // Allows parsing JSON data

// Test API Route
app.get('/api/status', (req, res) => {
  res.json({
    message: "Backend is successfully connected!",
    timestamp: new Date(),
    status: "ACTIVE"
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});