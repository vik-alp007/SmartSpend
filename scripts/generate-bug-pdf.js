const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const BUGS_DATA = [
  {
    id: 'BUG-BEG-01',
    title: 'Transaction Search Case Sensitivity',
    difficulty: 'Beginner',
    severity: 'Low',
    component: 'Transactions Page (TransactionController)',
    reproduction: [
      '1. Open the Transactions page.',
      '2. Locate a transaction with title "Grocery Store Run".',
      '3. In the search input, type "grocery" in lowercase.',
      '4. Observe that the search returns 0 matching results.'
    ],
    expected: 'Search should be case-insensitive, matching "Grocery" when searching for "grocery".',
    actual: 'Case-sensitive regex query fails to match mixed or uppercase text.',
    uiRecognition: 'Searching for lowercase common words returns empty results even when matching items exist in table.',
    rootCause: 'Regex query in TransactionController lacks the case-insensitive "i" option ($options: "i").',
    remediation: 'Use regex with case-insensitive option: filter.title = { $regex: escapeRegex(search.trim()), $options: "i" };',
    corrected: 'Transactions matching the query regardless of uppercase or lowercase are returned.',
    testRef: 'server/src/tests/competition_bugs.test.js -> BUG-BEG-01',
    verification: 'Type "grocery" and verify "Grocery Store Run" appears in search results.'
  },
  {
    id: 'BUG-BEG-02',
    title: 'Transaction Amount Sort Order Inversion',
    difficulty: 'Beginner',
    severity: 'Low',
    component: 'Transactions Page (TransactionController)',
    reproduction: [
      '1. Go to Transactions page.',
      '2. Select "Sort by Amount" from the sort dropdown.',
      '3. Verify direction button indicates "↑ Ascending".',
      '4. Observe that the highest amount transaction appears at the top.'
    ],
    expected: 'Ascending sort should place smallest amounts first.',
    actual: 'Ascending sort places largest amounts first, inverting expected behavior.',
    uiRecognition: 'Clicking "Ascending" orders from highest to lowest amount.',
    rootCause: 'Inverted ternary assignment in TransactionController: sortOptions.amount = order === 1 ? -1 : 1.',
    remediation: 'Set sortOptions.amount = order;',
    corrected: 'Ascending sorts low-to-high; descending sorts high-to-low.',
    testRef: 'server/src/tests/competition_bugs.test.js -> BUG-BEG-02',
    verification: 'Sort by amount ascending and check that smaller amounts appear on page 1.'
  },
  {
    id: 'BUG-BEG-03',
    title: 'Zero Amount Expense Transaction Accepted',
    difficulty: 'Beginner',
    severity: 'Medium',
    component: 'Transaction Modal (TransactionForm & TransactionController)',
    reproduction: [
      '1. Click "+ Add Transaction".',
      '2. Fill in title "Sample Free Item", Category "Groceries", Amount "0.00".',
      '3. Click "Add Transaction".',
      '4. Transaction is saved and appears in table with amount ₹0.00.'
    ],
    expected: 'Financial records must require amount > 0.',
    actual: 'Form and API accept ₹0 transactions without rejection.',
    uiRecognition: 'Users can submit ₹0.00 transactions which clutter financial records.',
    rootCause: 'Validation condition checks numAmount < 0 instead of numAmount <= 0.',
    remediation: 'Update validation to reject if isNaN(numAmount) || numAmount <= 0.',
    corrected: 'Amount = 0 triggers validation error "Amount must be greater than 0".',
    testRef: 'server/src/tests/competition_bugs.test.js -> BUG-BEG-03',
    verification: 'Attempt to submit ₹0 amount and verify error message prevents submission.'
  },
  {
    id: 'BUG-BEG-04',
    title: 'Filter Empty State Shows Initial Empty Message',
    difficulty: 'Beginner',
    severity: 'Low',
    component: 'Transaction Table (TransactionTable.jsx)',
    reproduction: [
      '1. Navigate to Transactions page with existing records.',
      '2. Enter search query "nonexistent123".',
      '3. Notice empty state says "No transactions recorded yet" instead of "No matching transactions found".'
    ],
    expected: 'Should distinguish between an empty database and an empty filtered search result.',
    actual: 'Shows generic onboarding empty state even when active filters caused the empty list.',
    uiRecognition: 'Searching for non-existent items shows "Start tracking your financial journey" onboarding text.',
    rootCause: 'TransactionTable empty state condition ignores hasActiveFilters in competition mode.',
    remediation: 'Check hasActiveFilters to render "No matching transactions found" and offer "Reset Filters" action.',
    corrected: 'Shows search-specific empty state with clear button.',
    testRef: 'client/src/components/TransactionTable.jsx',
    verification: 'Type non-existent search and observe "No matching transactions found" message.'
  },
  {
    id: 'BUG-INT-01',
    title: 'Monthly Savings Sums Expenses Instead of Subtracting',
    difficulty: 'Intermediate',
    severity: 'High',
    component: 'Dashboard Overview (DashboardController.getSummary)',
    reproduction: [
      '1. Open Dashboard with Income = ₹85,000 and Expenses = ₹35,000.',
      '2. Inspect "Current Month Savings" card.',
      '3. The card displays ₹1,20,000 instead of ₹50,000.'
    ],
    expected: 'Monthly Savings = Current Month Income - Current Month Expenses.',
    actual: 'Dashboard calculates Income + Expenses, inflating savings display.',
    uiRecognition: 'Savings card value exceeds total income whenever expenses are logged.',
    rootCause: 'Addition operator (+) used instead of subtraction (-) in dashboardController.js.',
    remediation: 'Calculate currentMonthSavings = Math.round((currentMonthIncome - currentMonthExpenses) * 100) / 100;',
    corrected: 'Savings correctly displays net difference between income and expenses.',
    testRef: 'server/src/tests/competition_bugs.test.js -> BUG-INT-01',
    verification: 'Verify Current Month Savings equals Income minus Expenses.'
  },
  {
    id: 'BUG-INT-02',
    title: 'Budget Progress Bar Defective Over-Budget Width Clamp',
    difficulty: 'Intermediate',
    severity: 'Medium',
    component: 'Budget Cards (BudgetCard.jsx)',
    reproduction: [
      '1. Create budget for "Dining Out" with limit ₹5,000.',
      '2. Record expenses totaling ₹6,000 (120% utilized).',
      '3. Observe progress bar: width shrinks to 20% instead of filling 100% with red alert styling.'
    ],
    expected: 'Exceeded budget progress bar should fill 100% width with danger red color.',
    actual: 'Bar shrinks to surplus percentage ((spent - limit) / limit * 100).',
    uiRecognition: 'Over-budget cards have progress bars that look almost empty.',
    rootCause: 'Defective overflow calculation in BudgetCard.jsx.',
    remediation: 'When isOverBudget is true, clamp progressWidth = 100;',
    corrected: 'Progress bar fills completely with red danger indicator.',
    testRef: 'client/src/components/BudgetCard.jsx',
    verification: 'Exceed a budget limit and verify progress bar stays at 100% full width in red.'
  },
  {
    id: 'BUG-INT-03',
    title: 'Date Range End-Date Boundary Excludes Same-Day Records',
    difficulty: 'Intermediate',
    severity: 'Medium',
    component: 'Transactions Filter (TransactionController.getTransactions)',
    reproduction: [
      '1. Create transaction on 2026-10-15 at 14:00.',
      '2. Filter transactions: Start Date = 2026-10-10, End Date = 2026-10-15.',
      '3. Transaction on 2026-10-15 is omitted from results.'
    ],
    expected: 'End date filter should include records through 23:59:59.999 of the specified day.',
    actual: 'End date boundary truncated to midnight 00:00:00, omitting afternoon transactions.',
    uiRecognition: 'Filtering up to "today" hides transactions recorded earlier today.',
    rootCause: 'd.setHours(0, 0, 0, 0) used instead of d.setHours(23, 59, 59, 999).',
    remediation: 'Set end boundary: d.setHours(23, 59, 59, 999); filter.transactionDate.$lte = d;',
    corrected: 'Transactions occurring anytime on the end date are included.',
    testRef: 'server/src/tests/competition_bugs.test.js -> BUG-INT-03',
    verification: 'Filter with end date matching today and verify same-day transactions appear.'
  },
  {
    id: 'BUG-INT-04',
    title: 'Category Spending Chart Excludes "Bills" Category',
    difficulty: 'Intermediate',
    severity: 'Medium',
    component: 'Dashboard Charts (DashboardController.getCharts)',
    reproduction: [
      '1. Record expenses in "Bills" category.',
      '2. Inspect "Category Spending" donut breakdown on Dashboard.',
      '3. "Bills" is absent, and the sum of displayed categories is less than total expenses.'
    ],
    expected: 'All expense categories should appear in the category breakdown chart.',
    actual: 'MongoDB aggregation stage explicitly excludes Bills category.',
    uiRecognition: 'Category chart total does not equal Monthly Expenses KPI card.',
    rootCause: 'categoryPipeline includes match { category: { $ne: "Bills" } } in competition mode.',
    remediation: 'Remove the $ne: "Bills" filter stage from category aggregation.',
    corrected: 'Bills category appears with correct amount and percentage in chart.',
    testRef: 'server/src/tests/competition_bugs.test.js -> BUG-INT-04',
    verification: 'Verify Bills appears in the Category Spending chart.'
  },
  {
    id: 'BUG-INT-05',
    title: 'Transaction Edit Leaves Dashboard Net Balance Stale',
    difficulty: 'Intermediate',
    severity: 'Medium',
    component: 'Global State / Dashboard Sync (AuthContext.jsx)',
    reproduction: [
      '1. Note Dashboard Net Balance (e.g. ₹50,000).',
      '2. Navigate to Transactions page and edit an expense from ₹1,000 to ₹10,000.',
      '3. Return to Dashboard: Net Balance still shows ₹50,000 until full browser reload.'
    ],
    expected: 'Editing a transaction should immediately trigger dashboard data refresh.',
    actual: 'triggerDashboardRefresh(true) suppresses refresh event on edit actions.',
    uiRecognition: 'Dashboard numbers only update on page reload after editing transactions.',
    rootCause: 'Condition in AuthContext skips setDashboardKey increment on edits.',
    remediation: 'Always execute setDashboardKey(prev => prev + 1); regardless of action source.',
    corrected: 'Dashboard balance reflects edited transaction immediately upon return.',
    testRef: 'client/src/context/AuthContext.jsx',
    verification: 'Edit transaction amount, return to dashboard, and check updated balance.'
  },
  {
    id: 'BUG-ADV-01',
    title: '30-Day Fixed Offset Excludes 31st Day from Monthly Reports',
    difficulty: 'Advanced',
    severity: 'High',
    component: 'Monthly Reports (ReportController.getMonthlyReport)',
    reproduction: [
      '1. Record an expense on October 31st (e.g. ₹1,500 Shopping).',
      '2. Open Reports page for October 2026.',
      '3. Observe Total Expenses: October 31st transaction is completely missing.'
    ],
    expected: 'Monthly report must encompass all 31 days in months with 31 days.',
    actual: 'Month end hardcoded to day 30, truncating the 31st day.',
    uiRecognition: 'End-of-month transactions on the 31st do not show up in monthly analytics.',
    rootCause: 'endDate = new Date(year, month - 1, 30, 23, 59, 59, 999) used instead of month end.',
    remediation: 'Use new Date(year, month, 0, 23, 59, 59, 999) for calendar month end.',
    corrected: 'All transactions from day 1 to day 31 are included in reports.',
    testRef: 'server/src/tests/competition_bugs.test.js -> BUG-ADV-01',
    verification: 'Check October report includes expenses recorded on October 31.'
  },
  {
    id: 'BUG-ADV-02',
    title: 'Budget Utilization Subtracts Category Income From Limit',
    difficulty: 'Advanced',
    severity: 'High',
    component: 'Budget Calculations (BudgetController.getBudgets)',
    reproduction: [
      '1. Set Groceries budget limit = ₹10,000.',
      '2. Record expense = ₹4,000 in Groceries.',
      '3. Record income/refund = ₹2,000 tagged under category "Groceries".',
      '4. Observe budget: limit drops to ₹8,000 and utilization percentage inflates to 50%.'
    ],
    expected: 'Budget limits are fixed ceilings; income should not reduce the defined limit.',
    actual: 'Subtracts category income from monthlyLimit, shrinking the budget ceiling.',
    uiRecognition: 'Receiving refunds or income in a category lowers your configured monthly limit.',
    rootCause: 'limit = Math.max(1, budget.monthlyLimit - catIncome) in budgetController.js.',
    remediation: 'Keep limit = budget.monthlyLimit; and handle income separately.',
    corrected: 'Budget limit remains exactly as configured by user.',
    testRef: 'server/src/controllers/budgetController.js',
    verification: 'Add income to budgeted category and verify limit is unchanged.'
  },
  {
    id: 'BUG-ADV-03',
    title: 'Category Line-Item Floor Rounding Discrepancy vs Grand Total',
    difficulty: 'Advanced',
    severity: 'Medium',
    component: 'Monthly Reports (ReportController.getMonthlyReport)',
    reproduction: [
      '1. Create multiple transactions with decimal paise (e.g. ₹4,850.50, ₹1,850.75, ₹890.25).',
      '2. Open Reports page.',
      '3. Manually sum the Category Breakdown table rows and compare to Total Expenses card.',
      '4. Notice a ₹1 to ₹3 discrepancy between table sum and KPI card.'
    ],
    expected: 'Sum of category items must exactly match the Grand Total card.',
    actual: 'Category items are truncated with Math.floor() while Grand Total uses standard rounding.',
    uiRecognition: 'Adding up the category breakdown table amounts does not equal the Total Expenses card.',
    rootCause: 'amount = Math.floor(c.total) in reportController.js aggregation format.',
    remediation: 'Use standard decimal rounding: amount = Math.round(c.total * 100) / 100;',
    corrected: 'Table items and Grand Total card agree to the exact paisa.',
    testRef: 'server/src/controllers/reportController.js',
    verification: 'Sum category table amounts and verify match with Total Expenses card.'
  },
  {
    id: 'BUG-ADV-04',
    title: 'Filtered Pagination Calculates Total Pages Using Unfiltered Count',
    difficulty: 'Advanced',
    severity: 'Medium',
    component: 'Transactions Pagination (TransactionController.getTransactions)',
    reproduction: [
      '1. Have 25 transactions across all categories.',
      '2. Filter by category "Rent" (which only has 2 transactions).',
      '3. Notice pagination shows "Page 1 of 3" instead of "Page 1 of 1". Clicking Next displays an empty page.'
    ],
    expected: 'Pagination totalPages must be derived from count of filtered records.',
    actual: 'Derives totalPages from total unfiltered records countDocuments({ userId }).',
    uiRecognition: 'Filtered transaction lists show multiple pages with blank pages on navigation.',
    rootCause: 'TransactionController uses countDocuments({ userId }) when filters are active.',
    remediation: 'Always calculate totalCount = await Transaction.countDocuments(filter);',
    corrected: 'Pagination accurately reflects count of filtered results.',
    testRef: 'server/src/controllers/transactionController.js',
    verification: 'Filter transactions and verify total pages matches filtered record count.'
  },
  {
    id: 'BUG-ADV-05',
    title: 'Tablet Viewport (768px) Transaction Table Horizontal Overflow',
    difficulty: 'Advanced',
    severity: 'Medium',
    component: 'Responsive Layout (responsive.css)',
    reproduction: [
      '1. Open Transactions page on a tablet or resize browser window to ~768px width.',
      '2. Inspect the transactions table.',
      '3. The table actions column forces fixed width with overflow-x: visible, spilling 24px past the card border.'
    ],
    expected: 'Table container should enable smooth horizontal scrolling without layout blowout.',
    actual: 'overflow-x: visible breaks the container card width on 768px screens.',
    uiRecognition: 'Transaction table spills over card edges on tablet screens, breaking alignment.',
    rootCause: 'CSS class .table-container.competition-overflow forces overflow-x: visible !important.',
    remediation: 'Remove overflow-x override and ensure container maintains overflow-x: auto.',
    corrected: 'Table scrolls cleanly within container card on tablet viewports.',
    testRef: 'client/src/styles/responsive.css',
    verification: 'Resize viewport to 768px and verify table remains contained within card boundaries.'
  }
];

function generatePDF() {
  const outputDir = path.resolve(__dirname, '../artifacts');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'SmartSpend_Bug_List_and_Solutions.pdf');
  const doc = new PDFDocument({
    margin: 45,
    size: 'A4',
    info: {
      Title: 'SmartSpend — Intentional Bug List & Remediation Guide',
      Author: 'SmartSpend Organizer Team',
      Subject: 'Competition Bug Hunting Manifest and Solutions'
    }
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // Colors
  const NAVY = '#0f172a';
  const EMERALD = '#059669';
  const ROSE = '#dc2626';
  const SLATE = '#475569';
  const LIGHT_SLATE = '#94a3b8';

  // COVER / TITLE HEADER
  doc
    .rect(45, 45, 505, 120)
    .fill('#f8fafc');

  doc
    .rect(45, 45, 5, 120)
    .fill(EMERALD);

  doc
    .fillColor(NAVY)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('SmartSpend', 65, 60);

  doc
    .fontSize(14)
    .fillColor(SLATE)
    .font('Helvetica')
    .text('Personal Finance & Expense Tracker', 65, 85);

  doc
    .fontSize(11)
    .fillColor(EMERALD)
    .font('Helvetica-Bold')
    .text('Bug Hunting Competition — Official Master Bug Manifest & Solutions', 65, 105);

  doc
    .fontSize(9)
    .fillColor(LIGHT_SLATE)
    .font('Helvetica')
    .text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | Version 1.0.0`, 65, 125);

  // WARNING BANNER
  doc
    .rect(45, 180, 505, 55)
    .fill('#fef2f2');

  doc
    .rect(45, 180, 5, 55)
    .fill(ROSE);

  doc
    .fontSize(10)
    .fillColor(ROSE)
    .font('Helvetica-Bold')
    .text('CONFIDENTIAL COMPETITION MATERIAL — FOR ORGANIZERS ONLY', 65, 192);

  doc
    .fontSize(8.5)
    .fillColor('#7f1d1d')
    .font('Helvetica')
    .text('This document contains the complete intentional defects catalog, reproduction steps, root causes, and surgical code fixes for the SmartSpend bug-hunting challenge. Keep strictly private until the evaluation phase concludes.', 65, 208, { width: 470 });

  // EXECUTIVE SUMMARY TABLE
  doc.moveDown(4.5);
  doc
    .fillColor(NAVY)
    .fontSize(13)
    .font('Helvetica-Bold')
    .text('Defect Distribution Summary', 45, 255);

  doc
    .fontSize(9)
    .fillColor(SLATE)
    .font('Helvetica')
    .text('Total Documented Intentional Defects: 15 | Master Toggle: BUG_CHALLENGE_MODE=true / false', 45, 272);

  // Summary Table Header
  const tableY = 295;
  doc
    .rect(45, tableY, 505, 20)
    .fill('#0f172a');

  doc
    .fillColor('#ffffff')
    .fontSize(8.5)
    .font('Helvetica-Bold');

  doc.text('ID', 55, tableY + 5);
  doc.text('Title', 135, tableY + 5);
  doc.text('Level', 335, tableY + 5);
  doc.text('Component', 400, tableY + 5);

  let currentY = tableY + 20;

  BUGS_DATA.forEach((b, idx) => {
    const rowBg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
    doc
      .rect(45, currentY, 505, 18)
      .fill(rowBg);

    doc
      .fillColor(NAVY)
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(b.id, 55, currentY + 4);

    doc
      .font('Helvetica')
      .fillColor(SLATE)
      .text(b.title.substring(0, 36), 135, currentY + 4);

    const levelColor = b.difficulty === 'Beginner' ? '#059669' : b.difficulty === 'Intermediate' ? '#d97706' : '#dc2626';
    doc
      .fillColor(levelColor)
      .font('Helvetica-Bold')
      .text(b.difficulty, 335, currentY + 4);

    doc
      .fillColor(SLATE)
      .font('Helvetica')
      .text(b.component.split(' ')[0], 400, currentY + 4);

    currentY += 18;
  });

  // DETAILED BUGS SECTION
  BUGS_DATA.forEach((bug, index) => {
    doc.addPage();

    // Header badge
    doc
      .rect(45, 45, 505, 45)
      .fill('#f1f5f9');

    const diffColor = bug.difficulty === 'Beginner' ? '#059669' : bug.difficulty === 'Intermediate' ? '#d97706' : '#dc2626';
    doc
      .rect(45, 45, 6, 45)
      .fill(diffColor);

    doc
      .fillColor(NAVY)
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(`${bug.id}: ${bug.title}`, 60, 52);

    doc
      .fontSize(9)
      .fillColor(SLATE)
      .font('Helvetica')
      .text(`Difficulty: `, 60, 72)
      .font('Helvetica-Bold')
      .fillColor(diffColor)
      .text(bug.difficulty, 110, 72)
      .font('Helvetica')
      .fillColor(SLATE)
      .text(` | Severity: ${bug.severity} | Affected: ${bug.component}`, 175, 72);

    let secY = 105;

    function renderSection(label, content, isList = false) {
      doc
        .fillColor(NAVY)
        .fontSize(9.5)
        .font('Helvetica-Bold')
        .text(label, 45, secY);

      secY += 14;

      doc
        .fillColor(SLATE)
        .fontSize(8.5)
        .font('Helvetica');

      if (isList && Array.isArray(content)) {
        content.forEach((line) => {
          doc.text(line, 55, secY, { width: 490 });
          secY += 12;
        });
        secY += 6;
      } else {
        doc.text(content, 55, secY, { width: 490 });
        secY += doc.heightOfString(content, { width: 490 }) + 10;
      }
    }

    renderSection('Reproduction Steps (from UI):', bug.reproduction, true);
    renderSection('Expected Behavior:', bug.expected);
    renderSection('Actual Defective Behavior (Competition Mode):', bug.actual);
    renderSection('UI Recognition Clues:', bug.uiRecognition);
    renderSection('Root Cause Analysis:', bug.rootCause);
    renderSection('Exact Remediation / Solution:', bug.remediation);
    renderSection('Corrected Behavior:', bug.corrected);
    renderSection('Automated Regression Test:', bug.testRef);
    renderSection('Post-Fix Verification:', bug.verification);

    // Page Number Footer
    doc
      .fontSize(8)
      .fillColor(LIGHT_SLATE)
      .text(`SmartSpend Master Bug Manifest — Page ${index + 2} of ${BUGS_DATA.length + 1}`, 45, 780, { align: 'center', width: 505 });
  });

  doc.end();

  writeStream.on('finish', () => {
    console.log(`\n==================================================`);
    console.log(`  ✓ Successfully generated Bug Manifest PDF:`);
    console.log(`  Path: ${outputPath}`);
    console.log(`  Total Bugs Documented: ${BUGS_DATA.length}`);
    console.log(`==================================================\n`);

    // Also copy to IDE artifact directory if accessible
    const ideArtifactDir = '/Users/vikalp1.5/.gemini/antigravity-ide/brain/6c7d9171-b266-4081-a033-39ff5f7b2916';
    if (fs.existsSync(ideArtifactDir)) {
      try {
        fs.copyFileSync(outputPath, path.join(ideArtifactDir, 'SmartSpend_Bug_List_and_Solutions.pdf'));
        console.log(`✓ Copied to IDE artifact directory: ${ideArtifactDir}/SmartSpend_Bug_List_and_Solutions.pdf`);
      } catch (err) {
        // Silently skip if permission restricted
      }
    }
  });
}

generatePDF();
