// Import the Express framework to create the web server and handle HTTP requests
const express = require("express");
// Import the path module (though not used here, it's often included for file paths)
const path = require("path");

// Import the custom logger middleware for logging requests
const logger = require("./middlewares/logger");
// Import the custom error handler middleware for centralized error handling
const errorHandler = require("./middlewares/errorHandler");
// Import the todos router, which defines the routes for todo operations
const todosRouter = require("./routes/todos.routes");

// Create an Express application instance
const app = express();
// Define the port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON payloads in request bodies
// This allows req.body to contain parsed JSON data
app.use(express.json());

// Apply the custom logger middleware to all routes
// This logs details about each incoming request
app.use(logger);

// Mount the todos router under the "/api/todos" path
// All routes defined in todosRouter will be prefixed with "/api/todos" (e.g., "/api/todos/" for listing)
app.use("/api/todos", todosRouter);

// Apply the error handler middleware after all routes
// This catches any errors passed via next(err) and sends appropriate responses
app.use(errorHandler);

// Optional: Define a simple GET route for the root path ("/") as a health check
// Returns a JSON message indicating the API is running
app.get("/", (req, res) => {
  res.json({ message: "TODO Tracker API is running." });
});

// Start the server and listen on the specified port
// Logs a message to the console when the server starts successfully
app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
