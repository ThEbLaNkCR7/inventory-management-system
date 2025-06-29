# Design System Documentation

## Overview

This design system provides consistent styling across the entire inventory management application. All components follow a unified design language with proper typography, spacing, colors, and interactions.

## Table of Contents

1. [Typography System](#typography-system)
2. [Form Elements](#form-elements)
3. [Button System](#button-system)
4. [Card System](#card-system)
5. [Table System](#table-system)
6. [Badge System](#badge-system)
7. [Modal/Dialog System](#modaldialog-system)
8. [Form Section System](#form-section-system)
9. [Status Indicators](#status-indicators)
10. [Loading States](#loading-states)
11. [Utility Classes](#utility-classes)
12. [Usage Guidelines](#usage-guidelines)

---

## Typography System

### Page Titles
```html
<h1 class="page-title">Page Title</h1>
<p class="page-subtitle">Page description goes here</p>
```

### Section Headers
```html
<h2 class="section-title">Section Title</h2>
<p class="section-subtitle">Section description</p>
```

### Card Titles
```html
<h3 class="card-title">Card Title</h3>
<p class="card-subtitle">Card description</p>
```

### Table Headers
```html
<th class="table-header">Column Header</th>
```

### Form Labels
```html
<label class="form-label">Regular Label</label>
<label class="form-label-required">Required Field</label>
```

### Body Text
```html
<p class="body-text">Regular body text</p>
<p class="body-text-small">Smaller body text</p>
```

### Value Text
```html
<p class="value-text">Regular value</p>
<p class="value-text-large">Large value</p>
<p class="value-text-mono">Monospace value</p>
```

---

## Form Elements

### Input Fields
```html
<input type="text" class="input-field" placeholder="Enter text" />
<input type="text" class="input-field input-field-error" placeholder="Error state" />
<input type="text" class="input-field input-field-success" placeholder="Success state" />
```

### Textarea
```html
<textarea class="textarea-field" placeholder="Enter description"></textarea>
```

### Select Fields
```html
<select class="select-field">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Checkbox and Radio
```html
<input type="checkbox" class="checkbox-field" />
<input type="radio" class="radio-field" />
```

---

## Button System

### Primary Buttons
```html
<button class="btn-primary">Primary Action</button>
<button class="btn-primary" disabled>Disabled</button>
```

### Secondary Buttons
```html
<button class="btn-secondary">Secondary Action</button>
```

### Success Buttons
```html
<button class="btn-success">Success Action</button>
```

### Danger Buttons
```html
<button class="btn-danger">Delete</button>
```

### Ghost Buttons
```html
<button class="btn-ghost">Ghost Action</button>
```

### Icon Buttons
```html
<button class="btn-icon btn-icon-primary">
  <Icon className="h-5 w-5" />
</button>
<button class="btn-icon btn-icon-secondary">
  <Icon className="h-5 w-5" />
</button>
```

---

## Card System

### Basic Cards
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Card Title</h3>
  </div>
  <div class="card-body">
    <p class="body-text">Card content</p>
  </div>
  <div class="card-footer">
    <button class="btn-primary">Action</button>
  </div>
</div>
```

### Hover Cards
```html
<div class="card card-hover">
  <div class="card-body">
    <p class="body-text">Hoverable card</p>
  </div>
</div>
```

### Info Cards
```html
<div class="info-card">
  <p class="body-text">Information message</p>
</div>
<div class="success-card">
  <p class="body-text">Success message</p>
</div>
<div class="warning-card">
  <p class="body-text">Warning message</p>
</div>
<div class="error-card">
  <p class="body-text">Error message</p>
</div>
```

---

## Table System

### Complete Table Structure
```html
<div class="table-container">
  <table class="table">
    <thead class="table-header">
      <tr>
        <th class="table-header-cell">Name</th>
        <th class="table-header-cell">Email</th>
        <th class="table-header-cell">Actions</th>
      </tr>
    </thead>
    <tbody class="table-body">
      <tr class="table-row">
        <td class="table-cell">John Doe</td>
        <td class="table-cell">john@example.com</td>
        <td class="table-cell">
          <div class="table-actions">
            <button class="btn-icon btn-icon-secondary">
              <Edit className="h-4 w-4" />
            </button>
            <button class="btn-icon btn-icon-secondary">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Badge System

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
<span class="badge badge-gray">Gray</span>
<span class="badge badge-purple">Purple</span>
<span class="badge badge-orange">Orange</span>
```

---

## Modal/Dialog System

```html
<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <h3 class="card-title">Modal Title</h3>
    </div>
    <div class="modal-body">
      <p class="body-text">Modal content</p>
    </div>
    <div class="modal-footer">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

---

## Form Section System

### Form Section with Color-coded Titles
```html
<div class="form-section">
  <h3 class="form-section-title blue">
    <span>Basic Information</span>
  </h3>
  <div class="form-section-content">
    <div class="form-grid">
      <div>
        <label class="form-label">Name</label>
        <input type="text" class="input-field" />
      </div>
      <div>
        <label class="form-label">Email</label>
        <input type="email" class="input-field" />
      </div>
    </div>
    <div class="form-grid-full">
      <div>
        <label class="form-label">Address</label>
        <textarea class="textarea-field"></textarea>
      </div>
    </div>
  </div>
</div>
```

### Available Color Classes
- `blue` - Blue indicator
- `green` - Green indicator
- `red` - Red indicator
- `purple` - Purple indicator
- `orange` - Orange indicator
- `yellow` - Yellow indicator

---

## Status Indicators

```html
<div class="status-indicator">
  <div class="status-dot active"></div>
  <span class="status-text">Active</span>
</div>

<div class="status-indicator">
  <div class="status-dot inactive"></div>
  <span class="status-text">Inactive</span>
</div>

<div class="status-indicator">
  <div class="status-dot pending"></div>
  <span class="status-text">Pending</span>
</div>
```

---

## Loading States

### Loading Spinner
```html
<div class="loading-spinner w-6 h-6"></div>
```

### Loading Overlay
```html
<div class="loading-overlay">
  <div class="loading-content">
    <div class="loading-spinner w-8 h-8"></div>
    <p class="body-text">Loading...</p>
  </div>
</div>
```

---

## Utility Classes

### Spacing
```html
<div class="section-spacing">
  <!-- 8 units of vertical spacing between children -->
</div>

<div class="card-spacing">
  <!-- 6 units of vertical spacing between children -->
</div>

<div class="form-spacing">
  <!-- 4 units of vertical spacing between children -->
</div>
```

### Transitions
```html
<div class="transition-smooth">
  <!-- 300ms smooth transition -->
</div>

<div class="transition-fast">
  <!-- 200ms fast transition -->
</div>
```

### Shadows
```html
<div class="shadow-soft">
  <!-- Soft shadow -->
</div>

<div class="shadow-medium">
  <!-- Medium shadow -->
</div>

<div class="shadow-strong">
  <!-- Strong shadow -->
</div>
```

---

## Usage Guidelines

### 1. Typography Hierarchy
- Use `page-title` for main page headings
- Use `section-title` for major sections
- Use `card-title` for card headers
- Use `body-text` for regular content
- Use `value-text` for displaying data values

### 2. Form Structure
- Always use `form-label` for labels
- Use `form-label-required` for required fields
- Group related fields in `form-section` with color-coded titles
- Use `form-grid` for two-column layouts
- Use `form-grid-full` for full-width fields

### 3. Button Usage
- Use `btn-primary` for main actions
- Use `btn-secondary` for secondary actions
- Use `btn-success` for positive actions
- Use `btn-danger` for destructive actions
- Use `btn-ghost` for subtle actions
- Use `btn-icon` for icon-only buttons

### 4. Card Usage
- Use `card` for basic containers
- Add `card-hover` for interactive cards
- Use `card-header`, `card-body`, `card-footer` for structured content
- Use info/success/warning/error cards for status messages

### 5. Table Structure
- Always wrap tables in `table-container`
- Use `table-header-cell` for column headers
- Use `table-cell` for data cells
- Use `table-actions` for action buttons in cells

### 6. Status and Feedback
- Use appropriate badge colors for status
- Use status indicators for active/inactive states
- Use loading states for async operations
- Use info/success/warning/error cards for user feedback

### 7. Responsive Design
- All components are responsive by default
- Use `form-grid` for responsive two-column layouts
- Tables automatically handle mobile layouts
- Cards stack properly on smaller screens

### 8. Dark Mode
- All components support dark mode automatically
- Colors and shadows adjust based on theme
- No additional classes needed for dark mode

### 9. Accessibility
- All interactive elements have proper focus states
- Color contrast meets WCAG guidelines
- Screen reader friendly structure
- Keyboard navigation support

### 10. Performance
- CSS classes are optimized for minimal bundle size
- Transitions use hardware acceleration
- No JavaScript required for styling
- Efficient CSS selectors

---

## Example Implementation

Here's a complete example of a product form using the design system:

```html
<div class="form-section">
  <h3 class="form-section-title blue">
    <span>Product Information</span>
  </h3>
  <div class="form-section-content">
    <div class="form-grid">
      <div>
        <label class="form-label-required">Product Name</label>
        <input type="text" class="input-field" placeholder="Enter product name" />
      </div>
      <div>
        <label class="form-label">HS Code</label>
        <input type="text" class="input-field" placeholder="Enter HS code" />
      </div>
    </div>
    <div class="form-grid">
      <div>
        <label class="form-label">Category</label>
        <select class="select-field">
          <option>Select category</option>
          <option>Electronics</option>
          <option>Clothing</option>
        </select>
      </div>
      <div>
        <label class="form-label">Supplier</label>
        <select class="select-field">
          <option>Select supplier</option>
          <option>Supplier A</option>
          <option>Supplier B</option>
        </select>
      </div>
    </div>
    <div class="form-grid-full">
      <div>
        <label class="form-label">Description</label>
        <textarea class="textarea-field" placeholder="Enter product description"></textarea>
      </div>
    </div>
  </div>
</div>

<div class="form-section">
  <h3 class="form-section-title green">
    <span>Pricing & Stock</span>
  </h3>
  <div class="form-section-content">
    <div class="form-grid">
      <div>
        <label class="form-label-required">Unit Price</label>
        <input type="number" class="input-field" placeholder="0.00" />
      </div>
      <div>
        <label class="form-label-required">Stock Quantity</label>
        <input type="number" class="input-field" placeholder="0" />
      </div>
    </div>
  </div>
</div>

<div class="card-footer">
  <button class="btn-secondary">Cancel</button>
  <button class="btn-primary">Save Product</button>
</div>
```

This design system ensures consistency, maintainability, and a professional appearance across the entire application. 