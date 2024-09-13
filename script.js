// Elements
const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const transactionListEl = document.getElementById('transaction-list');
const filterTypeEl = document.getElementById('filter-type');
const startDateEl = document.getElementById('filter-start-date');
const endDateEl = document.getElementById('filter-end-date');

// Form Elements
const descriptionEl = document.getElementById('description');
const amountEl = document.getElementById('amount');
const dateEl = document.getElementById('date');
const categoryEl = document.getElementById('category');
const typeEl = document.getElementById('type');
const transactionFormEl = document.getElementById('transaction-form');

// Transactions Array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Chart
let chart;

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

  updateChart(income, expense);
}

// Render Transactions
function renderTransactions(filter = 'all', startDate = null, endDate = null) {
  transactionListEl.innerHTML = '';

  const filteredTransactions = transactions.filter(transaction => {
    if (filter !== 'all' && transaction.type !== filter) return false;
    
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
      <button onclick="deleteTransaction(${index})">Delete</button>
      <button onclick="editTransaction(${index})">Edit</button>
    `;

    transactionListEl.appendChild(li);
  });
}

// Add Transaction
function addTransaction(e) {
  e.preventDefault();

  const description = descriptionEl.value;
  const amount = parseFloat(amountEl.value);
  const date = dateEl.value;
  const category = categoryEl.value;
  const type = typeEl.value;

  if (description && amount && date) {
    const transaction = {
      description,
      amount,
      date,
      category,
      type
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    descriptionEl.value = '';
    amountEl.value = '';
    dateEl.value = '';
    categoryEl.value = 'Salary';
    typeEl.value = 'income';

    updateSummary();
    renderTransactions();
  } else {
    alert('Please fill out all fields');
  }
}

// Delete Transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem('transactions', JSON.stringify(transactions));
  updateSummary();
  renderTransactions();
}

// Edit Transaction
function editTransaction(index) {
  const transaction = transactions[index];
  descriptionEl.value = transaction.description;
  amountEl.value = transaction.amount;
  dateEl.value = transaction.date;
  categoryEl.value = transaction.category;
  typeEl.value = transaction.type;
  transactions.splice(index, 1); // Remove the old transaction so it can be replaced by the edited version
  localStorage.setItem('transactions', JSON.stringify(transactions)); 
  updateSummary();
  renderTransactions();
}

// Update the income/expense chart
function updateChart(income, expense) {
  const ctx = document.getElementById('incomeExpenseChart').getContext('2d');

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
}

// Filter Transactions by Type and Date
function applyFilters() {
  const filterType = filterTypeEl.value;
  const startDate = startDateEl.value;
  const endDate = endDateEl.value;

  renderTransactions(filterType, startDate, endDate);
}

// Initialize
function init() {
  renderTransactions();
  updateSummary();
}

// Event Listeners
transactionFormEl.addEventListener('submit', addTransaction);
filterTypeEl.addEventListener('change', applyFilters);
startDateEl.addEventListener('change', applyFilters);
endDateEl.addEventListener('change', applyFilters);

// On Load
init();
