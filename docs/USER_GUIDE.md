# Budget Reduction Tracking - User Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-23

## Table of Contents

- [Introduction](#introduction)
- [Getting Started](#getting-started)
  - [Registration](#registration)
  - [First Login](#first-login)
  - [Initial Setup](#initial-setup)
- [Managing Accounts](#managing-accounts)
  - [Adding Your First Account](#adding-your-first-account)
  - [Understanding Account Types](#understanding-account-types)
  - [Setting Up Credit Limits and Interest Rates](#setting-up-credit-limits-and-interest-rates)
  - [Editing Accounts](#editing-accounts)
  - [Deleting Accounts](#deleting-accounts)
- [Recording Transactions](#recording-transactions)
  - [Adding a Payment](#adding-a-payment)
  - [Recording a Charge](#recording-a-charge)
  - [Using Quick Transaction Entry](#using-quick-transaction-entry)
  - [Editing Transaction History](#editing-transaction-history)
- [Understanding Charts](#understanding-charts)
  - [Balance Reduction Chart](#balance-reduction-chart)
  - [Interest Forecast Chart](#interest-forecast-chart)
  - [Payment Distribution Chart](#payment-distribution-chart)
  - [Progress Chart](#progress-chart)
  - [Projection Chart](#projection-chart)
  - [Multi-Account Balance Chart](#multi-account-balance-chart)
- [Using the Dashboard](#using-the-dashboard)
  - [Overview of Summary Cards](#overview-of-summary-cards)
  - [Recent Activity](#recent-activity)
  - [Quick Actions](#quick-actions)
  - [Progress Overview](#progress-overview)
- [Analytics Features](#analytics-features)
  - [Overall Analytics](#overall-analytics)
  - [Per-Account Analytics](#per-account-analytics)
  - [Payoff Projections](#payoff-projections)
  - [What-If Scenarios](#what-if-scenarios)
  - [Trend Analysis](#trend-analysis)
- [Tips and Best Practices](#tips-and-best-practices)
  - [How Often to Update Balances](#how-often-to-update-balances)
  - [Setting Realistic Goals](#setting-realistic-goals)
  - [Using Projections Effectively](#using-projections-effectively)
  - [Monitoring Progress](#monitoring-progress)
- [FAQs](#faqs)
- [Troubleshooting](#troubleshooting)

---

## Introduction

Welcome to Budget Reduction Tracking! This application helps you take control of your debt by providing comprehensive tools to track, visualize, and project your journey to financial freedom.

### What Makes This Different?

Unlike traditional debt tracking apps that show your debt as a negative number going down, Budget Reduction Tracking uses an **inverted visualization** approach. This means:

- **Debt reduction is shown as upward progress** (like climbing a mountain)
- Paying down debt feels like gaining ground, not just reducing a negative
- Visual motivation through positive momentum

### Key Concepts

- **Accounts**: Individual debt accounts (credit cards, loans, mortgages)
- **Transactions**: Payments made or charges added to accounts
- **Snapshots**: Point-in-time balance records for tracking progress
- **Projections**: Estimates of when you'll be debt-free based on payment patterns
- **Interest Forecasting**: Predictions of total interest costs over time

---

## Getting Started

### Registration

1. Navigate to the registration page
2. Enter your information:
   - **Email**: Your email address (used for login)
   - **Password**: A secure password (minimum 8 characters)
   - **Name**: Your full name
3. Click **"Create Account"**
4. You'll be automatically logged in upon successful registration

**Security Note**: Your password is encrypted using industry-standard bcrypt hashing. We never store your password in plain text.

---

### First Login

After logging in, you'll see the Dashboard. Initially, it will be empty with a welcome message prompting you to:

1. Add your first account
2. Record some transactions
3. Start tracking your progress

---

### Initial Setup

To get the most out of Budget Reduction Tracking, follow these initial setup steps:

1. **Add all your debt accounts** (credit cards, loans, etc.)
2. **Record your current balances** for each account
3. **Set up interest rates** to enable accurate projections
4. **Add recent transaction history** if you want historical data
5. **Review the dashboard** to see your overall debt picture

---

## Managing Accounts

### Adding Your First Account

1. Click **"Add Account"** on the Dashboard or navigate to the Accounts page
2. Fill in the account details:
   - **Account Name**: A memorable name (e.g., "Chase Freedom", "Auto Loan")
   - **Account Type**: Select from the dropdown
   - **Current Balance**: The amount you currently owe
   - **Credit Limit**: (Optional) Your maximum credit limit
   - **Interest Rate (APR)**: Annual percentage rate
   - **Minimum Payment**: (Optional) Required monthly payment
   - **Due Day**: (Optional) Day of month payment is due
3. Click **"Save Account"**

**Example:**
```
Account Name: Chase Freedom
Account Type: Credit Card
Current Balance: $5,420.50
Credit Limit: $10,000.00
Interest Rate: 18.99%
Minimum Payment: $150.00
Due Day: 15
```

---

### Understanding Account Types

Budget Reduction Tracking supports six types of debt accounts:

#### 1. Credit Card
- **Best for**: Credit card balances
- **Features**: Tracks credit limit and utilization rate
- **Color coded**: Blue in charts

#### 2. Personal Loan
- **Best for**: Unsecured personal loans
- **Features**: Fixed-term debt tracking
- **Color coded**: Green in charts

#### 3. Auto Loan
- **Best for**: Vehicle financing
- **Features**: Fixed payment tracking
- **Color coded**: Yellow in charts

#### 4. Mortgage
- **Best for**: Home loans
- **Features**: Long-term debt projections
- **Color coded**: Purple in charts

#### 5. Student Loan
- **Best for**: Education debt
- **Features**: Special interest calculation support
- **Color coded**: Orange in charts

#### 6. Other
- **Best for**: Any other debt type
- **Features**: Generic debt tracking
- **Color coded**: Gray in charts

---

### Setting Up Credit Limits and Interest Rates

#### Credit Limits

Credit limits are optional but recommended for credit card accounts. They enable:

- **Utilization rate calculation**: Shows what percentage of your credit you're using
- **Better visualizations**: Charts can show progress relative to limit
- **Warning indicators**: Alerts when approaching limit

**Tip**: You can find your credit limit on your monthly statement or online account.

#### Interest Rates

Interest rates are crucial for accurate projections. Enter them as annual percentage rates (APR).

**Where to find your APR:**
- Credit cards: Monthly statement or online account
- Loans: Loan agreement or monthly statement
- Mortgages: Closing documents or monthly statement

**Important**:
- Enter as a percentage (e.g., 18.99, not 0.1899)
- For variable rates, update when they change
- If you have a 0% promotional rate, enter 0 but update when it expires

---

### Editing Accounts

To edit an existing account:

1. Navigate to the **Accounts** page
2. Find the account you want to edit
3. Click the **"Edit"** button (pencil icon)
4. Update any fields
5. Click **"Save Changes"**

**What you can edit:**
- Account name
- Current balance (or add a transaction instead)
- Credit limit
- Interest rate
- Minimum payment
- Due day

**Note**: You cannot change the account type after creation. If you need to change the type, create a new account and delete the old one.

---

### Deleting Accounts

To delete an account:

1. Navigate to the **Accounts** page
2. Find the account you want to delete
3. Click the **"Delete"** button (trash icon)
4. Confirm the deletion

**Important Notes:**
- Deleting an account also deletes all associated transactions and snapshots
- This action cannot be undone
- Consider marking the account as inactive instead if you want to preserve history

**Soft Delete vs Hard Delete:**
- **Soft delete** (default): Account marked as inactive, data preserved
- **Hard delete**: Permanent removal of all data

---

## Recording Transactions

Transactions are records of money flowing in or out of your debt accounts.

### Transaction Types

1. **Payment**: Money you paid toward the debt (reduces balance)
2. **Charge**: New purchases or charges (increases balance)
3. **Adjustment**: Manual balance corrections
4. **Interest**: Interest charges from the lender

---

### Adding a Payment

1. Navigate to the account detail page or Transactions page
2. Click **"Add Transaction"**
3. Fill in the details:
   - **Type**: Select "Payment"
   - **Amount**: Enter payment amount (will be recorded as negative)
   - **Date**: Date of payment
   - **Description**: Optional note (e.g., "Monthly payment")
4. Click **"Save Transaction"**

**Example:**
```
Type: Payment
Amount: $250.00
Date: 2025-11-15
Description: Monthly payment
```

The balance will automatically update to reflect the payment.

---

### Recording a Charge

1. Navigate to the account detail page or Transactions page
2. Click **"Add Transaction"**
3. Fill in the details:
   - **Type**: Select "Charge"
   - **Amount**: Enter charge amount (will be recorded as positive)
   - **Date**: Date of charge
   - **Description**: Optional note (e.g., "Amazon purchase")
4. Click **"Save Transaction"**

**Example:**
```
Type: Charge
Amount: $85.50
Date: 2025-11-18
Description: Amazon purchase
```

---

### Using Quick Transaction Entry

The Quick Transaction Form provides a streamlined way to record common transactions:

1. Located on the Dashboard or Account Detail page
2. Select the account from the dropdown
3. Choose transaction type (Payment or Charge)
4. Enter the amount
5. Click **"Add"**

**Benefits:**
- Faster entry for routine transactions
- Auto-fills today's date
- Immediate dashboard update

**Best for:**
- Regular monthly payments
- Daily charges
- Quick balance updates

---

### Editing Transaction History

To edit a transaction:

1. Navigate to the **Transactions** page or Account Detail page
2. Find the transaction in the list
3. Click the **"Edit"** button
4. Update any fields:
   - Amount
   - Date
   - Description
   - Type
5. Click **"Save Changes"**

**Note**: The account balance automatically recalculates when you edit a transaction.

To delete a transaction:

1. Find the transaction in the list
2. Click the **"Delete"** button (trash icon)
3. Confirm the deletion

**Warning**: Deleting a transaction affects your account balance and historical data.

---

## Understanding Charts

Budget Reduction Tracking provides seven powerful chart types to visualize your progress.

### Balance Reduction Chart

**Purpose**: Shows your debt reduction over time as upward progress.

**Key Features:**
- X-axis: Time (dates)
- Y-axis: Amount reduced from initial balance
- Upward trend = Good progress
- Downward trend = Balance increased

**How to Read It:**
- The line going up means you're reducing debt
- Steep slopes indicate rapid payoff
- Flat areas indicate no change
- Downward dips indicate new charges

**Inverted Visualization Explained:**

Traditional debt charts show balance going down (which feels negative). This chart shows reduction going up (which feels positive and motivating).

**Example:**
```
Starting balance: $6,720.50
After 3 months: $5,420.50
Chart shows: +$1,300.00 reduction (upward on chart)
```

---

### Interest Forecast Chart

**Purpose**: Projects how much interest you'll pay over time.

**Key Features:**
- Shows cumulative interest over the life of the debt
- Based on current interest rate and payment trends
- Helps you understand the true cost of debt

**How to Read It:**
- The line shows total interest accumulating
- Steeper slope = More interest
- Use this to motivate larger payments

**What-If Analysis:**

Try different payment amounts to see how it affects total interest:
- Minimum payments = Highest interest
- Larger payments = Lower interest
- Pay off early = Significant savings

---

### Payment Distribution Chart

**Purpose**: Shows how your payments are split between principal and interest.

**Key Features:**
- Pie chart showing percentage breakdown
- Green slice = Principal (reduces debt)
- Red slice = Interest (cost of borrowing)

**How to Read It:**
- Larger green slice = More efficient payments
- Larger red slice = More money going to interest
- Early in debt: More goes to interest
- Later in debt: More goes to principal

**Goal**: Maximize the green slice by making larger payments.

---

### Progress Chart

**Purpose**: Visual representation of your overall debt reduction journey.

**Key Features:**
- Shows percentage of debt eliminated
- Milestones and achievements
- Progress bars for each account

**How to Read It:**
- 0% = Just started
- 50% = Halfway to debt-free
- 100% = Debt-free!

**Motivation**: Celebrate milestones as you hit them!

---

### Projection Chart

**Purpose**: Estimates when you'll be debt-free based on payment patterns.

**Key Features:**
- Multiple scenarios (minimum, recommended, aggressive)
- Shows balance decreasing over time
- Includes payoff date for each scenario

**How to Read It:**
- Multiple colored lines represent different payment amounts
- Where the line hits zero = Projected payoff date
- Compare scenarios to find your optimal payment

**Example Scenarios:**
- **Minimum Payment**: $150/month → 58 months, $3,280 interest
- **Recommended**: $250/month → 28 months, $1,850 interest
- **Aggressive**: $500/month → 12 months, $650 interest

---

### Multi-Account Balance Chart

**Purpose**: Shows all your accounts on one chart for easy comparison.

**Key Features:**
- One line per account
- Color-coded by account type
- Shows which debts are reducing fastest

**How to Read It:**
- Multiple lines = Multiple accounts
- Converging lines = Balances evening out
- Lines crossing = One account overtaking another

**Strategy Tips:**
- Focus on the account with the highest line (highest balance)
- Or focus on the highest interest rate (debt avalanche method)
- Or pay off smallest balance first (debt snowball method)

---

## Using the Dashboard

The Dashboard is your command center for debt tracking.

### Overview of Summary Cards

The Dashboard displays key metrics in easy-to-read cards:

#### Total Debt Card
- Shows sum of all account balances
- Color-coded by severity:
  - Green: Low debt
  - Yellow: Moderate debt
  - Red: High debt

#### Total Reduction Card
- Shows total amount paid off
- **Inverted visualization**: Higher = Better
- Includes percentage reduction

#### Monthly Payment Card
- Average monthly payment across all accounts
- Helps budget planning
- Shows payment consistency

#### Projected Payoff Date Card
- Estimated debt-free date
- Based on current payment trends
- Motivational countdown

#### Average Interest Rate Card
- Weighted average across all accounts
- Helps identify high-interest debt
- Use to prioritize payments

---

### Recent Activity

Displays your most recent transactions across all accounts:

- Last 10 transactions
- Shows account name, amount, type, and date
- Quick way to verify recent entries
- Click to edit or delete

---

### Quick Actions

Convenient buttons for common tasks:

1. **Add Account**: Create a new debt account
2. **Add Transaction**: Record a payment or charge
3. **View Analytics**: Deep dive into your data
4. **Generate Report**: Export your progress

---

### Progress Overview

Visual summary of your debt reduction journey:

- **Progress Bars**: One per account showing reduction percentage
- **Milestones**: Achievements unlocked (25%, 50%, 75%, paid off)
- **Trends**: 30-day, 90-day, and all-time reduction amounts
- **Comparison**: Current vs. previous period

---

## Analytics Features

### Overall Analytics

Access comprehensive analytics from the Analytics page:

**Key Metrics:**
- Total debt across all accounts
- Total credit available
- Overall utilization rate
- Combined monthly payments
- Total interest paid
- Total principal paid
- Average reduction rate

**Trend Analysis:**
- Month-over-month comparison
- Best performing account
- Fastest reduction period
- Payment consistency score

---

### Per-Account Analytics

Dive deep into individual account performance:

1. Navigate to **Account Detail** page
2. Click **"Analytics"** tab

**Available Metrics:**
- Initial balance vs. current balance
- Total reduction amount and percentage
- Average monthly payment
- Average monthly charges
- Payment-to-charge ratio
- Days since last payment
- Transaction count by type

---

### Payoff Projections

Understand when you'll be debt-free:

**Based on Current Trend:**
- Analyzes your payment history
- Calculates average monthly payment
- Projects payoff date
- Estimates total interest

**Viewing Projections:**
1. Go to **Account Detail** page
2. Scroll to **Projection** section
3. Review the timeline and breakdown

**Monthly Breakdown:**
- Shows each future month's payment
- Principal vs. interest split
- Remaining balance after each payment
- Cumulative interest paid

---

### What-If Scenarios

Model different payment strategies:

**Try Different Payments:**
1. Go to **Account Detail** page
2. Click **"Calculate Custom Projection"**
3. Enter a monthly payment amount
4. Click **"Calculate"**

**View Results:**
- New projected payoff date
- Total interest with this payment
- Interest savings vs. minimum payment
- Month-by-month breakdown

**Reverse Calculator:**
1. Click **"Calculate Required Payment"**
2. Enter target months to pay off
3. Click **"Calculate"**
4. See required monthly payment to meet goal

**Example:**
```
Goal: Pay off in 24 months
Current balance: $5,420.50
Interest rate: 18.99%
Required payment: $275.50/month
Total interest: $1,092.00
```

---

### Trend Analysis

Understand your payment patterns:

**Available Trends:**
- Monthly reduction trend
- Quarterly reduction trend
- Annual reduction trend
- Payment consistency
- Charge patterns

**How to Use Trends:**
1. Navigate to **Analytics** page
2. Select time period (month, quarter, year)
3. Review trend charts
4. Identify patterns:
   - Are you reducing debt consistently?
   - Are charges increasing?
   - Are payments fluctuating?

**Action Steps:**
- If reduction is slowing: Increase payments
- If charges are increasing: Review spending
- If payments fluctuate: Budget more consistently

---

## Tips and Best Practices

### How Often to Update Balances

**Recommended Frequency:**
- **Credit Cards**: Weekly or after each payment
- **Loans**: Monthly after payment posts
- **Mortgages**: Monthly after payment posts

**Why Regular Updates Matter:**
- Accurate projections
- Real-time progress tracking
- Early detection of issues
- Motivation from seeing progress

**Quick Update Method:**
1. Check your account balance online
2. Add transaction for any difference
3. Let the app calculate the new balance

---

### Setting Realistic Goals

**SMART Goal Framework:**

**Specific**: "Pay off Chase Freedom card"
- Not: "Pay off debt"

**Measurable**: "Reduce balance by $1,000"
- Not: "Pay off some debt"

**Achievable**: Based on your income and expenses
- Don't set goals you can't meet

**Relevant**: Aligns with your financial situation
- High-interest debt first

**Time-bound**: "In 6 months"
- Not: "Someday"

**Example SMART Goal:**
"Pay off my $5,420.50 Chase Freedom balance by paying $300/month for 20 months, saving $750 in interest compared to minimum payments."

---

### Using Projections Effectively

**Best Practices:**

1. **Review Monthly**: Check projections each month
2. **Adjust Payments**: Increase if possible
3. **Model Changes**: Use what-if scenarios before major decisions
4. **Track Accuracy**: Compare projections to actual results
5. **Update Rates**: Keep interest rates current

**Warning Signs:**
- Payoff date moving further away
- Interest increasing faster than expected
- Reduction rate slowing down

**Action Steps:**
- Increase payment amount
- Stop new charges
- Focus on high-interest accounts first

---

### Monitoring Progress

**Daily:**
- Glance at Dashboard
- Check recent transactions
- Verify new charges

**Weekly:**
- Review balance changes
- Add any new transactions
- Check utilization rates

**Monthly:**
- Review projections
- Analyze trends
- Adjust payment strategy
- Celebrate milestones

**Quarterly:**
- Deep analytics review
- Compare to goals
- Adjust long-term strategy
- Update financial plan

---

## FAQs

### General Questions

**Q: Is my financial data secure?**
A: Yes. All data is encrypted, passwords are hashed with bcrypt, and connections use HTTPS. We never share your data with third parties.

**Q: Can I access this from my phone?**
A: Yes. The application is fully responsive and works on mobile browsers. A dedicated mobile app is planned for v2.0.

**Q: Can I export my data?**
A: Currently, you can view and print reports. CSV export is planned for a future update.

**Q: Is there a limit to how many accounts I can track?**
A: No. Track as many debt accounts as you need.

---

### Account Questions

**Q: I made a mistake when creating an account. Can I change the account type?**
A: No, account types cannot be changed after creation. Create a new account with the correct type and delete the old one.

**Q: What if my interest rate changes?**
A: Simply edit the account and update the interest rate field. Projections will automatically recalculate.

**Q: Should I track paid-off accounts?**
A: It's up to you. You can mark them as inactive to keep the history, or delete them to clean up your dashboard.

**Q: My credit limit increased. Where do I update it?**
A: Edit the account and update the Credit Limit field.

---

### Transaction Questions

**Q: I entered a transaction with the wrong amount. What do I do?**
A: Edit the transaction and correct the amount. The balance will automatically recalculate.

**Q: Can I bulk import transactions from my bank?**
A: Not currently. CSV import is planned for a future release. For now, enter transactions manually.

**Q: Do I need to enter every single charge?**
A: Not necessarily. You can update your balance periodically and the app will track the change. However, detailed transaction history provides better insights.

**Q: What's the difference between a charge and interest?**
A: Charges are purchases or fees. Interest is the cost of borrowing. Both increase your balance, but tracking them separately helps you understand your spending patterns.

---

### Chart Questions

**Q: Why does my balance reduction chart show a downward spike?**
A: A downward spike indicates your balance increased (new charges exceeded payments). This is normal but worth reviewing to understand why.

**Q: My projection chart shows I'll never pay off my debt. What's wrong?**
A: This happens when your payments are less than the monthly interest. You need to increase your payment amount to make progress.

**Q: Can I print or save charts?**
A: Yes. Use your browser's print function or the Export button on each chart.

**Q: Why are there different colored lines on the multi-account chart?**
A: Each color represents a different account. This helps you compare progress across accounts at a glance.

---

### Projection Questions

**Q: How accurate are the projections?**
A: Projections are based on your current payment patterns and interest rates. They assume you'll continue making similar payments. Accuracy improves with more transaction history.

**Q: My projection keeps changing. Why?**
A: Projections update based on your recent activity. If you make different payment amounts or add new charges, the projection will adjust.

**Q: What does "Required Payment" mean?**
A: It's the monthly payment amount needed to pay off the debt in your target timeframe. If it's higher than you can afford, extend your target.

**Q: Can I see projections for all accounts combined?**
A: Yes, the Overall Analytics page shows combined projections for all your debt.

---

## Troubleshooting

### Login Issues

**Problem: Forgot password**
- Solution: Use the "Forgot Password" link on the login page (if enabled)
- Contact support if you need help

**Problem: Account locked**
- Solution: Wait 15 minutes after multiple failed login attempts
- Contact support if the issue persists

---

### Data Issues

**Problem: Balance doesn't match my bank statement**
- Solution: Review recent transactions for errors
- Add an adjustment transaction to correct the balance
- Update the account with the correct current balance

**Problem: Transaction is missing**
- Solution: Check the date range filter
- Check if you're viewing the correct account
- Verify the transaction wasn't accidentally deleted

**Problem: Chart data looks wrong**
- Solution: Refresh the page
- Check the date range settings
- Verify your transaction data is accurate

---

### Performance Issues

**Problem: App is slow to load**
- Solution: Clear browser cache
- Check your internet connection
- Try a different browser

**Problem: Charts aren't displaying**
- Solution: Ensure JavaScript is enabled
- Disable browser extensions temporarily
- Try a different browser

---

### Getting Help

If you encounter issues not covered here:

1. Check the documentation: [docs/](../docs/)
2. Review FAQs on this page
3. Open an issue on GitHub
4. Contact support (if available)

---

## Conclusion

Congratulations on taking control of your debt! Budget Reduction Tracking gives you the tools to:

- **Track** your debt across multiple accounts
- **Visualize** your progress with motivating charts
- **Project** when you'll be debt-free
- **Optimize** your payment strategy
- **Celebrate** your milestones

Remember:
- **Consistency is key**: Regular payments and tracking matter most
- **Small wins add up**: Every payment is progress
- **Stay motivated**: Use the inverted charts to see your positive momentum
- **Adjust as needed**: Life changes, your strategy can too

**You've got this!** Every step toward reducing debt is a step toward financial freedom.

---

**Need more help?**
- [API Documentation](./API.md)
- [Development Guide](./DEVELOPMENT.md)
- [Quick Reference](./QUICK_REFERENCE.md)

**Last Updated**: 2025-11-23
