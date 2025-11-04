// Import the promises-based file system module from Node.js for asynchronous file operations
const fs = require("fs").promises;
// Import the path module to handle file paths safely across different operating systems
const path = require("path");

// Define the path to the JSON file where todos data will be stored
// Uses path.join to construct the path relative to the current directory (__dirname), going up one level (..) to the data folder
const DATA_PATH = path.join(__dirname, "..", "data", "todos.json");

// Helper function to read the todos from the JSON file asynchronously
// Returns an array of todos, or an empty array if the file doesn't exist or is invalid
async function readTodos() {
  try {
    // Read the file content as a UTF-8 string
    const raw = await fs.readFile(DATA_PATH, "utf8");
    // Parse the JSON string into a JavaScript object/array
    const arr = JSON.parse(raw);
    // Ensure the parsed data is an array; if not, return an empty array
    if (!Array.isArray(arr)) return [];
    return arr;
  } catch (err) {
    // If the file doesn't exist (ENOENT error), return an empty array (graceful handling)
    if (err.code === "ENOENT") return [];
    // For other errors (e.g., JSON parsing issues), re-throw the error
    throw err;
  }
}

// Helper function to write the todos array to the JSON file asynchronously
// Creates the directory if it doesn't exist
async function writeTodos(todos) {
  // Ensure the directory exists, creating it recursively if needed
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  // Write the todos array to the file as a formatted JSON string (with indentation for readability)
  await fs.writeFile(DATA_PATH, JSON.stringify(todos, null, 2), "utf8");
}

// Helper function to generate the next unique numeric ID for a new todo
// Finds the maximum existing ID and increments it by 1
function nextId(todos) {
  // Use reduce to find the highest ID in the todos array, starting from 0
  const max = todos.reduce((m, t) => (t.id > m ? t.id : m), 0);
  return max + 1;
}

// Helper function to get the current timestamp in ISO format (e.g., "2023-10-01T12:00:00.000Z")
function nowIso() {
  return new Date().toISOString();
}

// Export the list function to retrieve todos with optional filters, search, sorting, and pagination
// Parameters are destructured with defaults
exports.list = async ({ status = "all", priority, q, page = 1, limit = 10, sort = "createdAt:desc" } = {}) => {
  // Read all todos from the file
  let todos = await readTodos();

  // Filter by status: "active" for incomplete, "completed" for done, "all" for no filter
  if (status === "active") todos = todos.filter(t => !t.completed);
  else if (status === "completed") todos = todos.filter(t => !!t.completed);

  // Filter by priority if specified
  if (priority) todos = todos.filter(t => t.priority === priority);

  // Search in title (case-insensitive) if query 'q' is provided
  if (q) {
    const qq = q.toLowerCase();
    todos = todos.filter(t => (t.title || "").toLowerCase().includes(qq));
  }

  // Sort the todos based on the "field:direction" format (e.g., "createdAt:desc")
  if (sort) {
    const [field, dir] = sort.split(":");
    const direction = dir === "asc" ? 1 : -1; // 1 for ascending, -1 for descending
    todos.sort((a, b) => {
      const va = a[field]; // Value of field in todo a
      const vb = b[field]; // Value of field in todo b
      // Handle null/undefined values: nulls are considered "greater" (pushed to end in asc)
      if (va == null && vb == null) return 0;
      if (va == null) return 1 * direction;
      if (vb == null) return -1 * direction;

      // Compare strings lexicographically (e.g., for dates)
      if (typeof va === "string") return va < vb ? -1 * direction : 1 * direction;
      // Compare numbers numerically
      if (typeof va === "number") return (va - vb) * direction;
      return 0; // Default: no change
    });
  }

  // Calculate pagination metadata
  const total = todos.length; // Total number of filtered todos
  const totalPages = Math.max(1, Math.ceil(total / limit)); // Ensure at least 1 page
  const currentPage = Math.min(page, totalPages); // Clamp page to valid range

  // Slice the array for the current page
  const start = (currentPage - 1) * limit;
  const paged = todos.slice(start, start + limit);

  // Return an object with metadata and the paginated data
  return {
    meta: {
      total,
      page: currentPage,
      limit,
      totalPages
    },
    data: paged
  };
};

// Export the getById function to retrieve a single todo by its ID
exports.getById = async (id) => {
  const todos = await readTodos();
  // Find the todo with the matching ID, or return null if not found
  return todos.find(t => t.id === id) || null;
};

// Export the create function to add a new todo
exports.create = async ({ title, priority = "medium", dueDate = null }) => {
  const todos = await readTodos();
  // Generate a new ID
  const id = nextId(todos);
  // Get current timestamp for creation
  const createdAt = nowIso();
  // Create the new todo object with defaults
  const newTodo = {
    id,
    title,
    priority,
    completed: false,
    dueDate: dueDate || null,
    createdAt,
    updatedAt: createdAt // Initially same as createdAt
  };
  // Add to the array and save to file
  todos.push(newTodo);
  await writeTodos(todos);
  return newTodo;
};

// Export the update function to modify an existing todo by ID
exports.update = async (id, updates = {}) => {
  const todos = await readTodos();
  // Find the index of the todo to update
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return null; // Not found

  const todo = todos[idx];
  const now = nowIso();

  // Apply updates only for defined fields (note: there's a syntax error in the original code - "!== " should be "!== undefined")
  if (updates.title !== undefined) todo.title = updates.title;
  if (updates.completed !== undefined) todo.completed = updates.completed;
  if (updates.priority !== undefined) todo.priority = updates.priority;
  if (updates.dueDate !== undefined) todo.dueDate = updates.dueDate;

  // Update the timestamp
  todo.updatedAt = now;
  todos[idx] = todo;
  await writeTodos(todos);
  return todo;
};

// Export the remove function to delete a todo by ID
exports.remove = async (id) => {
  const todos = await readTodos();
  // Find the index
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return false; // Not found
  // Remove from array and save
  todos.splice(idx, 1);
  await writeTodos(todos);
  return true;
};

// Export the toggle function to flip the completion status of a todo
exports.toggle = async (id) => {
  const todos = await readTodos();
  // Find the index
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return null; // Not found
  // Toggle completed status and update timestamp
  todos[idx].completed = !todos[idx].completed;
  todos[idx].updatedAt = nowIso();
  await writeTodos(todos);
  return todos[idx];
};
