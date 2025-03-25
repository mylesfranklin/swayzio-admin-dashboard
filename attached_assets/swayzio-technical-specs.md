# Swayzio Admin Dashboard Technical Specifications

**Technical Documentation**

Version: 1.0  
Last Updated: March 25, 2025

---

## 1. Technical Architecture

### 1.1 Architecture Overview

The Swayzio Admin Dashboard is built as a modern web application using a component-based architecture. The system is designed to be scalable, maintainable, and secure, with clean separation of concerns between UI, business logic, and data services.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                  UI Layer                       │
│    (Next.js, React Components, shadcn/ui)       │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│              Business Logic Layer               │
│         (Services, Sync Logic, Utilities)       │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│                Integration Layer                │
│          (HubSpot API, Stripe API)              │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

#### 1.2.1 Frontend Framework
- **Next.js:** React framework for server-rendered applications
- **React:** UI component library
- **TypeScript:** Type-safe JavaScript for improved developer experience

#### 1.2.2 UI Components
- **shadcn/ui:** Component library built on Radix UI and Tailwind CSS
- **Tailwind CSS:** Utility-first CSS framework
- **Recharts:** React charting library for data visualization
- **Lucide Icons:** SVG icon library

#### 1.2.3 State Management
- **React Context API:** For global application state
- **React Query:** For server state management and caching
- **React Hooks:** For component-level state management

#### 1.2.4 Backend Services
- **API Routes:** Next.js API routes for backend functionality
- **Integration Services:** Custom services for external API integration
- **Synchronization Service:** Logic for data synchronization between systems

#### 1.2.5 External Integrations
- **HubSpot API:** For CRM data
- **Stripe API:** For payment and subscription data

#### 1.2.6 Deployment
- **Vercel:** Hosting and deployment platform optimized for Next.js
- **Environment Variables:** For configuration management across environments
- **Continuous Integration:** Automated testing and deployment workflow

### 1.3 System Requirements

#### 1.3.1 Development Environment
- Node.js (v18 or higher)
- npm or yarn package manager
- Git version control

#### 1.3.2 Production Environment
- Node.js hosting environment
- 1GB RAM minimum (2GB recommended)
- Environment variable support
- HTTPS support

#### 1.3.3 Browser Compatibility
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Android Chrome)

---

## 2. Data Models

### 2.1 Customer/Contact Model

This unified model combines data from both HubSpot and Stripe.

```typescript
interface Customer {
  // Core Identifiers
  id: string;                 // Internal unique identifier
  hubspotId?: string;         // HubSpot contact ID
  stripeId?: string;          // Stripe customer ID
  
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  
  // Status Information
  createdAt: Date;            // When the customer was created
  lastModified: Date;         // When the customer was last updated
  stage?: string;             // Lifecycle stage (from HubSpot)
  status?: string;            // Lead status (from HubSpot)
  
  // Address Information
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  
  // Financial Information
  paymentMethods?: PaymentMethod[];
  subscriptions?: Subscription[];
  invoices?: Invoice[];
  
  // Relationships
  activities?: Activity[];    // From HubSpot
  
  // Metadata
  metadata?: {                // Custom fields from both systems
    [key: string]: any;
  };
  
  // Integration Status
  integrationStatus: {
    hubspot: "connected" | "not_connected";
    stripe: "connected" | "not_connected";
    lastSynced?: Date;
  };
}
```

### 2.2 Subscription Model

This model represents subscription data from Stripe.

```typescript
interface Subscription {
  id: string;                 // Stripe subscription ID
  customerId: string;         // Stripe customer ID
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  created: Date;              // When the subscription was created
  currentPeriodStart: Date;   // Start of current billing period
  currentPeriodEnd: Date;     // End of current billing period
  
  // Pricing information
  plan: {
    id: string;               // Plan identifier
    nickname: string;         // Human-readable plan name
    amount: number;           // Plan amount in cents
    currency: string;         // Currency code (e.g., "usd")
    interval: "month" | "year" | "week" | "day";
    intervalCount: number;    // Number of intervals between charges
  };
  
  // Configuration
  quantity: number;           // Number of units/seats
  cancelAtPeriodEnd: boolean; // Whether subscription will cancel at period end
  collectionMethod: "charge_automatically" | "send_invoice";
  
  // Related data
  defaultPaymentMethod?: string; // Default payment method ID
  latestInvoice?: string;       // Latest invoice ID
  
  // Metadata
  metadata?: {                // Custom fields
    [key: string]: any;
  };
}
```

### 2.3 Activity Model

This model represents customer activities from HubSpot.

```typescript
interface Activity {
  id: string;                 // Activity identifier
  type: "EMAIL" | "MEETING" | "TASK" | "NOTE" | string; // Activity type
  timestamp: Date;            // When the activity occurred
  title: string;              // Activity title/summary
  
  // Activity details (varies by type)
  details: {
    [key: string]: any;       // Type-specific details
  };
  
  // Relationships
  contactId: string;          // Associated HubSpot contact ID
  userId?: string;            // User who created/performed the activity
  
  // Metadata
  properties?: {              // Additional properties
    [key: string]: any;
  };
}
```

### 2.4 Invoice/Payment Model

This model represents invoice data from Stripe.

```typescript
interface Invoice {
  id: string;                 // Stripe invoice ID
  customer: string;           // Stripe customer ID
  status: "draft" | "open" | "paid" | "uncollectible" | "void";
  created: Date;              // When the invoice was created
  dueDate?: Date;             // When the invoice is due
  
  // Amounts
  amountDue: number;          // Amount due in cents
  amountPaid: number;         // Amount paid in cents
  amountRemaining: number;    // Amount remaining in cents
  currency: string;           // Currency code (e.g., "usd")
  
  // Invoice information
  number?: string;            // Invoice number
  paid: boolean;              // Whether the invoice is paid
  periodStart: Date;          // Start of billing period
  periodEnd: Date;            // End of billing period
  
  // Line items
  lines: {
    description: string;
    amount: number;
    currency: string;
    period?: {
      start: Date;
      end: Date;
    };
  }[];
  
  // Related data
  paymentIntent?: string;     // Associated payment intent ID
  subscription?: string;      // Associated subscription ID
  
  // Metadata
  metadata?: {                // Custom fields
    [key: string]: any;
  };
}
```

### 2.5 Integration Configuration Model

This model stores API configuration settings.

```typescript
interface IntegrationConfig {
  // HubSpot Configuration
  hubspot: {
    apiKey: string;           // HubSpot API key
    baseUrl: string;          // API base URL
    portalId: string;         // HubSpot portal ID
    scopes: string[];         // API access scopes
    fieldMapping: {           // Field mapping configuration
      [hubspotField: string]: string;
    };
  };
  
  // Stripe Configuration
  stripe: {
    apiKey: string;           // Stripe API key
    webhookSecret: string;    // Webhook signing secret
    baseUrl: string;          // API base URL
    currency: string;         // Default currency
    fieldMapping: {           // Field mapping configuration
      [stripeField: string]: string;
    };
  };
  
  // Synchronization Settings
  sync: {
    frequency: number;        // Sync frequency in minutes
    fields: string[];         // Fields to synchronize
    primarySystems: {         // Which system is primary for each field
      [field: string]: "hubspot" | "stripe";
    };
  };
}
```

### 2.6 Sync History Model

This model tracks synchronization events.

```typescript
interface SyncEvent {
  id: string;                 // Event identifier
  timestamp: Date;            // When the sync occurred
  status: "success" | "error" | "partial";
  
  // Scope
  customerIds?: string[];     // Affected customer IDs (if specific)
  fullSync: boolean;          // Whether this was a full system sync
  
  // Results
  operations: {
    type: "hubspot_to_stripe" | "stripe_to_hubspot" | "create_stripe_customer";
    status: "success" | "error" | "skipped";
    fields?: string[];        // Fields that were synced
    error?: string;           // Error message if failed
  }[];
  
  // Error details
  errorCount?: number;        // Number of errors encountered
  errorMessage?: string;      // Overall error message
}
```

---

## 3. API Integrations

### 3.1 HubSpot Integration

#### 3.1.1 Authentication
The dashboard uses API Key authentication for HubSpot integration. The API key is stored securely and transmitted with each request to the HubSpot API.

#### 3.1.2 Endpoints

| Endpoint | Purpose | Method | Parameters |
|----------|---------|--------|------------|
| `/contacts` | Retrieve all contacts | GET | properties, count, offset |
| `/contacts/{id}` | Retrieve a specific contact | GET | properties |
| `/contacts/{id}/activities` | Get contact activities | GET | types, count, offset |
| `/contacts/create` | Create a new contact | POST | properties |
| `/contacts/{id}/update` | Update a contact | PATCH | properties |

#### 3.1.3 Field Mapping

The system maps between HubSpot contact properties and the internal Customer model:

| HubSpot Property | Internal Field | Notes |
|------------------|----------------|-------|
| `firstname` | `firstName` | Required |
| `lastname` | `lastName` | Required |
| `email` | `email` | Required, used as unique identifier |
| `phone` | `phone` | Optional |
| `company` | `company` | Optional |
| `lifecyclestage` | `stage` | Maps to internal lifecycle stages |
| `hs_lead_status` | `status` | Maps to internal status values |

#### 3.1.4 Rate Limiting

The HubSpot API has rate limits that must be respected:

- 10 requests per second
- 40,000 requests per day (app-specific limits may apply)
- Implement exponential backoff for rate limit handling

### 3.2 Stripe Integration

#### 3.2.1 Authentication
The dashboard uses API Key authentication for Stripe integration. The secret key is stored securely and transmitted with each request to the Stripe API.

#### 3.2.2 Endpoints

| Endpoint | Purpose | Method | Parameters |
|----------|---------|--------|------------|
| `/customers` | Retrieve all customers | GET | limit, starting_after |
| `/customers/{id}` | Retrieve a specific customer | GET | - |
| `/customers/{id}/subscriptions` | Get customer subscriptions | GET | limit, starting_after |
| `/customers/{id}/invoices` | Get customer invoices | GET | limit, starting_after |
| `/customers/create` | Create a new customer | POST | customer data |
| `/customers/{id}` | Update a customer | POST | customer data |

#### 3.2.3 Field Mapping

The system maps between Stripe customer fields and the internal Customer model:

| Stripe Field | Internal Field | Notes |
|--------------|----------------|-------|
| `email` | `email` | Required, used as unique identifier |
| `name` | `firstName` + `lastName` | Split into first/last during sync |
| `phone` | `phone` | Optional |
| `address` | `address` | Maps to address object |
| `metadata.company` | `company` | Stored in metadata |
| `metadata.hubspot_id` | `hubspotId` | Stored to link with HubSpot |

#### 3.2.4 Webhooks

Stripe webhooks are used for real-time data updates:

- `customer.created` - New customer created in Stripe
- `customer.updated` - Customer information updated
- `subscription.created` - New subscription created
- `subscription.updated` - Subscription updated
- `invoice.created` - New invoice created
- `invoice.paid` - Invoice marked as paid

#### 3.2.5 Rate Limiting

The Stripe API has rate limits that must be respected:

- 100 requests per second
- Implement exponential backoff for rate limit handling

### 3.3 Data Synchronization

#### 3.3.1 Synchronization Service

The Data Synchronization Service manages bidirectional data flow between HubSpot and Stripe. This service:

1. Retrieves data from both systems
2. Identifies matching records
3. Resolves conflicts based on configured rules
4. Updates records in both systems
5. Logs synchronization activities

#### 3.3.2 Synchronization Types

| Type | Description | Frequency |
|------|-------------|-----------|
| Full Sync | Synchronize all customers and data | Daily (configurable) |
| Incremental Sync | Sync recently modified records | Hourly (configurable) |
| Real-time Sync | Immediate sync triggered by webhooks | Real-time |
| Manual Sync | User-initiated synchronization | On-demand |

#### 3.3.3 Conflict Resolution

When data conflicts occur, the system resolves them based on these rules:

1. Field-specific primary system (configurable)
2. Most recently updated record
3. Manual resolution flag for critical conflicts

---

## 4. UI/UX Specifications

### 4.1 Design System

#### 4.1.1 Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary | `#3B82F6` | Primary buttons, active states, links |
| Secondary | `#10B981` | Success indicators, positive actions |
| Accent | `#8B5CF6` | Highlights, focus states |
| Destructive | `#EF4444` | Error states, destructive actions |
| Background | `#FFFFFF` / `#F9FAFB` | Page backgrounds, card backgrounds |
| Text | `#111827` / `#4B5563` | Primary text, secondary text |
| Border | `#E5E7EB` | Dividers, borders |

#### 4.1.2 Typography

| Style | Font | Weight | Size | Usage |
|-------|------|--------|------|-------|
| Heading 1 | Inter | Bold (700) | 2rem | Page titles |
| Heading 2 | Inter | Semibold (600) | 1.5rem | Section headers |
| Heading 3 | Inter | Semibold (600) | 1.25rem | Card headers |
| Body | Inter | Regular (400) | 1rem | Normal text |
| Small | Inter | Regular (400) | 0.875rem | Secondary text |
| Tiny | Inter | Regular (400) | 0.75rem | Meta information |

#### 4.1.3 Component Library

The dashboard uses shadcn/ui components, including:

- **Buttons:** Primary, secondary, outline, ghost, link
- **Cards:** Standard, interactive, with various layouts
- **Tables:** Sortable, filterable, with pagination
- **Forms:** Input fields, selects, checkboxes, switches
- **Dialogs:** Modals for confirmations and detailed views
- **Tabs:** For organizing content within pages
- **Badges:** Status indicators and labels
- **Alerts:** Success, warning, error notifications

#### 4.1.4 Spacing

- Base spacing unit: 4px
- Spacing scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
- Component padding: 16px (small), 24px (medium), 32px (large)
- Grid gap: 16px (small), 24px (medium), 32px (large)

### 4.2 Page Layouts

#### 4.2.1 Dashboard Layout

```
┌─────────────────────────────────────────────────────┐
│ Header: Logo, Search, User Menu                     │
├────────┬────────────────────────────────────────────┤
│        │                                            │
│        │ Page Title, Filters, Date Range            │
│        │                                            │
│        ├────────────────┬───────────────────────────┤
│        │                │                           │
│ Side   │ KPI Cards      │ KPI Cards                 │
│ Nav    │                │                           │
│        ├────────────────┴───────────────────────────┤
│        │                                            │
│        │ Data Visualization (Charts)                │
│        │                                            │
│        ├────────────────────┬──────────────────────┤
│        │                    │                      │
│        │ Activity/List View │ Secondary Data       │
│        │                    │                      │
│        │                    │                      │
└────────┴────────────────────┴──────────────────────┘
```

#### 4.2.2 Customer Detail Layout

```
┌─────────────────────────────────────────────────────┐
│ Header: Logo, Search, User Menu                     │
├────────┬────────────────────────────────────────────┤
│        │                                            │
│        │ Breadcrumbs, Customer Name, Actions        │
│        │                                            │
│        ├────────────┬───────────────────────────────┤
│        │            │                               │
│ Side   │ Customer   │ Tabs: Overview, Activities,   │
│ Nav    │ Profile    │       Financial, Integration  │
│        │ Card       │                               │
│        │            │ Tab Content:                  │
│        │            │ - Detailed information        │
│        │            │ - Charts and visualizations   │
│        │            │ - Lists and tables            │
│        │            │                               │
│        │            │                               │
└────────┴────────────┴───────────────────────────────┘
```

#### 4.2.3 Settings Layout

```
┌─────────────────────────────────────────────────────┐
│ Header: Logo, Search, User Menu                     │
├────────┬────────────────────────────────────────────┤
│        │                                            │
│        │ Settings Title, Description                │
│        │                                            │
│        ├────────────────────────────────────────────┤
│        │                                            │
│ Side   │ Tabs: Integration, Sync, Webhooks          │
│ Nav    │                                            │
│        │ Tab Content:                               │
│        │ - Forms and fields                         │
│        │ - Configuration options                    │
│        │ - Test buttons                             │
│        │ - Status indicators                        │
│        │                                            │
│        │                                            │
└────────┴────────────────────────────────────────────┘
```

### 4.3 Navigation Structure

#### 4.3.1 Primary Navigation (Sidebar)

- Dashboard
  - Overview
  - Analytics
- Customers
  - All Customers
  - Segments
- Products
  - All Products
  - Categories
- Subscriptions
  - Active Subscriptions
  - Plans
- Invoices
  - All Invoices
  - Payment Status
- Settings
  - User Profile
  - Team Management
  - Integrations
  - API Settings

#### 4.3.2 Secondary Navigation

- User Menu
  - Profile
  - Preferences
  - Notifications
  - Logout
- Page-Level Tabs
  - Content-specific secondary navigation

### 4.4 Responsive Design

The dashboard is primarily designed for desktop use, but includes responsive considerations:

#### 4.4.1 Breakpoints

- Small: 640px and below
- Medium: 641px to 1024px
- Large: 1025px to 1280px
- Extra Large: 1281px and above

#### 4.4.2 Responsive Behavior

- Sidebar collapses to an icon-only menu on medium screens
- Sidebar becomes a slide-out menu on small screens
- Multi-column layouts stack vertically on small screens
- Tables become scrollable horizontally on small screens
- Charts and visualizations resize to fit available space

---

## 5. Security Considerations

### 5.1 Authentication

#### 5.1.1 User Authentication
- JWT-based authentication
- Session timeout after 30 minutes of inactivity
- CSRF protection for all form submissions
- Rate limiting for login attempts
- Option for two-factor authentication

#### 5.1.2 API Authentication
- Secure storage of API keys
- Environment variable usage for production
- Encrypted storage in database
- No client-side exposure of sensitive credentials

### 5.2 Authorization

#### 5.2.1 Role-Based Access Control
- Admin: Full system access
- Manager: Customer management, reporting, limited settings
- Support: Read-only access to customer data
- Finance: Access to financial data, limited customer data
- Custom: Configurable permissions

#### 5.2.2 Permission Levels
- Create: Ability to create new records
- Read: Ability to view records
- Update: Ability to modify existing records
- Delete: Ability to remove records
- Configure: Ability to change system settings

### 5.3 Data Security

#### 5.3.1 Data Protection
- Encryption of sensitive data at rest
- TLS 1.2+ for all data in transit
- Regular security audits
- Automatic session timeout

#### 5.3.2 PII Handling
- Minimization of personal data collection
- Secure storage of personal information
- Compliance with relevant data protection regulations
- Data anonymization for reporting where possible

### 5.4 API Security

#### 5.4.1 API Protection
- API rate limiting
- IP-based access restrictions (optional)
- Request validation and sanitization
- Secure webhook handling

#### 5.4.2 Monitoring
- Security event logging
- Unusual activity detection
- API usage monitoring
- Error tracking and alerting

---

## 6. Testing Strategy

### 6.1 Unit Testing

- Framework: Jest
- Coverage target: 80% minimum
- Focus areas:
  - Service layer functionality
  - Data transformation logic
  - Component rendering

### 6.2 Integration Testing

- Framework: Cypress
- Test scenarios:
  - API integrations
  - Data synchronization
  - Cross-component interactions

### 6.3 End-to-End Testing

- Framework: Cypress
- Critical user flows:
  - Dashboard navigation
  - Customer management
  - Settings configuration
  - Data export

### 6.4 Performance Testing

- Dashboard loading time: < 2 seconds
- API response time: < 500ms
- Large dataset handling: 5,000+ customers without degradation
- Memory usage monitoring

### 6.5 Security Testing

- Static code analysis
- Dependency vulnerability scanning
- Penetration testing
- Authentication/authorization testing

---

## 7. Deployment & Operations

### 7.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                   Vercel Platform                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│                  Next.js Application                │
│                                                     │
├─────────────────────┬───────────────────────────────┤
│                     │                               │
│    Frontend UI      │       API Routes              │
│                     │                               │
└─────────────────────┴───────────────────────────────┘
            │                     │
            ▼                     ▼
┌─────────────────────┐  ┌─────────────────────────────┐
│                     │  │                             │
│  External Services  │  │  Scheduled Tasks / Cron     │
│  (HubSpot, Stripe)  │  │                             │
│                     │  │                             │
└─────────────────────┘  └─────────────────────────────┘
```

### 7.2 Environment Configuration

- Development: Local development environment
- Staging: Pre-production testing environment
- Production: Live customer-facing environment

### 7.3 Build Process

1. Code linting and testing
2. TypeScript compilation
3. Asset optimization
4. Package bundling
5. Deployment to environment

### 7.4 Monitoring

- Application performance monitoring
- Error tracking and reporting
- User activity analytics
- Integration status monitoring
- Security event monitoring

### 7.5 Maintenance

- Regular dependency updates
- Security patch process
- Database maintenance procedures
- Backup and recovery strategy

---

## 8. Appendices

### 8.1 Code Standards

- ESLint configuration
- Prettier formatting rules
- TypeScript strictness settings
- Component organization
- File naming conventions

### 8.2 API Documentation

Detailed API documentation is available for all internal endpoints.

### 8.3 External References

- HubSpot API Documentation: https://developers.hubspot.com/docs/api/overview
- Stripe API Documentation: https://stripe.com/docs/api
- Next.js Documentation: https://nextjs.org/docs
- shadcn/ui Documentation: https://ui.shadcn.com/
- Recharts Documentation: https://recharts.org/

### 8.4 Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2025-02-15 | Initial technical draft | Swayzio Development Team |
| 1.0 | 2025-03-25 | Final technical specifications | Swayzio Development Team |
