// Elements
const balanceEl = document.getElementById('balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const transactionListEl = document.getElementById('transaction-list');
const filterTypeEl = document.getElementById('filter-type');

// Form Elements
const descriptionEl = document.getElementById('description');
const amountEl = document.getElementById('amount');
const typeEl = document.getElementById('type');
const transactionFormEl = document.getElementById('transaction-form');

// Transactions Array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

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
}

// Render Transactions
function renderTransactions(filter = 'all') {
  transactionListEl.innerHTML = '';

  const filteredTransactions = transactions.filter(transaction => 
    filter === 'all' || transaction.type === filter
  );

  filteredTransactions.forEach(transaction => {
    const li = document.createElement('li');
    li.classList.add(transaction.type);
    
    li.innerHTML = `
      ${transaction.description} <span>$${transaction.amount.toFixed(2)}</span>
    `;

    transactionListEl.appendChild(li);
  });
}

// Add Transaction
function addTransaction(e) {
  e.preventDefault();

  const description = descriptionEl.value;
  const amount = parseFloat(amountEl.value);
  const type = typeEl.value;

  if (description && amount) {
    const transaction = {
      description,
      amount,
      type
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    descriptionEl.value = '';
    amountEl.value = '';
    typeEl.value = 'income';

    updateSummary();
    renderTransactions();
  } else {
    alert('Please provide a description and amount');
  }
}

// Filter Transactions
filterTypeEl.addEventListener('change', function() {
  renderTransactions(this.value);
});

// Initialize
function init() {
  renderTransactions();
  updateSummary();
}

// Event Listeners
transactionFormEl.addEventListener('submit', addTransaction);

// On Load
init();
