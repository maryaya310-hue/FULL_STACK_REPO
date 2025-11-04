// Import the Express framework to create and manage routes
const express = require("express");
// Create a new router instance from Express, which allows grouping related routes
const router = express.Router();

// Import the todos controller module, which contains the handler functions for todo operations
const todosController = require("../controllers/todos.controller");

// Define a GET route for the root path ("/") to list todos with optional filters and pagination
// This maps to the listTodos function in the controller
router.get("/", todosController.listTodos);

// Define a GET route for a specific todo by ID (e.g., "/123")
// The ":id" is a route parameter that captures the ID from the URL
// This maps to the getTodoById function in the controller
router.get("/:id", todosController.getTodoById);

// Define a POST route for the root path to create a new todo
// This maps to the createTodo function in the controller
router.post("/", todosController.createTodo);

// Define a PATCH route for a specific todo by ID to perform a partial update
// PATCH is used for partial updates (unlike PUT for full replacements)
// This maps to the updateTodo function in the controller
router.patch("/:id", todosController.updateTodo);

// Define a DELETE route for a specific todo by ID to remove it
// This maps to the deleteTodo function in the controller
router.delete("/:id", todosController.deleteTodo);

// Define a PATCH route for toggling the completion status of a specific todo (e.g., "/123/toggle")
// This is a custom endpoint for toggling, mapped to the toggleTodo function in the controller
router.patch("/:id/toggle", todosController.toggleTodo);

// Export the router so it can be imported and used in the main app (e.g., app.use("/todos", todosRouter))
module.exports = router;
