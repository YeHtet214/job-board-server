# Validation Middleware

This directory contains centralized validation middleware for the Job Board application using express-validator.

## Installation

To use this validation middleware, you need to install express-validator:

```bash
npm install express-validator
```

## Usage

### 1. Create Validation Rules

Create validation rules for your endpoints in a dedicated file. For example:

```typescript
// src/middleware/validation/user.validation.ts
import { body, param } from 'express-validator';

export const userValidation = {
  create: [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Email must be valid')
      .trim()
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .trim()
  ],
  // Add more validation rules as needed
};
```

### 2. Apply Validation Middleware in Routes

Apply the validation rules and the validate middleware in your routes:

```typescript
import { userValidation } from '../middleware/validation/user.validation.js';
import { validate } from '../middleware/validation/index.js';

userRouter.post('/', userValidation.create, validate, createUser);
```

### 3. Use Validated Data in Controllers

Use the `matchedData` function to get validated data in your controllers:

```typescript
import { matchedData } from 'express-validator';

export const createUser = async (req, res, next) => {
  try {
    const validatedData = matchedData(req);
    // Use validatedData instead of req.body
    // ...
  } catch (error) {
    next(error);
  }
};
```

## Benefits

- **Centralized Validation**: All validation rules are defined in one place
- **Consistent Error Handling**: Validation errors are handled consistently
- **Input Sanitization**: User inputs are sanitized to prevent security issues
- **Type Safety**: Validated data is type-safe and reliable

## Available Validators and Sanitizers

Express-validator provides many validators and sanitizers. Here are some commonly used ones:

### Validators
- `notEmpty()`: Checks if value is not empty
- `isEmail()`: Checks if value is a valid email
- `isURL()`: Checks if value is a valid URL
- `isLength({ min, max })`: Checks if string length is within range
- `isInt()`: Checks if value is an integer
- `isNumeric()`: Checks if value contains only numbers

### Sanitizers
- `trim()`: Removes whitespace from both ends
- `escape()`: Converts special characters to HTML entities
- `normalizeEmail()`: Normalizes email addresses
- `toInt()`: Converts value to integer
- `toFloat()`: Converts value to float
- `toDate()`: Converts value to Date

For more validators and sanitizers, refer to the [express-validator documentation](https://express-validator.github.io/docs/).
