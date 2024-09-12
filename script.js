// Initialize tasks from localStorage or an empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Initialize sortable functionality
Sortable.create(document.getElementById('tasks-grid'), {
    onEnd: function(event) {
        const movedTask = tasks[event.oldIndex];
        tasks.splice(event.oldIndex, 1);
        tasks.splice(event.newIndex, 0, movedTask);
        saveTasks();
        renderTasks();
    }
});

// Event listeners for form actions and filters
document.getElementById('add-task-btn').addEventListener('click', addTask);
document.getElementById('search-task').addEventListener('input', filterTasksByTitle);
document.getElementById('filter-today').addEventListener('click', filterDueToday);
document.getElementById('filter-week').addEventListener('click', filterDueThisWeek);
document.getElementById('sort-priority').addEventListener('click', sortByPriority);

// Add a new task
function addTask() {
    const title = document.getElementById('task-title').value.trim();
    const date = document.getElementById('task-date').value;
    const priority = document.getElementById('task-priority').value;
    const category = document.getElementById('task-category').value;

    if (title === '') {
        alert('Task title cannot be empty!');
        return;
    }

    const task = {
        id: Date.now(),
        title,
        date,
        priority,
        category,
        completed: false
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    clearForm();
    notifyDueTasks();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks on the page
function renderTasks(filter = 'all') {
    const taskGrid = document.getElementById('tasks-grid');
    taskGrid.innerHTML = '';

    let filteredTasks = tasks;

    if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (filter === 'pending') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filteredTasks = tasks.filter(task => task.date === today);
    } else if (filter === 'week') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
        filteredTasks = tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate >= startOfWeek && taskDate <= endOfWeek;
        });
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
                <button class="btn btn-edit" onclick="editTask(${task.id})">Edit</button>
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

// Toggle task completion status
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

// Search tasks by title
function filterTasksByTitle() {
    const searchTerm = document.getElementById('search-task').value.toLowerCase();
    const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchTerm));
    renderFilteredTasks(filteredTasks);
}

// Render filtered tasks
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
                <button class="btn btn-edit" onclick="editTask(${task.id})">Edit</button>
                <button class="btn btn-complete" onclick="toggleTaskCompletion(${task.id})">
                    ${task.completed ? 'Mark as Pending' : 'Mark as Completed'}
                </button>
                <button class="btn btn-delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskGrid.appendChild(taskCard);
    });
}

// Filter tasks by category
function filterByCategory(category) {
    if (category === 'all') {
        renderTasks();
    } else {
        const filteredTasks = tasks.filter(task => task.category === category);
        renderFilteredTasks(filteredTasks);
    }
}

// Filter tasks due today
function filterDueToday() {
    renderTasks('today');
}

// Filter tasks due this week
function filterDueThisWeek() {
    renderTasks('week');
}

// Sort tasks by priority
function sortByPriority() {
    tasks.sort((a, b) => {
        const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    saveTasks();
    renderTasks();
}

// Update task analytics
function updateAnalytics() {
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = tasks.filter(task => !task.completed).length;

    document.getElementById('completed-count').innerText = completedTasks;
    document.getElementById('pending-count').innerText = pendingTasks;
}

// Notify user about tasks close to their due dates
function notifyDueTasks() {
    const now = new Date();
    tasks.forEach(task => {
        const taskDate = new Date(task.date);
        const daysLeft = Math.ceil((taskDate - now) / (1000 * 60 * 60 * 24));
        if (daysLeft >= 0 && daysLeft <= 1) {
            if (Notification.permission === 'granted') {
                new Notification('Task Due Soon', {
                    body: `${task.title} is due on ${task.date}.`
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('Task Due Soon', {
                            body: `${task.title} is due on ${task.date}.`
                        });
                    }
                });
            }
        }
    });
}

// Edit task details
function editTask(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    const task = tasks[taskIndex];

    document.getElementById('task-title').value = task.title;
    document.getElementById('task-date').value = task.date;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-category').value = task.category;

    document.getElementById('add-task-btn').textContent = 'Update Task';
    document.getElementById('add-task-btn').removeEventListener('click', addTask);
    document.getElementById('add-task-btn').addEventListener('click', function updateTask() {
        task.title = document.getElementById('task-title').value.trim();
        task.date = document.getElementById('task-date').value;
        task.priority = document.getElementById('task-priority').value;
        task.category = document.getElementById('task-category').value;

        saveTasks();
        renderTasks();
        clearForm();
        document.getElementById('add-task-btn').textContent = 'Add Task';
        document.getElementById('add-task-btn').removeEventListener('click', updateTask);
        document.getElementById('add-task-btn').addEventListener('click', addTask);
    });
}

// Clear the task form after adding or editing
function clearForm() {
    document.getElementById('task-title').value = '';
    document.getElementById('task-date').value = '';
    document.getElementById('task-priority').value = 'low';
    document.getElementById('task-category').value = 'work';
}

// Initial rendering of tasks
renderTasks();

// Ensure that notifications are requested if the user hasn't yet granted permission
if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
}
