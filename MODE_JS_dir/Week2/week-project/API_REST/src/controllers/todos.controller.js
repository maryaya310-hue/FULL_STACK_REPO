// Import the todos service module, which handles data operations (e.g., database interactions for todos)
const todosService = require("../services/todos.service");

// Helper function to validate if a string is a valid date in YYYY-MM-DD format
// This checks for the correct format and ensures it's a real date (e.g., not 2023-02-30)
const isValidDateString = (s) => {
  // If the string is empty or falsy, return false (invalid)
  if (!s) return false;
  // Use a regex to match the YYYY-MM-DD pattern (4 digits, dash, 2 digits, dash, 2 digits)
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  // If the regex doesn't match, return false
  if (!m) return false;
  // Create a Date object from the string and check if it's a valid Date instance and not NaN
  const d = new Date(s);
  return d instanceof Date && !isNaN(d);
};

// Define allowed priority values as an array for validation
const ALLOWED_PRIORITIES = ["low", "medium", "high"];

// Export the listTodos function to handle GET requests for listing todos with optional filters and pagination
exports.listTodos = async (req, res, next) => {
  try {
    // Destructure query parameters from the request URL (e.g., ?status=all&priority=high&q=search&page=1&limit=10&sort=createdAt:desc)
    // Set default values if not provided
    const { status = "all", priority, q, page = "1", limit = "10", sort = "createdAt:desc" } = req.query;
    // Validate and parse page number: ensure it's at least 1, default to 1 if invalid
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    // Validate and parse limit: ensure it's at least 1, default to 10 if invalid
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    // Create a filters object to pass to the service, including parsed pagination values
    const filters = {
      status,
      priority,
      q,
      page: pageNum,
      limit: limitNum,
      sort
    };

    // Call the service's list method asynchronously to fetch filtered and paginated todos
    const result = await todosService.list(filters);
    // Send the result as a JSON response
    res.json(result);
  } catch (err) {
    // If an error occurs, pass it to the next error-handling middleware
    next(err);
  }
};

// Export the getTodoById function to handle GET requests for a single todo by ID
exports.getTodoById = async (req, res, next) => {
  try {
    // Parse the ID from the URL parameters (e.g., /todos/123) and convert to integer
    const id = parseInt(req.params.id, 10);
    // Check if the parsed ID is not a number (invalid input)
    if (Number.isNaN(id)) return next({ status: 400, message: "Invalid id" });

    // Call the service to fetch the todo by ID
    const todo = await todosService.getById(id);
    // If no todo is found, return a 404 error
    if (!todo) return next({ status: 404, message: "Tâche non trouvée" });

    // Send the found todo as a JSON response
    res.json(todo);
  } catch (err) {
    // Pass any error to the next middleware
    next(err);
  }
};

// Export the createTodo function to handle POST requests for creating a new todo
exports.createTodo = async (req, res, next) => {
  try {
    // Destructure the request body for title, priority (default to "medium"), and dueDate
    const { title, priority = "medium", dueDate } = req.body;

    // Validate title: must exist, be a string, and not empty after trimming
    if (!title || typeof title !== "string" || title.trim() === "") {
      return next({ status: 400, message: "Le champ 'title' est requis et doit être non vide" });
    }
    // Validate priority: if provided, must be one of the allowed values
    if (priority && !ALLOWED_PRIORITIES.includes(priority)) {
      return next({ status: 400, message: `priority doit être une de: ${ALLOWED_PRIORITIES.join(", ")}` });
    }
    // Validate dueDate: if provided, must be a valid YYYY-MM-DD string
    if (dueDate && !isValidDateString(dueDate)) {
      return next({ status: 400, message: "dueDate doit être au format YYYY-MM-DD" });
    }

    // Prepare the payload object with trimmed title, priority, and dueDate (or null if not provided)
    const payload = {
      title: title.trim(),
      priority,
      dueDate: dueDate || null
    };

    // Call the service to create the new todo asynchronously
    const created = await todosService.create(payload);
    // Send the created todo as a JSON response with 201 status (created)
    res.status(201).json(created);
  } catch (err) {
    // Pass any error to the next middleware
    next(err);
  }
};

// Export the updateTodo function to handle PUT/PATCH requests for updating a todo
exports.updateTodo = async (req, res, next) => {
  try {
    // Parse the ID from URL parameters
    const id = parseInt(req.params.id, 10);
    // Validate ID
    if (Number.isNaN(id)) return next({ status: 400, message: "Invalid id" });

    // Define allowed fields for update to prevent unwanted modifications
    const allowedFields = ["title", "completed", "priority", "dueDate"];
    // Get the keys from the request body
    const incomingFields = Object.keys(req.body);
    // Check for any unknown fields not in allowedFields
    const unknown = incomingFields.filter(f => !allowedFields.includes(f));
    // If there are unknown fields, return a 400 error
    if (unknown.length > 0) {
      return next({ status: 400, message: `Champs inconnus: ${unknown.join(", ")}` });
    }

    // Destructure the fields from the request body
    const { title, completed, priority, dueDate } = req.body;

    // Validate title if provided: must be a non-empty string
    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      return next({ status: 400, message: "title doit être une chaîne non vide" });
    }
    // Validate completed if provided: must be a boolean
    if (completed !== undefined && typeof completed !== "boolean") {
      return next({ status: 400, message: "completed doit être boolean" });
    }
    // Validate priority if provided: must be in allowed list
    if (priority !== undefined && !ALLOWED_PRIORITIES.includes(priority)) {
      return next({ status: 400, message: `priority doit être une de: ${ALLOWED_PRIORITIES.join(", ")}` });
    }
    // Validate dueDate if provided: must be valid YYYY-MM-DD or null
    if (dueDate !== undefined && dueDate !== null && !isValidDateString(dueDate)) {
      return next({ status: 400, message: "dueDate doit être au format YYYY-MM-DD ou null" });
    }

    // Build an updateData object only with provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (completed !== undefined) updateData.completed = completed;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    // Call the service to update the todo
    const updated = await todosService.update(id, updateData);
    // If no todo was updated (e.g., ID not found), return 404
    if (!updated) return next({ status: 404, message: "Tâche non trouvée" });

    // Send the updated todo as JSON
    res.json(updated);
  } catch (err) {
    // Pass any error to the next middleware
    next(err);
  }
};

// Export the deleteTodo function to handle DELETE requests for removing a todo
exports.deleteTodo = async (req, res, next) => {
  try {
    // Parse and validate the ID
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return next({ status: 400, message: "Invalid id" });

    // Call the service to delete the todo
    const deleted = await todosService.remove(id);
    // If deletion failed (e.g., ID not found), return 404
    if (!deleted) return next({ status: 404, message: "Tâche non trouvée" });

    // Send a 204 No Content response (successful deletion, no body)
    res.status(204).send();
  } catch (err) {
    // Pass any error to the next middleware
    next(err);
  }
};

// Export the toggleTodo function to handle requests for toggling the completion status of a todo
exports.toggleTodo = async (req, res, next) => {
  try {
    // Parse and validate the ID
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return next({ status: 400, message: "Invalid id" });

    // Call the service to toggle the todo's completion status
    const toggled = await todosService.toggle(id);
    // If toggle failed (e.g., ID not found), return 404
    if (!toggled) return next({ status: 404, message: "Tâche non trouvée" });

    // Send the toggled todo as JSON
    res.json(toggled);
  } catch (err) {
    // Pass any error to the next middleware
    next(err);
  }
};
