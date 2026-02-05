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

### Component Architecture
- **Landing Pages**: Public-facing components (Header, Hero, ProductShowcase, About, Contact, Footer)
- **Auth Components**: Login modal with session persistence via localStorage
- **User Dashboard**: Order placement, cart management, order history
- **Admin Dashboard**: User management, product management (with bulk CSV import), order management, notification settings
- **UI Library**: Extensive shadcn/ui component library with custom Modal component

### Authentication Pattern
- Custom authentication using Supabase client with email/password login
- Role-based access: `admin` and `user` roles stored in user record
- Session persistence via localStorage (`lassa_user`, `lassa_cart`)
- Cart data persisted locally and synced with available stock

### Data Layer
- **Database**: Supabase (PostgreSQL) for data persistence
- **Tables**: users, products, orders, order_items, notification_recipients
- **Client**: Supabase JS client configured in `src/lib/supabase.ts`

### Key Features
- **Shopping Cart**: Stock-aware cart with quantity validation and auto-correction
- **PDF Generation**: jsPDF with autotable for purchase order documents
- **Bulk Import**: CSV parsing for product bulk uploads
- **Internationalization**: Custom language context supporting Albanian (sq) and English (en)
- **Theming**: Light/dark mode support via theme provider

### Path Aliases
- `@/*` maps to `./src/*` for clean imports

## External Dependencies

### Database & Backend
- **Supabase**: PostgreSQL database with REST API for all data operations (users, products, orders, notifications)

### Third-Party Libraries
- **jsPDF + jspdf-autotable**: PDF document generation for purchase orders
- **date-fns**: Date formatting and manipulation
- **uuid**: Unique identifier generation for orders
- **embla-carousel-react**: Carousel/slider functionality
- **react-day-picker**: Calendar/date picker component
- **vaul**: Drawer component for mobile interactions
- **cmdk**: Command palette functionality
- **react-resizable-panels**: Resizable panel layouts

### UI Framework Dependencies
- **Radix UI**: Full suite of accessible, unstyled primitives (dialog, dropdown, tabs, toast, etc.)
- **class-variance-authority**: Component variant management
- **tailwindcss-animate**: Animation utilities
- **@tailwindcss/typography**: Prose styling

### Development Tools
- **TypeScript**: Type safety across the codebase
- **ESLint**: Code linting with React hooks and refresh plugins
- **PostCSS + Autoprefixer**: CSS processing

### Mobile App (Capacitor)
- **Capacitor v6**: Wraps the web app for native Android and iOS builds
- **App ID**: `com.lassatyres.app`
- **App Name**: Lassa Tyres
- **Build Instructions**: See `MOBILE_BUILD_INSTRUCTIONS.md` for publishing to Google Play and App Store
- **Native Projects**: `android/` and `ios/` folders contain the native platform code