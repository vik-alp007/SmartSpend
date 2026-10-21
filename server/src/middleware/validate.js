function validateRegistration(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long.');
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(' ')
    });
  }

  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  next();
}

function validateTransaction(req, res, next) {
  const { title, type, amount, category, transactionDate } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Transaction title is required.');
  }

  if (!type || !['income', 'expense'].includes(type)) {
    errors.push('Transaction type must be "income" or "expense".');
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 0) {
    errors.push('Amount must be a valid positive number.');
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required.');
  }

  if (transactionDate) {
    const parsedDate = new Date(transactionDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Invalid transaction date provided.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(' ')
    });
  }

  next();
}

function validateBudget(req, res, next) {
  const { category, monthlyLimit, month, year } = req.body;
  const errors = [];

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required.');
  }

  const numLimit = Number(monthlyLimit);
  if (isNaN(numLimit) || numLimit <= 0) {
    errors.push('Monthly limit must be greater than 0.');
  }

  const numMonth = Number(month);
  if (isNaN(numMonth) || numMonth < 1 || numMonth > 12) {
    errors.push('Month must be between 1 and 12.');
  }

  const numYear = Number(year);
  if (isNaN(numYear) || numYear < 2000 || numYear > 2100) {
    errors.push('Year must be valid.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(' ')
    });
  }

  next();
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateTransaction,
  validateBudget
};
