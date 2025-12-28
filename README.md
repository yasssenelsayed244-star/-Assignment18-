# NestJS Learning Project

A comprehensive e-commerce backend application built with NestJS, featuring authentication, product management, shopping cart, orders, payment processing with Stripe, and Redis caching.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Running the Application](#running-the-application)
- [Testing](#testing)

## Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Email confirmation with OTP
- Password reset functionality
- Google OAuth integration
- Protected routes with guards

### Product Management
- CRUD operations for products
- Product categories and brands management
- Product caching with Redis
- Get all products endpoint
- Product favorites system

### Shopping Cart
- Add products to cart
- Update cart items
- Remove items from cart
- Clear entire cart
- User-specific cart management

### Orders Management
- Create orders from cart
- Order status tracking (pending, processing, shipped, delivered, cancelled)
- Order history
- Order items management
- Coupon integration with orders

### Coupons System
- Create and manage discount coupons
- Percentage and fixed amount discounts
- Coupon expiration and usage limits
- Minimum order amount validation
- Coupon usage tracking

### Favorites
- Toggle product favorites
- Get user's favorite products
- Favorite status checking

### Payment Processing (Stripe)
- Checkout session creation
- Payment intent creation
- Coupon creation in Stripe
- Refund processing
- Payment status tracking

### Caching (Redis)
- Redis integration for performance
- Product caching with TTL
- Cache invalidation on updates
- Redis CLI commands documentation

## Technologies

### Core Framework
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Express** - Web framework

### Database
- **MySQL** - Relational database
- **TypeORM** - Object-Relational Mapping

### Authentication
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **@nestjs/jwt** - JWT module for NestJS

### Caching
- **Redis** - In-memory data store
- **ioredis** - Redis client for Node.js

### Payment Processing
- **Stripe** - Payment gateway integration

### Validation
- **class-validator** - Decorator-based validation
- **class-transformer** - Object transformation
- **zod** - Schema validation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework

## Project Structure

```
nestjs-learning-project/
├── src/
│   ├── app.module.ts                 # Root application module
│   ├── app.controller.ts             # Root controller
│   ├── app.service.ts                # Root service
│   ├── main.ts                       # Application entry point
│   │
│   ├── auth/                         # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts    # JWT authentication guard
│   │   └── dto/
│   │       ├── signup.dto.ts
│   │       ├── login.dto.ts
│   │       ├── confirm-email.dto.ts
│   │       ├── forgot-password.dto.ts
│   │       ├── reset-password.dto.ts
│   │       ├── google-login.dto.ts
│   │       └── resend-otp.dto.ts
│   │
│   ├── users/                        # Users module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── repositories/
│   │   │   └── users.repository.ts
│   │   └── schemas/
│   │       └── user.schema.ts
│   │
│   ├── products/                     # Products module
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── entities/
│   │   │   └── product.entity.ts
│   │   └── dto/
│   │       ├── create-product.dto.ts
│   │       └── update-product.dto.ts
│   │
│   ├── categories/                   # Categories module
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── entities/
│   │   │   └── category.entity.ts
│   │   └── dto/
│   │       ├── create-category.dto.ts
│   │       └── update-category.dto.ts
│   │
│   ├── brands/                       # Brands module
│   │   ├── brands.module.ts
│   │   ├── brands.controller.ts
│   │   ├── brands.service.ts
│   │   ├── entities/
│   │   │   └── brand.entity.ts
│   │   └── dto/
│   │       ├── create-brand.dto.ts
│   │       └── update-brand.dto.ts
│   │
│   ├── cart/                         # Shopping cart module
│   │   ├── cart.module.ts
│   │   ├── cart.controller.ts
│   │   ├── cart.service.ts
│   │   ├── entities/
│   │   │   └── cart.entity.ts
│   │   └── dto/
│   │       └── add-to-cart.dto.ts
│   │
│   ├── orders/                       # Orders module
│   │   ├── orders.module.ts
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── entities/
│   │   │   ├── order.entity.ts
│   │   │   └── order-item.entity.ts
│   │   └── dto/
│   │       └── create-order.dto.ts
│   │
│   ├── coupons/                      # Coupons module
│   │   ├── coupons.module.ts
│   │   ├── coupons.controller.ts
│   │   ├── coupons.service.ts
│   │   ├── entities/
│   │   │   └── coupon.entity.ts
│   │   └── dto/
│   │       └── create-coupon.dto.ts
│   │
│   ├── favorites/                    # Favorites module
│   │   ├── favorites.module.ts
│   │   ├── favorites.controller.ts
│   │   ├── favorites.service.ts
│   │   └── entities/
│   │       └── favorite.entity.ts
│   │
│   ├── stripe/                       # Stripe payment module
│   │   ├── stripe.module.ts
│   │   ├── stripe.controller.ts
│   │   ├── stripe.service.ts
│   │   ├── README.md
│   │   └── dto/
│   │       ├── create-checkout-session.dto.ts
│   │       ├── create-payment-intent.dto.ts
│   │       ├── create-coupon.dto.ts
│   │       └── create-refund.dto.ts
│   │
│   ├── redis/                        # Redis caching module
│   │   ├── redis.module.ts
│   │   ├── redis.service.ts
│   │  
│   │
│   └── common/                       # Shared utilities
│       ├── decorators/
│       │   └── get-user.decorator.ts
│       ├── interceptors/
│       │   └── logging.interceptor.ts
│       └── pipes/
│           ├── parse-int.pipe.ts
│           ├── trim.pipe.ts
│           ├── uppercase.pipe.ts
│           └── zod-validation.pipe.ts
│
├── test/                             # E2E tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── dist/                             # Compiled output
├── node_modules/                     # Dependencies
├── .env                              # Environment variables (create this)
├── .gitignore
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── nest-cli.json
├── eslint.config.mjs
└── README.md
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nestjs-learning-project
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=nestjs_learning

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Server Configuration
PORT=3000

# Email Configuration (if using email service)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

4. Set up the database:
   - Create a MySQL database named `nestjs_learning` (or your preferred name)
   - The application will automatically create tables using TypeORM's `synchronize` option

5. Start Redis server:
```bash
# On Windows (if installed)
redis-server

# On Linux/Mac
sudo systemctl start redis
# or
redis-server
```

## Configuration

### Database
The application uses TypeORM with MySQL. Database connection is configured in `src/app.module.ts`. Make sure your MySQL server is running and the database exists.

### Redis
Redis is used for caching. The Redis service is configured as a global module and is available throughout the application.

### Stripe
To use Stripe payment features, you need to:
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Add your secret key to the `.env` file

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/confirm-email` - Confirm email with OTP
- `POST /auth/resend-otp` - Resend OTP
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/google` - Google OAuth login

### Users (`/api/v1/users`)
- `GET /users/me` - Get current user (Protected)

### Products (`/api/v1/products`)
- `POST /products` - Create a product
- `GET /products` - Get all products
- `GET /products/all` - Get all products (alternative endpoint)
- `GET /products/cached` - Get products with Redis cache
- `GET /products/:id` - Get product by ID
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Categories (`/api/v1/categories`)
- `POST /categories` - Create a category
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `PATCH /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Brands (`/api/v1/brands`)
- `POST /brands` - Create a brand
- `GET /brands` - Get all brands
- `GET /brands/:id` - Get brand by ID
- `PATCH /brands/:id` - Update brand
- `DELETE /brands/:id` - Delete brand

### Cart (`/api/v1/cart`) - Protected
- `POST /cart/add` - Add item to cart
- `GET /cart` - Get user's cart
- `PATCH /cart/:id` - Update cart item quantity
- `DELETE /cart/:id` - Remove item from cart
- `DELETE /cart` - Clear entire cart

### Orders (`/api/v1/orders`) - Protected
- `POST /orders` - Create an order from cart
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order by ID

### Coupons (`/api/v1/coupons`)
- `POST /coupons` - Create a coupon
- `GET /coupons` - Get all coupons
- `GET /coupons/:id` - Get coupon by ID

### Favorites (`/api/v1/favorites`) - Protected
- `POST /favorites/toggle/:productId` - Toggle favorite status
- `GET /favorites` - Get user's favorites

### Stripe (`/api/v1/stripe`)
- `POST /stripe/checkout-session` - Create checkout session
- `POST /stripe/payment-intent` - Create payment intent
- `POST /stripe/coupon` - Create Stripe coupon
- `POST /stripe/refund` - Create refund
- `GET /stripe/payment-intent/:id` - Get payment intent
- `GET /stripe/checkout-session/:id` - Get checkout session

## Running the Application

### Development Mode
```bash
npm run start:dev
```

The application will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Production Mode
```bash
# Build the application
npm run build

# Run in production
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## Testing

### Unit Tests
```bash
npm run test
```

### Watch Mode
```bash
npm run test:watch
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## Additional Features

### Redis Caching
- Products are cached in Redis for improved performance
- Cache TTL: 1 hour (3600 seconds)
- Automatic cache invalidation on product updates

### Error Handling
- Comprehensive error handling with proper HTTP status codes
- Validation errors with detailed messages
- Type-safe error handling

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Input validation with class-validator
- CORS enabled for cross-origin requests

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Modular architecture following NestJS best practices

## Documentation

- **Redis Documentation**: See `src/redis/README.md`
- **Stripe Documentation**: See `src/stripe/README.md`
- **Features Added**: See `FEATURES_ADDED.md`
- **Errors Fixed**: See `ERRORS_FIXED.md`

## License

This project is licensed under the MIT License.

## Support

For questions and support, please refer to the NestJS documentation at [https://docs.nestjs.com](https://docs.nestjs.com).
#   - A s s i g n m e n t 1 8 -  
 