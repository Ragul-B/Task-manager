let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Event listeners
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

    if (title === "") {
        alert("Task title cannot be empty");
        return;
    }

    const task = {
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

// Render tasks
function renderTasks(filteredTasks = tasks) {
    const tasksGrid = document.getElementById('tasks-grid');
    tasksGrid.innerHTML = '';

    filteredTasks.forEach((task, index) => {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');

        const taskTitle = document.createElement('h3');
        taskTitle.textContent = task.title;

        const taskDate = document.createElement('p');
        taskDate.textContent = task.date ? `Due: ${task.date}` : "No Due Date";

        const taskPriority = document.createElement('p');
        taskPriority.textContent = `Priority: ${task.priority}`;

        const taskCategory = document.createElement('p');
        taskCategory.textContent = `Category: ${task.category}`;

        const taskActions = document.createElement('div');
        taskActions.classList.add('task-actions');

        const completeBtn = document.createElement('button');
        completeBtn.textContent = task.completed ? "Undo" : "Complete";
        completeBtn.classList.add('btn', 'btn-complete');
        completeBtn.onclick = () => toggleCompleteTask(index);

        const editBtn = document.createElement('button');
        editBtn.textContent = "Edit";
        editBtn.classList.add('btn', 'btn-edit');
        editBtn.onclick = () => editTask(index);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add('btn', 'btn-delete');
        deleteBtn.onclick = () => deleteTask(index);

        taskActions.appendChild(completeBtn);
        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);

        taskCard.appendChild(taskTitle);
        taskCard.appendChild(taskDate);
        taskCard.appendChild(taskPriority);
        taskCard.appendChild(taskCategory);
        taskCard.appendChild(taskActions);

        tasksGrid.appendChild(taskCard);
    });

    updateAnalytics();
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Edit a task
function editTask(index) {
    const task = tasks[index];

    document.getElementById('task-title').value = task.title;
    document.getElementById('task-date').value = task.date;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-category').value = task.category;

    deleteTask(index);
}

// Delete a task
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
}

// Toggle task completion
function toggleCompleteTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
}

// Filter tasks by title
function filterTasksByTitle() {
    const searchQuery = document.getElementById('search-task').value.toLowerCase();
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery)
    );
    renderTasks(filteredTasks);
}

// Filter tasks due today
function filterDueToday() {
    const today = new Date().toISOString().split('T')[0];
    const filteredTasks = tasks.filter(task => task.date === today);
    renderTasks(filteredTasks);
}

// Filter tasks due this week
function filterDueThisWeek() {
    const today = new Date();
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    const filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= today && taskDate <= oneWeekLater;
    });

    renderTasks(filteredTasks);
}

// Sort tasks by priority
function sortByPriority() {
    const priorityLevels = { "high": 1, "medium": 2, "low": 3 };
    tasks.sort((a, b) => priorityLevels[a.priority] - priorityLevels[b.priority]);
    saveTasks();
    renderTasks();
}

// Filter tasks by category
function filterByCategory(category) {
    if (category === 'all') {
        renderTasks(tasks);
    } else {
        const filteredTasks = tasks.filter(task => task.category === category);
        renderTasks(filteredTasks);
    }
}

// Clear form after adding/editing a task
function clearForm() {
    document.getElementById('task-title').value = '';
    document.getElementById('task-date').value = '';
    document.getElementById('task-priority').value = 'low';
    document.getElementById('task-category').value = 'work';
}

// Update analytics (completed/pending tasks)
function updateAnalytics() {
    const completedCount = tasks.filter(task => task.completed).length;
    const pendingCount = tasks.length - completedCount;

    document.getElementById('completed-count').textContent = completedCount;
    document.getElementById('pending-count').textContent = pendingCount;
}

// Initial render
renderTasks();
