# API Documentation

**Version:** 1.0.0
**Last Updated:** 2025-11-23

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Responses](#error-responses)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Accounts](#account-endpoints)
  - [Transactions](#transaction-endpoints)
  - [Snapshots](#snapshot-endpoints)
  - [Analytics](#analytics-endpoints)
  - [Health](#health-endpoint)

## Overview

The Budget Reduction Tracking API is a RESTful API built with Express.js and TypeScript. It provides endpoints for managing debt accounts, tracking transactions, generating snapshots, and analyzing financial data.

## Base URL

### Development
```
http://localhost:3001/api
```

### Production
```
https://budget-tracking.yourdomain.com/api
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens). After logging in, include the access token in the `Authorization` header of subsequent requests.

### Header Format
```
Authorization: Bearer <access_token>
```

### Token Expiration
- **Access Token:** 15 minutes
- **Refresh Token:** 7 days

Use the `/api/auth/refresh` endpoint to obtain a new access token using your refresh token.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Success Response (Array)
```json
{
  "success": true,
  "message": "Retrieved successfully",
  "data": [
    // Array of items
  ]
}
```

## Error Responses

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    // Validation errors (if applicable)
  }
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200  | OK - Request succeeded |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid request data |
| 401  | Unauthorized - Authentication required or failed |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 409  | Conflict - Resource already exists |
| 422  | Unprocessable Entity - Validation failed |
| 500  | Internal Server Error - Server error |

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Limit:** 100 requests per 15 minutes per IP address
- **Headers:** Rate limit information is included in response headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## Endpoints

## Authentication Endpoints

### Register User

Create a new user account.

- **URL:** `/auth/register`
- **Method:** `POST`
- **Auth Required:** No

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd",
  "name": "John Doe"
}
```

#### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Min 8 chars, max 100 chars |
| name | string | Yes | Min 2 chars, max 100 chars |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-11-23T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Error Responses

- **400 Bad Request:** Invalid input data
- **409 Conflict:** Email already registered

#### Example cURL

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ssw0rd",
    "name": "John Doe"
  }'
```

---

### Login User

Authenticate user and receive access tokens.

- **URL:** `/auth/login`
- **Method:** `POST`
- **Auth Required:** No

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd"
}
```

#### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Required |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Error Responses

- **400 Bad Request:** Invalid input data
- **401 Unauthorized:** Invalid credentials

#### Example cURL

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecureP@ssw0rd"
  }'
```

---

### Refresh Access Token

Get a new access token using a refresh token.

- **URL:** `/auth/refresh`
- **Method:** `POST`
- **Auth Required:** No

#### Request Body

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Error Responses

- **401 Unauthorized:** Invalid or expired refresh token

#### Example cURL

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

---

### Logout User

Invalidate current user session.

- **URL:** `/auth/logout`
- **Method:** `POST`
- **Auth Required:** Yes

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### Example cURL

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Current User

Get authenticated user's information.

- **URL:** `/auth/me`
- **Method:** `GET`
- **Auth Required:** Yes

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  }
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Account Endpoints

### Get All Accounts

Retrieve all accounts for authenticated user.

- **URL:** `/accounts`
- **Method:** `GET`
- **Auth Required:** Yes

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountType | string | No | Filter by account type |
| isActive | boolean | No | Filter by active status |
| sortBy | string | No | Sort field (name, balance, createdAt) |
| sortOrder | string | No | Sort order (asc, desc) |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "userId": "user-uuid",
      "name": "Chase Freedom",
      "accountType": "CREDIT_CARD",
      "currentBalance": 5420.50,
      "creditLimit": 10000.00,
      "interestRate": 18.99,
      "minimumPayment": 150.00,
      "dueDay": 15,
      "isActive": true,
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-11-23T10:00:00.000Z"
    }
  ]
}
```

#### Example cURL

```bash
curl -X GET "http://localhost:3001/api/accounts?accountType=CREDIT_CARD&isActive=true" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Account by ID

Retrieve a specific account by ID.

- **URL:** `/accounts/:id`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "name": "Chase Freedom",
    "accountType": "CREDIT_CARD",
    "currentBalance": 5420.50,
    "creditLimit": 10000.00,
    "interestRate": 18.99,
    "minimumPayment": 150.00,
    "dueDay": 15,
    "isActive": true,
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  }
}
```

#### Error Responses

- **404 Not Found:** Account not found or doesn't belong to user

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/accounts/uuid-here \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Create Account

Create a new debt account.

- **URL:** `/accounts`
- **Method:** `POST`
- **Auth Required:** Yes

#### Request Body

```json
{
  "name": "Chase Freedom",
  "accountType": "CREDIT_CARD",
  "currentBalance": 5420.50,
  "creditLimit": 10000.00,
  "interestRate": 18.99,
  "minimumPayment": 150.00,
  "dueDay": 15
}
```

#### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | Min 1 char, max 100 chars |
| accountType | enum | Yes | CREDIT_CARD, PERSONAL_LOAN, AUTO_LOAN, MORTGAGE, STUDENT_LOAN, OTHER |
| currentBalance | number | Yes | >= 0 |
| creditLimit | number | No | >= 0 |
| interestRate | number | Yes | 0-100 (percentage) |
| minimumPayment | number | No | >= 0 |
| dueDay | integer | No | 1-31 |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "name": "Chase Freedom",
    "accountType": "CREDIT_CARD",
    "currentBalance": 5420.50,
    "creditLimit": 10000.00,
    "interestRate": 18.99,
    "minimumPayment": 150.00,
    "dueDay": 15,
    "isActive": true,
    "createdAt": "2025-11-23T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  }
}
```

#### Error Responses

- **400 Bad Request:** Invalid input data
- **422 Unprocessable Entity:** Validation failed

#### Example cURL

```bash
curl -X POST http://localhost:3001/api/accounts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chase Freedom",
    "accountType": "CREDIT_CARD",
    "currentBalance": 5420.50,
    "creditLimit": 10000.00,
    "interestRate": 18.99,
    "minimumPayment": 150.00,
    "dueDay": 15
  }'
```

---

### Update Account

Update an existing account.

- **URL:** `/accounts/:id`
- **Method:** `PUT`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Request Body

All fields are optional for partial updates.

```json
{
  "name": "Chase Freedom Updated",
  "currentBalance": 5200.00,
  "interestRate": 17.99
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Account updated successfully",
  "data": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "name": "Chase Freedom Updated",
    "accountType": "CREDIT_CARD",
    "currentBalance": 5200.00,
    "creditLimit": 10000.00,
    "interestRate": 17.99,
    "minimumPayment": 150.00,
    "dueDay": 15,
    "isActive": true,
    "createdAt": "2025-11-01T10:00:00.000Z",
    "updatedAt": "2025-11-23T10:00:00.000Z"
  }
}
```

#### Error Responses

- **400 Bad Request:** Invalid input data
- **404 Not Found:** Account not found

#### Example cURL

```bash
curl -X PUT http://localhost:3001/api/accounts/uuid-here \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chase Freedom Updated",
    "currentBalance": 5200.00
  }'
```

---

### Delete Account

Delete an account (soft delete by default).

- **URL:** `/accounts/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| hard | boolean | No | If true, permanently delete (default: false) |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

#### Error Responses

- **404 Not Found:** Account not found

#### Example cURL

```bash
# Soft delete (mark as inactive)
curl -X DELETE http://localhost:3001/api/accounts/uuid-here \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Hard delete (permanent)
curl -X DELETE "http://localhost:3001/api/accounts/uuid-here?hard=true" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Account Summary

Get account summary with analytics.

- **URL:** `/accounts/:id/summary`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "account": {
      "id": "uuid-here",
      "name": "Chase Freedom",
      "accountType": "CREDIT_CARD",
      "currentBalance": 5420.50,
      "creditLimit": 10000.00,
      "interestRate": 18.99
    },
    "summary": {
      "totalPaid": 2500.00,
      "totalCharges": 1200.00,
      "totalInterest": 320.50,
      "reductionAmount": 1300.00,
      "utilizationRate": 54.21,
      "transactionCount": 25,
      "lastPaymentDate": "2025-11-15T10:00:00.000Z",
      "lastPaymentAmount": 250.00
    }
  }
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/accounts/uuid-here/summary \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Transaction Endpoints

### Get All Transactions

Get all transactions for authenticated user across all accounts.

- **URL:** `/transactions`
- **Method:** `GET`
- **Auth Required:** Yes

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string (ISO 8601) | No | Filter transactions from this date |
| endDate | string (ISO 8601) | No | Filter transactions to this date |
| type | string | No | Filter by transaction type |
| limit | integer | No | Limit number of results |
| offset | integer | No | Offset for pagination |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "accountId": "account-uuid",
      "amount": -250.00,
      "transactionType": "PAYMENT",
      "transactionDate": "2025-11-15T10:00:00.000Z",
      "description": "Monthly payment",
      "createdAt": "2025-11-15T10:00:00.000Z"
    }
  ]
}
```

#### Example cURL

```bash
curl -X GET "http://localhost:3001/api/transactions?startDate=2025-11-01&type=PAYMENT" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Account Transactions

Get all transactions for a specific account.

- **URL:** `/accounts/:accountId/transactions`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountId | string (UUID) | Yes | Account ID |

#### Query Parameters

Same as [Get All Transactions](#get-all-transactions)

#### Success Response (200 OK)

Same format as [Get All Transactions](#get-all-transactions)

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/accounts/uuid-here/transactions \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Create Transaction

Create a new transaction for an account.

- **URL:** `/accounts/:accountId/transactions`
- **Method:** `POST`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountId | string (UUID) | Yes | Account ID |

#### Request Body

```json
{
  "amount": -250.00,
  "transactionType": "PAYMENT",
  "transactionDate": "2025-11-15T10:00:00.000Z",
  "description": "Monthly payment"
}
```

#### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| amount | number | Yes | Negative for payments, positive for charges |
| transactionType | enum | Yes | PAYMENT, CHARGE, ADJUSTMENT, INTEREST |
| transactionDate | string (ISO 8601) | Yes | Valid date |
| description | string | No | Max 500 chars |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": "uuid-here",
    "accountId": "account-uuid",
    "amount": -250.00,
    "transactionType": "PAYMENT",
    "transactionDate": "2025-11-15T10:00:00.000Z",
    "description": "Monthly payment",
    "createdAt": "2025-11-15T10:00:00.000Z"
  }
}
```

#### Error Responses

- **400 Bad Request:** Invalid input data
- **404 Not Found:** Account not found

#### Example cURL

```bash
curl -X POST http://localhost:3001/api/accounts/uuid-here/transactions \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -250.00,
    "transactionType": "PAYMENT",
    "transactionDate": "2025-11-15T10:00:00.000Z",
    "description": "Monthly payment"
  }'
```

---

### Update Transaction

Update an existing transaction.

- **URL:** `/transactions/:id`
- **Method:** `PUT`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Transaction ID |

#### Request Body

All fields are optional for partial updates.

```json
{
  "amount": -300.00,
  "description": "Updated payment amount"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "id": "uuid-here",
    "accountId": "account-uuid",
    "amount": -300.00,
    "transactionType": "PAYMENT",
    "transactionDate": "2025-11-15T10:00:00.000Z",
    "description": "Updated payment amount",
    "createdAt": "2025-11-15T10:00:00.000Z"
  }
}
```

#### Error Responses

- **404 Not Found:** Transaction not found

#### Example cURL

```bash
curl -X PUT http://localhost:3001/api/transactions/uuid-here \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "amount": -300.00,
    "description": "Updated payment amount"
  }'
```

---

### Delete Transaction

Delete a transaction.

- **URL:** `/transactions/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Transaction ID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

#### Error Responses

- **404 Not Found:** Transaction not found

#### Example cURL

```bash
curl -X DELETE http://localhost:3001/api/transactions/uuid-here \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Snapshot Endpoints

### Get Account Snapshots

Get all snapshots for an account.

- **URL:** `/accounts/:accountId/snapshots`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountId | string (UUID) | Yes | Account ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string (ISO 8601) | No | Filter snapshots from this date |
| endDate | string (ISO 8601) | No | Filter snapshots to this date |
| limit | integer | No | Limit number of results |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "accountId": "account-uuid",
      "balance": 5420.50,
      "snapshotDate": "2025-11-23T00:00:00.000Z",
      "note": "End of month snapshot",
      "createdAt": "2025-11-23T10:00:00.000Z"
    }
  ]
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/accounts/uuid-here/snapshots \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Snapshot Chart Data

Get formatted chart data for an account.

- **URL:** `/accounts/:accountId/snapshots/chart-data`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountId | string (UUID) | Yes | Account ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string (ISO 8601) | No | Start date for chart |
| endDate | string (ISO 8601) | No | End date for chart |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "labels": ["2025-11-01", "2025-11-08", "2025-11-15", "2025-11-23"],
    "datasets": [
      {
        "label": "Balance",
        "data": [6720.50, 6470.50, 6220.50, 5420.50]
      }
    ]
  }
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/accounts/uuid-here/snapshots/chart-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Create Snapshot

Create a manual snapshot for an account.

- **URL:** `/accounts/:accountId/snapshots`
- **Method:** `POST`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountId | string (UUID) | Yes | Account ID |

#### Request Body

```json
{
  "balance": 5420.50,
  "snapshotDate": "2025-11-23T00:00:00.000Z",
  "note": "End of month snapshot"
}
```

#### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| balance | number | Yes | >= 0 |
| snapshotDate | string (ISO 8601) | Yes | Valid date |
| note | string | No | Max 500 chars |

#### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Snapshot created successfully",
  "data": {
    "id": "uuid-here",
    "accountId": "account-uuid",
    "balance": 5420.50,
    "snapshotDate": "2025-11-23T00:00:00.000Z",
    "note": "End of month snapshot",
    "createdAt": "2025-11-23T10:00:00.000Z"
  }
}
```

#### Error Responses

- **400 Bad Request:** Invalid input data
- **404 Not Found:** Account not found

#### Example cURL

```bash
curl -X POST http://localhost:3001/api/accounts/uuid-here/snapshots \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "balance": 5420.50,
    "snapshotDate": "2025-11-23T00:00:00.000Z",
    "note": "End of month snapshot"
  }'
```

---

### Delete Snapshot

Delete a snapshot.

- **URL:** `/snapshots/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Snapshot ID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Snapshot deleted successfully"
}
```

#### Error Responses

- **404 Not Found:** Snapshot not found

#### Example cURL

```bash
curl -X DELETE http://localhost:3001/api/snapshots/uuid-here \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Analytics Endpoints

### Get Analytics Overview

Get overall analytics overview for authenticated user.

- **URL:** `/analytics/overview`
- **Method:** `GET`
- **Auth Required:** Yes

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "totalDebt": 25430.50,
    "totalCreditLimit": 50000.00,
    "averageInterestRate": 16.85,
    "totalMonthlyPayment": 1250.00,
    "accountCount": 5,
    "activeAccountCount": 5,
    "utilizationRate": 50.86,
    "totalPaidThisMonth": 1250.00,
    "totalPaidAllTime": 15420.50,
    "debtReduction30Days": 1200.00,
    "debtReduction90Days": 3500.00,
    "projectedPayoffDate": "2027-08-15T00:00:00.000Z",
    "projectedTotalInterest": 8450.00
  }
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/analytics/overview \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Trend Analysis

Get trend analysis for authenticated user.

- **URL:** `/analytics/trends`
- **Method:** `GET`
- **Auth Required:** Yes

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| period | string | No | month, quarter, year (default: month) |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "period": "month",
    "trends": [
      {
        "date": "2025-10-23",
        "totalBalance": 26630.50,
        "totalPayments": 1250.00,
        "totalCharges": 850.00,
        "netReduction": 400.00
      },
      {
        "date": "2025-11-23",
        "totalBalance": 25430.50,
        "totalPayments": 1250.00,
        "totalCharges": 650.00,
        "netReduction": 600.00
      }
    ],
    "summary": {
      "averageMonthlyReduction": 1200.00,
      "bestMonth": "2025-11-23",
      "bestMonthReduction": 1200.00
    }
  }
}
```

#### Example cURL

```bash
curl -X GET "http://localhost:3001/api/analytics/trends?period=month" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Multi-Account Balance Chart

Get multi-account balance chart data.

- **URL:** `/analytics/chart/multi-account-balance`
- **Method:** `GET`
- **Auth Required:** Yes

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string (ISO 8601) | No | Start date |
| endDate | string (ISO 8601) | No | End date |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "labels": ["2025-11-01", "2025-11-08", "2025-11-15", "2025-11-23"],
    "datasets": [
      {
        "label": "Chase Freedom",
        "data": [6720.50, 6470.50, 6220.50, 5420.50],
        "borderColor": "#3B82F6"
      },
      {
        "label": "Auto Loan",
        "data": [19910.00, 19680.00, 19450.00, 20010.00],
        "borderColor": "#10B981"
      }
    ]
  }
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/analytics/chart/multi-account-balance \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Account Analytics

Get analytics summary for a specific account.

- **URL:** `/analytics/accounts/:id`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "accountId": "uuid-here",
    "accountName": "Chase Freedom",
    "currentBalance": 5420.50,
    "initialBalance": 6720.50,
    "totalReduction": 1300.00,
    "reductionPercentage": 19.35,
    "totalPayments": 2500.00,
    "totalCharges": 1200.00,
    "totalInterest": 320.50,
    "averageMonthlyPayment": 833.33,
    "averageMonthlyCharge": 400.00,
    "transactionCount": 25,
    "paymentCount": 15,
    "chargeCount": 10,
    "lastPaymentDate": "2025-11-15T10:00:00.000Z",
    "lastPaymentAmount": 250.00,
    "daysSinceLastPayment": 8
  }
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/analytics/accounts/uuid-here \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Account Projection

Get payoff projection for a specific account based on current trend.

- **URL:** `/analytics/accounts/:id/projection`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "currentBalance": 5420.50,
    "interestRate": 18.99,
    "averageMonthlyPayment": 250.00,
    "projectedMonths": 28,
    "projectedPayoffDate": "2027-03-23T00:00:00.000Z",
    "totalInterestPaid": 1850.50,
    "totalAmountPaid": 7271.00,
    "monthlyBreakdown": [
      {
        "month": 1,
        "payment": 250.00,
        "principal": 164.43,
        "interest": 85.57,
        "remainingBalance": 5256.07
      }
      // ... more months
    ]
  }
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/analytics/accounts/uuid-here/projection \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Interest Forecast

Get interest forecast for a specific account.

- **URL:** `/analytics/accounts/:id/interest-forecast`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| months | integer | No | Number of months to forecast (default: 12) |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "accountId": "uuid-here",
    "currentBalance": 5420.50,
    "interestRate": 18.99,
    "forecast": [
      {
        "month": "2025-12",
        "projectedBalance": 5256.07,
        "interestAccrued": 85.57,
        "cumulativeInterest": 85.57
      },
      {
        "month": "2026-01",
        "projectedBalance": 5089.04,
        "interestAccrued": 83.04,
        "cumulativeInterest": 168.61
      }
      // ... more months
    ],
    "totalInterestOverPeriod": 950.50
  }
}
```

#### Example cURL

```bash
curl -X GET "http://localhost:3001/api/analytics/accounts/uuid-here/interest-forecast?months=12" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Payoff Scenarios

Get multiple payoff scenarios for comparison.

- **URL:** `/analytics/accounts/:id/payoff-scenarios`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "currentBalance": 5420.50,
    "interestRate": 18.99,
    "minimumPayment": 150.00,
    "scenarios": [
      {
        "name": "Minimum Payment",
        "monthlyPayment": 150.00,
        "months": 58,
        "totalInterest": 3280.50,
        "totalPaid": 8701.00
      },
      {
        "name": "Recommended",
        "monthlyPayment": 250.00,
        "months": 28,
        "totalInterest": 1850.50,
        "totalPaid": 7271.00
      },
      {
        "name": "Aggressive",
        "monthlyPayment": 500.00,
        "months": 12,
        "totalInterest": 650.50,
        "totalPaid": 6071.00
      }
    ]
  }
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/analytics/accounts/uuid-here/payoff-scenarios \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Calculate Custom Projection

Calculate custom projection with specified monthly payment.

- **URL:** `/analytics/accounts/:id/calculate-projection`
- **Method:** `POST`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Request Body

```json
{
  "monthlyPayment": 350.00
}
```

#### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| monthlyPayment | number | Yes | > 0 |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "monthlyPayment": 350.00,
    "projectedMonths": 18,
    "projectedPayoffDate": "2027-05-23T00:00:00.000Z",
    "totalInterestPaid": 1250.50,
    "totalAmountPaid": 6671.00,
    "monthlyBreakdown": [
      {
        "month": 1,
        "payment": 350.00,
        "principal": 264.43,
        "interest": 85.57,
        "remainingBalance": 5156.07
      }
      // ... more months
    ]
  }
}
```

#### Error Responses

- **400 Bad Request:** Invalid input data
- **422 Unprocessable Entity:** Payment too low to cover interest

#### Example cURL

```bash
curl -X POST http://localhost:3001/api/analytics/accounts/uuid-here/calculate-projection \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyPayment": 350.00
  }'
```

---

### Get Required Payment

Calculate required payment to pay off in target months.

- **URL:** `/analytics/accounts/:id/required-payment`
- **Method:** `POST`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Request Body

```json
{
  "targetMonths": 24
}
```

#### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| targetMonths | integer | Yes | > 0 |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "targetMonths": 24,
    "requiredMonthlyPayment": 275.50,
    "totalInterestPaid": 1092.00,
    "totalAmountPaid": 6512.50,
    "projectedPayoffDate": "2027-11-23T00:00:00.000Z"
  }
}
```

#### Error Responses

- **400 Bad Request:** Invalid input data
- **422 Unprocessable Entity:** Target months too aggressive

#### Example cURL

```bash
curl -X POST http://localhost:3001/api/analytics/accounts/uuid-here/required-payment \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "targetMonths": 24
  }'
```

---

### Get Balance Reduction Chart

Get balance reduction chart data.

- **URL:** `/analytics/accounts/:id/chart/balance-reduction`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | string (ISO 8601) | No | Start date |
| endDate | string (ISO 8601) | No | End date |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "labels": ["2025-11-01", "2025-11-08", "2025-11-15", "2025-11-23"],
    "datasets": [
      {
        "label": "Balance Reduction",
        "data": [0, 250.00, 500.00, 1300.00],
        "backgroundColor": "#10B981"
      }
    ]
  }
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/analytics/accounts/uuid-here/chart/balance-reduction \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Interest Accumulation Chart

Get interest accumulation chart data.

- **URL:** `/analytics/accounts/:id/chart/interest-accumulation`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| months | integer | No | Number of months to display (default: 12) |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "labels": ["Month 1", "Month 2", "Month 3", "..."],
    "datasets": [
      {
        "label": "Cumulative Interest",
        "data": [85.57, 168.61, 249.82, "..."],
        "borderColor": "#EF4444"
      }
    ]
  }
}
```

#### Example cURL

```bash
curl -X GET "http://localhost:3001/api/analytics/accounts/uuid-here/chart/interest-accumulation?months=12" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Payment Distribution Chart

Get payment distribution pie chart data.

- **URL:** `/analytics/accounts/:id/chart/payment-distribution`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "labels": ["Principal", "Interest"],
    "datasets": [
      {
        "data": [2179.50, 320.50],
        "backgroundColor": ["#10B981", "#EF4444"]
      }
    ],
    "summary": {
      "totalPayments": 2500.00,
      "principalPaid": 2179.50,
      "interestPaid": 320.50,
      "principalPercentage": 87.18,
      "interestPercentage": 12.82
    }
  }
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/analytics/accounts/uuid-here/chart/payment-distribution \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Get Projection Comparison Chart

Get projection comparison chart data (multiple scenarios).

- **URL:** `/analytics/accounts/:id/chart/projection-comparison`
- **Method:** `GET`
- **Auth Required:** Yes

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string (UUID) | Yes | Account ID |

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "labels": ["Month 1", "Month 2", "..."],
    "datasets": [
      {
        "label": "Minimum Payment ($150)",
        "data": [5335.07, 5247.55, "..."],
        "borderColor": "#EF4444"
      },
      {
        "label": "Recommended ($250)",
        "data": [5256.07, 5089.04, "..."],
        "borderColor": "#F59E0B"
      },
      {
        "label": "Aggressive ($500)",
        "data": [5006.07, 4598.04, "..."],
        "borderColor": "#10B981"
      }
    ]
  }
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/analytics/accounts/uuid-here/chart/projection-comparison \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Health Endpoint

### Health Check

Check API health status.

- **URL:** `/health`
- **Method:** `GET`
- **Auth Required:** No

#### Success Response (200 OK)

```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2025-11-23T10:00:00.000Z",
    "uptime": 86400,
    "database": "connected"
  }
}
```

#### Example cURL

```bash
curl -X GET http://localhost:3001/api/health
```

---

## Appendix

### Account Types

- `CREDIT_CARD` - Credit card accounts
- `PERSONAL_LOAN` - Personal/unsecured loans
- `AUTO_LOAN` - Auto/vehicle loans
- `MORTGAGE` - Home mortgages
- `STUDENT_LOAN` - Student loans
- `OTHER` - Other debt types

### Transaction Types

- `PAYMENT` - Money paid toward the debt (negative amount)
- `CHARGE` - New charges/purchases (positive amount)
- `ADJUSTMENT` - Manual balance adjustments
- `INTEREST` - Interest charges

### Date Formats

All dates use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

Example: `2025-11-23T10:00:00.000Z`

### Pagination

Endpoints that return lists support pagination through query parameters:

- `limit` - Number of items per page (default: 50, max: 100)
- `offset` - Number of items to skip (default: 0)

### Sorting

List endpoints support sorting through query parameters:

- `sortBy` - Field to sort by
- `sortOrder` - Sort direction (`asc` or `desc`)

---

**End of API Documentation**

For issues or questions about the API, please open an issue on GitHub or contact the development team.
