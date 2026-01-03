# Swayzio Admin Dashboard

## Overview

Swayzio is a comprehensive admin dashboard application that provides a unified interface for managing customer data across multiple systems. The platform integrates HubSpot (CRM) and Stripe (payments) data to create complete customer profiles, enabling better customer service and streamlined operations. Built with a modern React frontend and Express backend, it features a sophisticated Linear-inspired dark mode design system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled via Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Linear-inspired design tokens (dark theme)
- **Design System**: Custom color palette matching Linear's aesthetic (near-black backgrounds, purple accents, semantic status colors)

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints prefixed with `/api/`
- **Database**: PostgreSQL via Drizzle ORM with Neon serverless driver
- **Session Storage**: connect-pg-simple for PostgreSQL session storage

### Key Design Patterns
- **Monorepo Structure**: Client, server, and shared code in separate directories
- **Shared Schema**: Database models and Zod validation schemas in `/shared/schema.ts` used by both frontend and backend
- **Service Layer**: Integration services (HubSpot, Stripe, Sync) abstract external API interactions
- **Component Architecture**: Atomic design with reusable UI components, domain-specific components, and page layouts

### Data Flow
1. Frontend components use React Query to fetch from `/api/` endpoints
2. Express routes handle requests and interact with storage layer
3. Storage layer uses Drizzle ORM for database operations
4. Shared schema ensures type safety across the full stack

## External Dependencies

### Database
- **PostgreSQL**: Primary data store via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon

### Payment Processing
- **Stripe**: Payment processing and subscription management
- **Environment Variables**: `STRIPE_SECRET_KEY` (server), `VITE_STRIPE_PUBLIC_KEY` (client)
- **@stripe/stripe-js** and **@stripe/react-stripe-js**: Client-side Stripe Elements integration

### CRM Integration
- **HubSpot API**: Customer data, contacts, companies, deals, and activities (service abstraction in place)

### Third-Party Services
- **Kit Newsletter**: Newsletter subscriber management (referenced in components)
- **Social Media Platforms**: Instagram, Facebook, Twitter, YouTube, LinkedIn analytics (referenced in socials page)

### Development Tools
- **Vite**: Build tool with React plugin and custom Replit plugins
- **esbuild**: Server-side bundling for production
- **drizzle-kit**: Database migration tooling (`db:push` command)