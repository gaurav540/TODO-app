const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON in request bodies

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the tasks database.');
});

// Create tasks table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL CHECK (completed IN (0, 1))
)`);

// --- API Routes ---

// GET: Fetch all tasks
app.get('/tasks', (req, res) => {
    const sql = "SELECT * FROM tasks ORDER BY id DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// POST: Create a new task
app.post('/tasks', (req, res) => {
    const { title } = req.body;
    if (!title) {
        res.status(400).json({ "error": "Title is required" });
        return;
    }
    const sql = 'INSERT INTO tasks (title, completed) VALUES (?, ?)';
    db.run(sql, [title, 0], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, title: title, completed: 0 }
        });
    });
});

// PUT: Update a task (mark as complete/incomplete)
app.put('/tasks/:id', (req, res) => {
    const { completed } = req.body;
    const sql = 'UPDATE tasks SET completed = ? WHERE id = ?';
    db.run(sql, [completed, req.params.id], function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ message: "success", changes: this.changes });
    });
});

// DELETE: Delete a task
app.delete('/tasks/:id', (req, res) => {
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.run(sql, req.params.id, function(err) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});