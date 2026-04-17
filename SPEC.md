# ERP System Specification

## 1. Project Overview

- **Project Name**: ERP System (Enterprise Resource Planning)
- **Type**: Full-stack web application (Next.js)
- **Core Functionality**: A comprehensive ERP system with dashboard, product management, orders, customers, inventory, and AI assistant for business operations
- **Target Users**: Small to medium business owners and employees

## 2. UI/UX Specification

### Layout Structure

- **Sidebar Navigation** (260px width, collapsible to 80px)
  - Logo area at top
  - Main navigation menu
  - User profile at bottom
- **Main Content Area** (flex: 1)
  - Top bar with page title, breadcrumbs, and actions
  - Content area with consistent padding (24px)
- **Responsive Breakpoints**
  - Desktop: ≥1280px (full sidebar)
  - Tablet: 768px-1279px (collapsed sidebar)
  - Mobile: <768px (hidden sidebar, hamburger menu)

### Visual Design

- **Color Palette**
  - Primary: #2563EB (blue-600)
  - Primary Hover: #1D4ED8 (blue-700)
  - Secondary: #64748B (slate-500)
  - Accent: #10B981 (emerald-500)
  - Danger: #EF4444 (red-500)
  - Warning: #F59E0B (amber-500)
  - Background: #F8FAFC (slate-50)
  - Surface: #FFFFFF
  - Border: #E2E8F0 (slate-200)
  - Text Primary: #1E293B (slate-800)
  - Text Secondary: #64748B (slate-500)

- **Typography**
  - Font Family: "Inter", system-ui, sans-serif
  - Headings:
    - H1: 28px, font-weight 700
    - H2: 24px, font-weight 600
    - H3: 20px, font-weight 600
    - H4: 16px, font-weight 600
  - Body: 14px, font-weight 400
  - Small: 12px, font-weight 400

- **Spacing System**
  - Base unit: 4px
  - Common: 8px, 12px, 16px, 24px, 32px, 48px

- **Visual Effects**
  - Card shadows: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
  - Hover shadows: 0 4px 6px rgba(0,0,0,0.1)
  - Border radius: 8px (cards), 6px (buttons), 4px (inputs)
  - Transitions: 150ms ease-in-out

### Components

- **Sidebar**
  - Logo with icon
  - Nav items with icons, labels, active state
  - Collapse toggle button
  - User avatar and name at bottom

- **Cards**
  - Stats cards with icon, label, value, trend indicator
  - Data cards with header, content, actions

- **Tables**
  - Striped rows
  - Sortable headers
  - Pagination
  - Row actions (edit, delete)

- **Forms**
  - Input fields with labels and validation
  - Select dropdowns
  - Date pickers
  - Search inputs

- **Buttons**
  - Primary (filled blue)
  - Secondary (outlined)
  - Danger (red)
  - Icon buttons
  - Loading state with spinner

- **Modals**
  - Centered overlay
  - Header with title and close button
  - Body content
  - Footer with actions

- **AI Assistant**
  - Floating button (bottom-right)
  - Chat panel (400px width, expandable)
  - Message bubbles (user/assistant)
  - Input with send button

## 3. Functionality Specification

### Pages

#### 1. Dashboard (`/`)
- **Stats Cards**: Total Revenue, Total Orders, Total Products, Total Customers
- **Recent Orders Table**: Last 10 orders with status
- **Quick Actions**: Add Order, Add Product, Add Customer
- **Revenue Chart**: Line chart showing monthly revenue

#### 2. Products (`/products`)
- **Product List**: Table with image, name, category, price, stock, status
- **Add/Edit Product Modal**: Name, description, category, price, stock, image URL
- **Filter by category**
- **Search by name**
- **Delete confirmation**

#### 3. Orders (`/orders`)
- **Order List**: Table with ID, customer, products, total, status, date
- **Add Order Modal**: Customer select, product multi-select, quantity
- **Order Status**: Pending, Processing, Shipped, Delivered, Cancelled
- **Filter by status**
- **Order Detail View**: Full order information

#### 4. Customers (`/customers`)
- **Customer List**: Table with name, email, phone, total orders, total spent
- **Add/Edit Customer Modal**: Name, email, phone, address
- **Search by name/email**
- **View customer orders**

#### 5. Inventory (`/inventory`)
- **Stock Overview**: Current stock levels
- **Low Stock Alerts**: Products with stock < 10
- **Stock History**: Recent stock changes
- **Adjust Stock Modal**: Add/remove stock with reason

### AI Assistant

- **Trigger**: Floating button in bottom-right corner
- **Functionality**:
  - Natural language queries about ERP data
  - "Show me today's orders"
  - "What's our best selling product?"
  - "Add a new customer: John Doe, john@email.com"
  - "Update product price for Product X to 100"
  - "Generate sales report for this month"
- **Responses**: Formatted text, tables, suggested actions

### State Management (Zustand)

- **Store Slices**:
  - `useProductStore`: products array, CRUD operations
  - `useOrderStore`: orders array, CRUD operations
  - `useCustomerStore`: customers array, CRUD operations
  - `useUIStore`: sidebar collapsed, modals, notifications

### Data Models

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}
```

## 4. Acceptance Criteria

### Visual Checkpoints
- [ ] Sidebar displays with logo, navigation items, and user profile
- [ ] Dashboard shows 4 stat cards with correct data
- [ ] Tables have proper styling with hover states
- [ ] Forms have proper validation and error states
- [ ] Modals open/close smoothly with overlay
- [ ] AI assistant chat panel opens from floating button

### Functional Checkpoints
- [ ] Can navigate between all pages
- [ ] Can add/edit/delete products
- [ ] Can add/edit/delete customers
- [ ] Can create orders with product selection
- [ ] Can update order status
- [ ] Can search and filter data
- [ ] AI assistant responds to queries
- [ ] Data persists in state (no backend required)

### Technical Checkpoints
- [ ] Next.js app runs with `npm run dev`
- [ ] No console errors on page load
- [ ] Responsive on all breakpoints
- [ ] Zustand state management works correctly