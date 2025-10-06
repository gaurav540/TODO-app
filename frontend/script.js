// IMPORTANT: In a local environment, your backend is at http://localhost:3000
// When you deploy, you will change this to your live Render URL.
const API_URL = 'http://localhost:3000';

const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

// Function to fetch all tasks from the backend and display them
async function fetchTasks() {
    const response = await fetch(`${API_URL}/tasks`);
    const { data } = await response.json();
    taskList.innerHTML = ''; // Clear the list before adding new items
    data.forEach(task => {
        addTaskToDOM(task);
    });
}

// Function to add a single task to the DOM
function addTaskToDOM(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;
    if (task.completed) {
        li.classList.add('completed');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id, !task.completed));

    const span = document.createElement('span');
    span.textContent = task.title;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

// Function to add a new task
async function addTask() {
    const title = taskInput.value.trim();
    if (!title) return;

    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
    });
    const { data } = await response.json();
    addTaskToDOM(data);
    taskInput.value = '';
}

// Function to toggle task completion status
async function toggleTaskCompletion(id, completed) {
    await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: completed ? 1 : 0 }),
    });
    fetchTasks(); // Refresh the list to show the change
}

// Function to delete a task
async function deleteTask(id) {
    await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
    });
    fetchTasks(); // Refresh the list
}

// Event Listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// Initial fetch of tasks when the page loads
fetchTasks();