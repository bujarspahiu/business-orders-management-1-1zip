# B2B Tire Order System

## Overview

A B2B e-commerce platform for managing tire orders, built for Lassa Tyres distribution. The system provides a public landing page showcasing products, authenticated user dashboards for placing orders, and an admin panel for managing users, products, orders, and notifications. Key features include shopping cart functionality, purchase order PDF generation, role-based access control, and multi-language support (Albanian/English).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and bundling
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui (Radix UI primitives with custom styling)
- **State Management**: React Context API for auth, language, and app state
- **Data Fetching**: TanStack React Query for server state management
- **Routing**: React Router DOM for client-side navigation

### Backend Stack
- **Server**: Express.js with TypeScript (runs on port 3001)
- **Database**: Replit PostgreSQL (internal database via DATABASE_URL)
- **Authentication**: bcrypt for password hashing, session-based auth via localStorage
- **API**: RESTful endpoints proxied through Vite dev server

### Component Architecture
- **Landing Pages**: Public-facing components (Header, Hero, ProductShowcase, About, Contact, Footer)
- **Auth Components**: Login modal with session persistence via localStorage
- **User Dashboard**: Order placement, cart management, order history
- **Admin Dashboard**: User management, product management (with bulk CSV import), order management, notification settings
- **UI Library**: Extensive shadcn/ui component library with custom Modal component

### Authentication Pattern
- Custom authentication using Express.js API with bcrypt password hashing
- Role-based access: `admin` and `user` roles stored in user record
- Session persistence via localStorage (`lassa_user`, `lassa_cart`)
- Cart data persisted locally and synced with available stock

### Data Layer
- **Database**: Replit PostgreSQL (internal) for data persistence
- **Tables**: users, products, orders, order_items, notification_recipients
- **API Client**: Custom database client in `src/lib/db.ts` that calls Express.js API
- **Backend Server**: `server/index.ts` handles all database operations

### Key Features
- **Shopping Cart**: Stock-aware cart with quantity validation and auto-correction
- **PDF Generation**: jsPDF with autotable for purchase order documents
- **Bulk Import**: CSV parsing for product bulk uploads
- **Internationalization**: Custom language context supporting Albanian (sq) and English (en)
- **Theming**: Light/dark mode support via theme provider

### Path Aliases
- `@/*` maps to `./src/*` for clean imports

## API Endpoints

The Express.js backend (`server/index.ts`) provides these endpoints:

### Authentication
- `POST /api/auth/login` - User login with email/password
- `POST /api/auth/register` - New user registration

### Users
- `GET /api/users` - Get all users (admin)
- `POST /api/users` - Create user (admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `POST /api/products/bulk` - Bulk create products (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get all orders (admin) or user's orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (admin)

### Notifications
- `GET /api/notification-recipients` - Get notification recipients (admin)
- `POST /api/notification-recipients` - Add recipient (admin)
- `PUT /api/notification-recipients/:id` - Update recipient (admin)
- `DELETE /api/notification-recipients/:id` - Remove recipient (admin)

## Default Admin Account

- **Email**: admin@lassa.com
- **Password**: password

## External Dependencies

### Third-Party Libraries
- **jsPDF + jspdf-autotable**: PDF document generation for purchase orders
- **date-fns**: Date formatting and manipulation
- **uuid**: Unique identifier generation for orders
- **embla-carousel-react**: Carousel/slider functionality
- **react-day-picker**: Calendar/date picker component
- **vaul**: Drawer component for mobile interactions
- **cmdk**: Command palette functionality
- **react-resizable-panels**: Resizable panel layouts
- **bcrypt**: Password hashing for secure authentication
- **pg**: PostgreSQL client for Node.js

### UI Framework Dependencies
- **Radix UI**: Full suite of accessible, unstyled primitives (dialog, dropdown, tabs, toast, etc.)
- **class-variance-authority**: Component variant management
- **tailwindcss-animate**: Animation utilities
- **@tailwindcss/typography**: Prose styling

### Development Tools
- **TypeScript**: Type safety across the codebase
- **ESLint**: Code linting with React hooks and refresh plugins
- **PostCSS + Autoprefixer**: CSS processing
- **tsx**: TypeScript execution for the backend server

### Mobile App (Capacitor)
- **Capacitor v6**: Wraps the web app for native Android and iOS builds
- **App ID**: `com.lassatyres.app`
- **App Name**: Lassa Tyres
- **Build Instructions**: See `MOBILE_BUILD_INSTRUCTIONS.md` for publishing to Google Play and App Store
- **Native Projects**: `android/` and `ios/` folders contain the native platform code

## Running the Application

The workflow runs both servers:
1. **Backend**: Express.js API on port 3001 (`npx tsx server/index.ts`)
2. **Frontend**: Vite dev server on port 5000 (`npm run dev`)

Vite proxies `/api` requests to the backend server.

## Recent Changes

- Migrated from external Supabase to Replit's internal PostgreSQL database
- Added Express.js backend server for API operations
- Created custom database client (`src/lib/db.ts`) to replace Supabase client
- Added Capacitor v6 for native mobile app builds
