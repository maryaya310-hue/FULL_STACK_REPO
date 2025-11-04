const fetch = require('node-fetch');

async function testAPI() {
    try {
        // Test GET /api/todos
        console.log('\nTesting GET /api/todos');
        const todosResponse = await fetch('http://localhost:3000/api/todos');
        const todos = await todosResponse.json();
        console.log('Response:', todos);

        // Test POST /api/todos to create a new todo
        console.log('\nTesting POST /api/todos');
        const newTodo = {
            title: "Test todo",
            priority: "high",
            dueDate: "2025-12-31"
        };
        const createResponse = await fetch('http://localhost:3000/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTodo)
        });
        const created = await createResponse.json();
        console.log('Created todo:', created);

        // Test PATCH /api/todos/{id}/toggle
        console.log('\nTesting PATCH /api/todos/1/toggle');
        const toggleResponse = await fetch('http://localhost:3000/api/todos/1/toggle', {
            method: 'PATCH'
        });
        const toggled = await toggleResponse.json();
        console.log('Toggled todo:', toggled);

    } catch (error) {
        console.error('Error testing API:', error.message);
    }
}

// Run the tests
testAPI();