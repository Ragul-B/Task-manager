// Elements
const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const transactionListEl = document.getElementById('transaction-list');
const filterTypeEl = document.getElementById('filter-type');
const filterCategoryEl = document.getElementById('filter-category');
const startDateEl = document.getElementById('filter-start-date');
const endDateEl = document.getElementById('filter-end-date');
const modalEl = document.getElementById('modal');
const confirmDeleteEl = document.getElementById('confirm-delete');
const cancelDeleteEl = document.getElementById('cancel-delete');

// Form Elements
const descriptionEl = document.getElementById('description');
const amountEl = document.getElementById('amount');
const dateEl = document.getElementById('date');
const categoryEl = document.getElementById('category');
const typeEl = document.getElementById('type');
const transactionFormEl = document.getElementById('transaction-form');
const cancelEditEl = document.getElementById('cancel-edit');
const transactionIdEl = document.getElementById('transaction-id');

// Transactions Array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let deleteIndex = null;
let chart, categoryChart;

// Update Summary
function updateSummary() {
  const income = transactions
    .filter(transaction => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expense = transactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const balance = income - expense;

  balanceEl.innerText = `Balance: $${balance.toFixed(2)}`;
  totalIncomeEl.innerText = `$${income.toFixed(2)}`;
  totalExpenseEl.innerText = `$${expense.toFixed(2)}`;

  updateCharts(income, expense);
}

// Render Transactions
function renderTransactions(filter = 'all', startDate = null, endDate = null, categoryFilter = 'all') {
  transactionListEl.innerHTML = '';

  const filteredTransactions = transactions.filter(transaction => {
    if (filter !== 'all' && transaction.type !== filter) return false;
    if (categoryFilter !== 'all' && transaction.category !== categoryFilter) return false;

    if (startDate && new Date(transaction.date) < new Date(startDate)) return false;
    if (endDate && new Date(transaction.date) > new Date(endDate)) return false;

    return true;
  });

  filteredTransactions.forEach((transaction, index) => {
    const li = document.createElement('li');
    li.classList.add(transaction.type);
    
    li.innerHTML = `
      ${transaction.description} - ${transaction.category} (${transaction.date}) 
      <span>$${transaction.amount.toFixed(2)}</span>
      <button onclick="editTransaction(${index})">Edit</button>
      <button onclick="openDeleteModal(${index})">Delete</button>
    `;

    transactionListEl.appendChild(li);
  });
}

// Add or Edit Transaction
function addTransaction(e) {
  e.preventDefault();

  const description = descriptionEl.value;
  const amount = parseFloat(amountEl.value);
  const date = dateEl.value;
  const category = categoryEl.value;
  const type = typeEl.value;
  const transactionId = transactionIdEl.value;

  if (description && amount && date) {
    const transaction = {
      description,
      amount,
      date,
      category,
      type
    };

    if (transactionId) {
      transactions[transactionId] = transaction; // Edit existing transaction
    } else {
      transactions.push(transaction); // Add new transaction
    }

    localStorage.setItem('transactions', JSON.stringify(transactions));

    descriptionEl.value = '';
    amountEl.value = '';
    dateEl.value = '';
    categoryEl.value = 'Salary';
    typeEl.value = 'income';
    transactionIdEl.value = '';

    cancelEditEl.style.display = 'none';

    updateSummary();
    renderTransactions();
  } else {
    alert('Please fill out all fields');
  }
}

// Delete Transaction (with Modal Confirmation)
function openDeleteModal(index) {
  deleteIndex = index;
  modalEl.style.display = 'flex';
}

function confirmDeleteTransaction() {
  transactions.splice(deleteIndex, 1);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  closeModal();
  updateSummary();
  renderTransactions();
}

function closeModal() {
  modalEl.style.display = 'none';
  deleteIndex = null;
}

// Edit Transaction
function editTransaction(index) {
  const transaction = transactions[index];
  descriptionEl.value = transaction.description;
  amountEl.value = transaction.amount;
  dateEl.value = transaction.date;
  categoryEl.value = transaction.category;
  typeEl.value = transaction.type;
  transactionIdEl.value = index;

  cancelEditEl.style.display = 'inline';
}

// Cancel Editing
cancelEditEl.addEventListener('click', () => {
  descriptionEl.value = '';
  amountEl.value = '';
  dateEl.value = '';
  categoryEl.value = 'Salary';
  typeEl.value = 'income';
  transactionIdEl.value = '';

  cancelEditEl.style.display = 'none';
});

// Update Income/Expense and Category Charts
function updateCharts(income, expense) {
  const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
  const categories = transactions.filter(t => t.type === 'expense').reduce((acc, cur) => {
    acc[cur.category] = (acc[cur.category] || 0) + cur.amount;
    return acc;
  }, {});

  if (chart) {
    chart.destroy(); // Destroy the previous chart before creating a new one
  }

  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        label: 'Income vs Expense',
        data: [income, expense],
        backgroundColor: ['#28a745', '#dc3545'],
        borderColor: ['#28a745', '#dc3545'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });

  // Category Breakdown Chart
  const categoryCtx = document.getElementById('categoryBreakdownChart').getContext('2d');
  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(categoryCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        label: 'Expense by Category',
        data: Object.values(categories),
        backgroundColor: ['#ffcc00', '#ff6600', '#ff0066', '#cc00ff', '#6600ff'],
        borderColor: ['#ffcc00', '#ff6600', '#ff0066', '#cc00ff', '#6600ff'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });
}

// Apply Filters for Transactions
function applyFilters() {
  const filterType = filterTypeEl.value;
  const startDate = startDateEl.value;
  const endDate = endDateEl.value;
  const categoryFilter = filterCategoryEl.value;

  renderTransactions(filterType, startDate, endDate, categoryFilter);
}

// Initialize the application
function init() {
  renderTransactions();
  updateSummary();
}

// Event Listeners
transactionFormEl.addEventListener('submit', addTransaction);
filterTypeEl.addEventListener('change', applyFilters);
startDateEl.addEventListener('change', applyFilters);
endDateEl.addEventListener('change', applyFilters);
filterCategoryEl.addEventListener('change', applyFilters);
confirmDeleteEl.addEventListener('click', confirmDeleteTransaction);
cancelDeleteEl.addEventListener('click', closeModal);

// On Load
init();
