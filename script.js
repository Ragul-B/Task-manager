// Task Manager App
document.getElementById('add-task-btn').addEventListener('click', addTask);
document.getElementById('search-task').addEventListener('input', filterTasksByTitle);
document.getElementById('filter-all').addEventListener('click', showAllTasks);
document.getElementById('filter-completed').addEventListener('click', filterCompletedTasks);
document.getElementById('filter-pending').addEventListener('click', filterPendingTasks);

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Add a new task
function addTask() {
    const title = document.getElementById('task-title').value;
    const date = document.getElementById('task-date').value;
    const priority = document.getElementById('task-priority').value;
    const category = document.getElementById('task-category').value;

    if (title.trim() === '') {
        alert('Task title cannot be empty!');
        return;
    }

    const task = {
        id: Date.now(),
        title,
        date,
        priority,
        category,
        completed: false,
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    clearForm();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks on the page
function renderTasks(filter = null) {
    const taskGrid = document.getElementById('tasks-grid');
    taskGrid.innerHTML = '';

    let filteredTasks = tasks;

    if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (filter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    }

    filteredTasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');
        taskCard.innerHTML = `
            <h3>${task.title}</h3>
            <p>Due: ${task.date}</p>
            <p>Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
            <p>Category: ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</p>
            <div class="task-actions">
                <button class="btn btn-complete" onclick="toggleTaskCompletion(${task.id})">
                    ${task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                </button>
                <button class="btn btn-delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskGrid.appendChild(taskCard);
    });

    updateAnalytics();
}

// Toggle task completion
function toggleTaskCompletion(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveTasks();
    renderTasks();
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Search for tasks by title
function filterTasksByTitle() {
    const searchTerm = document.getElementById('search-task').value.toLowerCase();
    const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchTerm));
    renderFilteredTasks(filteredTasks);
}

// Render filtered tasks based on search
function renderFilteredTasks(filteredTasks) {
    const taskGrid = document.getElementById('tasks-grid');
    taskGrid.innerHTML = '';

    filteredTasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');
        taskCard.innerHTML = `
            <h3>${task.title}</h3>
            <p>Due: ${task.date}</p>
            <p>Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</p>
            <p>Category: ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</p>
            <div class="task-actions">
                <button class="btn btn-complete" onclick="toggleTaskCompletion(${task.id})">
                    ${task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                </button>
                <button class="btn btn-delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskGrid.appendChild(taskCard);
    });
}

// Show all tasks
function showAllTasks() {
    renderTasks();
}

// Filter completed tasks
function filterCompletedTasks() {
    renderTasks('completed');
}

// Filter pending tasks
function filterPendingTasks() {
    renderTasks('pending');
}

// Update task analytics
function updateAnalytics() {
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = tasks.filter(task => !task.completed).length;

    document.getElementById('completed-count').innerText = completedTasks;
    document.getElementById('pending-count').innerText = pendingTasks;
}

// Clear the task form after adding a task
function clearForm() {
    document.getElementById('task-title').value = '';
    document.getElementById('task-date').value = '';
    document.getElementById('task-priority').value = 'low';
    document.getElementById('task-category').value = 'work';
}

// Initial rendering of tasks
renderTasks();
