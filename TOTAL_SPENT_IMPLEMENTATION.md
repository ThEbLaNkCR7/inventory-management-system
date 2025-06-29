# Total Spent Implementation

This document explains how the total spent calculations work for clients and suppliers in the inventory management system.

## Overview

The system now automatically calculates and updates the total spent values for both clients and suppliers based on actual transaction data (sales and purchases).

## How It Works

### For Clients (Total Spent)
- **Calculation**: Sum of all sales to that client
- **Formula**: `totalSpent = sum(sales.quantitySold * sales.salePrice) where sales.client = clientName`
- **Updates**: Automatically updated when sales are added, modified, or deleted

### For Suppliers (Total Spent)
- **Calculation**: Sum of all purchases from that supplier
- **Formula**: `totalSpent = sum(purchases.quantityPurchased * purchases.purchasePrice) where purchases.supplier = supplierName`
- **Updates**: Automatically updated when purchases are added, modified, or deleted

## Implementation Details

### 1. Database Models
- **Client Model**: Added `totalSpent`, `orders`, and `lastOrder` fields
- **Supplier Model**: Already had `totalSpent`, `orders`, and `lastOrder` fields

### 2. Context Functions
The `InventoryContext` provides several utility functions:

```typescript
// Calculate totals
getClientTotalSpent(clientName: string): number
getSupplierTotalSpent(supplierName: string): number

// Calculate order counts
getClientOrderCount(clientName: string): number
getSupplierOrderCount(supplierName: string): number

// Get last order dates
getClientLastOrder(clientName: string): string | null
getSupplierLastOrder(supplierName: string): string | null

// Update statistics
updateClientStats(clientName: string): Promise<void>
updateSupplierStats(supplierName: string): Promise<void>
refreshAllTotals(): Promise<void>
```

### 3. Automatic Updates
- When a sale is added/updated/deleted → Client stats are automatically updated
- When a purchase is added/updated/deleted → Supplier stats are automatically updated

### 4. Frontend Display
- **ClientsPage**: Shows real calculated total spent instead of random values
- **SuppliersPage**: Shows real calculated total spent instead of random values

## Migration from Old System

### For Existing Data
Run the migration script to update existing clients and suppliers:

```bash
node update-totals.js
```

This script will:
1. Calculate totals for all existing clients based on their sales history
2. Calculate totals for all existing suppliers based on their purchase history
3. Update the database with the calculated values

### For New Data
New clients and suppliers will automatically have their totals calculated as transactions are added.

## Usage Examples

### Getting Client Total Spent
```typescript
const { getClientTotalSpent } = useInventory()
const totalSpent = getClientTotalSpent("John Doe")
console.log(`John Doe has spent Rs ${totalSpent.toFixed(2)}`)
```

### Getting Supplier Total Spent
```typescript
const { getSupplierTotalSpent } = useInventory()
const totalSpent = getSupplierTotalSpent("ABC Supplies")
console.log(`ABC Supplies total: Rs ${totalSpent.toFixed(2)}`)
```

### Refreshing All Totals
```typescript
const { refreshAllTotals } = useInventory()
await refreshAllTotals() // Updates all client and supplier totals
```

## Benefits

1. **Real-time Accuracy**: Totals are always up-to-date with actual transaction data
2. **Automatic Updates**: No manual intervention required
3. **Data Integrity**: Eliminates discrepancies between stored totals and actual transactions
4. **Performance**: Calculations are done efficiently using reduce operations
5. **Consistency**: Same calculation logic used everywhere in the application

## Error Handling

- All update functions include proper error handling
- Failed updates are logged but don't break the application
- Database operations are wrapped in try-catch blocks
- Null values are handled gracefully

## Future Enhancements

Potential improvements could include:
- Caching calculated values for better performance
- Batch updates for multiple transactions
- Historical total tracking (monthly/yearly breakdowns)
- Export functionality for total spent reports 