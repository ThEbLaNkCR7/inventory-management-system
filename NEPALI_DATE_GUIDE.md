# Nepali Date Conversion Guide

This guide explains how to convert between English (Gregorian) and Nepali (Bikram Sambat) dates in the inventory management system.

## Overview

The system uses the `nepali-date` library to provide accurate conversion between English and Nepali calendars. All date conversions are handled through the comprehensive utility system in `lib/nepaliDateUtils.ts`.

## Quick Start

### Basic Conversion

```typescript
import { englishToNepali, nepaliToEnglish, formatNepaliDate } from '@/lib/nepaliDateUtils'

// Convert English date to Nepali
const englishDate = new Date('2024-01-15')
const nepaliDate = englishToNepali(englishDate)
console.log(nepaliDate.getYear()) // 2080
console.log(nepaliDate.getMonth()) // 0 (Baisakh)
console.log(nepaliDate.getDate()) // 2

// Convert Nepali date to English
const nepaliDateObj = new NepaliDate(2080, 0, 2) // 2080 Baisakh 2
const englishDateObj = nepaliToEnglish(nepaliDateObj)
console.log(englishDateObj.toLocaleDateString()) // 1/15/2024

// Format Nepali date
const formatted = formatNepaliDate(nepaliDate, 'YYYY MMMM DD')
console.log(formatted) // "2080 Baisakh 2"
```

### Current Date

```typescript
import { 
  getCurrentNepaliDate, 
  getCurrentNepaliYear, 
  getCurrentNepaliMonth, 
  getCurrentNepaliDay 
} from '@/lib/nepaliDateUtils'

const currentNepali = getCurrentNepaliDate()
const year = getCurrentNepaliYear() // e.g., 2080
const month = getCurrentNepaliMonth() // e.g., 10 (Mangsir)
const day = getCurrentNepaliDay() // e.g., 15
```

## Available Functions

### Core Conversion Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `englishToNepali()` | Convert English date to Nepali | `Date` or `string` | `NepaliDate` |
| `nepaliToEnglish()` | Convert Nepali date to English | `NepaliDate` or `string` | `Date` |
| `formatNepaliDate()` | Format Nepali date with custom format | `NepaliDate/Date/string`, `format` | `string` |

### Current Date Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `getCurrentNepaliDate()` | Get current Nepali date object | `NepaliDate` |
| `getCurrentNepaliYear()` | Get current Nepali year | `number` |
| `getCurrentNepaliMonth()` | Get current Nepali month (1-12) | `number` |
| `getCurrentNepaliDay()` | Get current Nepali day | `number` |

### Date Component Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `getNepaliYear()` | Get Nepali year from English date | `Date` or `string` | `number` |
| `getNepaliMonth()` | Get Nepali month from English date | `Date` or `string` | `number` |
| `getNepaliDay()` | Get Nepali day from English date | `Date` or `string` | `number` |
| `getNepaliMonthName()` | Get Nepali month name | `Date` or `string` | `string` |
| `getNepaliMonthNameNepali()` | Get Nepali month name in Nepali script | `Date` or `string` | `string` |

### Formatting Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `formatNepaliDateForTable()` | Format for table display | `Date` or `string` | `string` |
| `formatDateForReports()` | Format for reports (both calendars) | `Date` or `string` | `string` |
| `formatDateForInput()` | Format for input fields | `Date` or `string` | `string` |

### Utility Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `isNepaliToday()` | Check if date is today | `Date` or `string` | `boolean` |
| `isCurrentNepaliMonth()` | Check if date is current month | `Date` or `string` | `boolean` |
| `isCurrentNepaliYear()` | Check if date is current year | `Date` or `string` | `boolean` |
| `getNepaliFiscalYear()` | Get fiscal year (Baisakh start) | `Date` or `string` | `string` |
| `isValidNepaliDate()` | Validate Nepali date | `year`, `month`, `day` | `boolean` |

## Date Formats

### Predefined Formats

```typescript
import { NEPALI_DATE_FORMATS } from '@/lib/nepaliDateUtils'

const formats = {
  FULL: 'YYYY MMMM DD, dddd',           // 2080 Baisakh 2, Sunday
  SHORT: 'YYYY-MM-DD',                  // 2080-01-02
  MEDIUM: 'YYYY MMM DD',                // 2080 Bai 2
  LONG: 'YYYY MMMM DD',                 // 2080 Baisakh 2
  WITH_DAY: 'YYYY MMMM DD, ddd',        // 2080 Baisakh 2, Sun
  NEPALI_FULL: 'YYYY MMMM_NP DD, dddd_NP', // 2080 बैशाख 2, आइतबार
  NEPALI_SHORT: 'YYYY-MM-DD',           // 2080-01-02
  NEPALI_MEDIUM: 'YYYY MMMM_NP DD'      // 2080 बैशाख 2
}
```

### Custom Formatting

```typescript
import { formatNepaliDate } from '@/lib/nepaliDateUtils'

const date = new Date('2024-01-15')
const nepaliDate = englishToNepali(date)

// Custom format
const custom = formatNepaliDate(nepaliDate, 'YYYY/MM/DD')
console.log(custom) // "2080/01/02"

// With day name
const withDay = formatNepaliDate(nepaliDate, 'dddd, YYYY MMMM DD')
console.log(withDay) // "Sunday, 2080 Baisakh 2"
```

## Month and Day Names

### English Names

```typescript
import { NEPALI_MONTHS, NEPALI_DAYS } from '@/lib/nepaliDateUtils'

const months = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashoj',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
]

const days = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]
```

### Nepali Script Names

```typescript
import { NEPALI_MONTHS_NEPALI, NEPALI_DAYS_NEPALI } from '@/lib/nepaliDateUtils'

const monthsNepali = [
  'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज',
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत'
]

const daysNepali = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'
]
```

## Usage Examples

### In React Components

```typescript
import { formatNepaliDateForTable, getCurrentNepaliYear } from '@/lib/nepaliDateUtils'

function ProductTable({ products }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Date Added</th>
        </tr>
      </thead>
      <tbody>
        {products.map(product => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>{formatNepaliDateForTable(product.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### In Forms

```typescript
import { formatDateForInput, englishToNepali } from '@/lib/nepaliDateUtils'

function DateInput({ value, onChange }) {
  const handleDateChange = (e) => {
    const englishDate = new Date(e.target.value)
    const nepaliDate = englishToNepali(englishDate)
    const formatted = formatDateForInput(nepaliDate)
    onChange(formatted)
  }

  return (
    <input
      type="date"
      value={value}
      onChange={handleDateChange}
    />
  )
}
```

### In Reports

```typescript
import { formatDateForReports, getCurrentNepaliYear } from '@/lib/nepaliDateUtils'

function SalesReport({ sales }) {
  const currentYear = getCurrentNepaliYear()
  
  return (
    <div>
      <h2>Sales Report - {currentYear}</h2>
      {sales.map(sale => (
        <div key={sale.id}>
          <span>{sale.product}</span>
          <span>{formatDateForReports(sale.date)}</span>
        </div>
      ))}
    </div>
  )
}
```

### Date Range Filtering

```typescript
import { 
  getNepaliYear, 
  getNepaliMonth, 
  isCurrentNepaliYear,
  isCurrentNepaliMonth 
} from '@/lib/nepaliDateUtils'

function filterByNepaliDateRange(data, startDate, endDate) {
  return data.filter(item => {
    const itemYear = getNepaliYear(item.date)
    const itemMonth = getNepaliMonth(item.date)
    
    // Filter by current Nepali year
    if (!isCurrentNepaliYear(item.date)) return false
    
    // Filter by specific month range
    if (itemMonth < 1 || itemMonth > 12) return false
    
    return true
  })
}
```

## Error Handling

The system includes comprehensive error handling:

```typescript
import { formatNepaliDateForTable } from '@/lib/nepaliDateUtils'

function safeDateFormat(dateString) {
  try {
    return formatNepaliDateForTable(dateString)
  } catch (error) {
    console.error('Error formatting date:', error)
    // Fallback to original date
    return new Date(dateString).toLocaleDateString('en-IN')
  }
}
```

## Validation

```typescript
import { isValidNepaliDate, parseNepaliDate } from '@/lib/nepaliDateUtils'

// Validate Nepali date components
const isValid = isValidNepaliDate(2080, 1, 32) // false (invalid day)

// Parse and validate Nepali date string
const nepaliDate = parseNepaliDate('2080-01-32') // null (invalid)
const validDate = parseNepaliDate('2080-01-15') // NepaliDate object
```

## Migration from Old System

If you're using the old date functions, here's how to migrate:

### Old vs New

```typescript
// OLD
import { gregorianToNepali, formatNepaliDateForTable } from '@/lib/utils'

// NEW
import { englishToNepali, formatNepaliDateForTable } from '@/lib/nepaliDateUtils'
// or
import { englishToNepali, formatNepaliDateForTable } from '@/lib/utils' // re-exported
```

### Backward Compatibility

The old functions are still available for backward compatibility:

```typescript
import { gregorianToNepali, nepaliToGregorian } from '@/lib/utils'

// These still work but use the new system internally
const nepaliDate = gregorianToNepali(new Date())
const englishDate = nepaliToGregorian(2080, 1, 15)
```

## Best Practices

1. **Always use the new functions** for new code
2. **Handle errors gracefully** with try-catch blocks
3. **Use appropriate formatting** for different contexts (tables, reports, inputs)
4. **Validate dates** before processing
5. **Use constants** for month and day names instead of hardcoding
6. **Consider timezone** when working with dates

## Troubleshooting

### Common Issues

1. **Invalid date errors**: Ensure dates are in valid format
2. **Timezone issues**: Use UTC dates when possible
3. **Library not found**: Ensure `nepali-date` is installed
4. **Format errors**: Check format string syntax

### Debug Mode

```typescript
import { formatNepaliDateForTable } from '@/lib/nepaliDateUtils'

// Enable debug logging
const originalConsoleLog = console.log
console.log = (...args) => {
  if (args[0]?.includes?.('date')) {
    originalConsoleLog(...args)
  }
}
```

## Performance Considerations

- Date conversions are cached internally by the library
- Format strings are processed efficiently
- Large date ranges should be processed in batches
- Consider memoizing frequently used date calculations

## Additional Resources

- [nepali-date library documentation](https://github.com/neilghosh/nepali-date)
- [Bikram Sambat calendar information](https://en.wikipedia.org/wiki/Vikram_Samvat)
- [Nepali date conversion tables](https://www.hamropatro.com/calendar) 