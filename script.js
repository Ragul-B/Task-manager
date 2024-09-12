document.getElementById('add-task-btn').addEventListener('click', addTask);

let tasks = [];

function addTask() {
    const taskTitle = document.getElementById('task-title').value;
    const taskDate = document.getElementById('task-date').value;
    const taskPriority = document.getElementById('task-priority').value;
    const taskCategory = document.getElementById('task-category').value;

    if (taskTitle.trim() === '') {
        alert('Task title cannot be empty!');
        return;
    }

    const task = {
        id: Date.now(),
        title: taskTitle,
        date: taskDate,
        priority: taskPriority,
        category: taskCategory,
        completed: false
    };

    tasks.push(task);
    renderTasks();
}

function renderTasks() {
    const taskGrid = document.getElementById('tasks-grid');
    taskGrid.innerHTML = '';

    tasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.classList.add('task-card');

        taskCard.innerHTML = `
            <h3>${task.title}</h3>
            <p>Due: ${task.date}</p>
            <p>Priority: ${task.priority} | Category: ${task.category}</p>
            <div class="task-actions">
                <button class="btn-complete" onclick="toggleTask(${task.id})">${task.completed ? 'Undo' : 'Complete'}</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;

        taskGrid.appendChild(taskCard);
    });

    updateAnalytics();
}

function toggleTask(id) {
    const task = tasks.find(task => task.id === id);
    task.completed = !task.completed;
    renderTasks();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
}

function updateAnalytics() {
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = tasks.filter(task => !task.completed).length;

    document.getElementById('completed-count').innerText = completedTasks;
    document.getElementById('pending-count').innerText = pendingTasks;
}
