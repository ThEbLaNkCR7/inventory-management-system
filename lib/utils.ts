import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Nepali date utility functions
let NepaliDate: any = null

// Try to load the Nepali date library
try {
  NepaliDate = require('nepali-date')
} catch (error) {
  console.warn('Nepali date library not available, using fallback conversion')
}

// Convert Gregorian date to Nepali date
export function gregorianToNepali(date: Date) {
  if (NepaliDate) {
    try {
      const nepaliDate = new NepaliDate(date)
      return {
        year: nepaliDate.getYear(),
        month: nepaliDate.getMonth(),
        day: nepaliDate.getDate()
      }
    } catch (error) {
      console.warn('Error using Nepali date library, using fallback:', error)
    }
  }
  
  // Fallback to approximate conversion
  const year = date.getFullYear() + 57
  const month = date.getMonth() + 1
  const day = date.getDate()
  return { year, month, day }
}

// Convert Nepali date to Gregorian date
export function nepaliToGregorian(nepaliYear: number, nepaliMonth: number, nepaliDay: number) {
  if (NepaliDate) {
    try {
      const nepaliDate = new NepaliDate(nepaliYear, nepaliMonth, nepaliDay)
      return new Date(nepaliDate.getTime())
    } catch (error) {
      console.warn('Error using Nepali date library, using fallback:', error)
    }
  }
  
  // Fallback to approximate conversion
  const gregorianYear = nepaliYear - 57
  const gregorianMonth = nepaliMonth - 1
  const gregorianDay = nepaliDay
  return new Date(gregorianYear, gregorianMonth, gregorianDay)
}

// Format date for display (Nepali + Gregorian)
export function formatDateForDisplay(dateString: string) {
  try {
    const date = new Date(dateString)
    const nepaliDate = gregorianToNepali(date)
    const nepaliMonths = [
      'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashoj',
      'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
    ]
    
    const nepaliFormatted = `${nepaliDate.year} ${nepaliMonths[nepaliDate.month - 1]} ${nepaliDate.day}`
    const gregorianFormatted = date.toLocaleDateString("en-IN")
    
    return `${nepaliFormatted} (${gregorianFormatted})`
  } catch (error) {
    // Fallback to original date
    return new Date(dateString).toLocaleDateString("en-IN")
  }
}

// Format date for table display (Nepali only)
export function formatNepaliDateForTable(dateString: string) {
  try {
    console.log('Formatting date for table:', dateString)
    const date = new Date(dateString)
    console.log('Parsed date:', date)
    const nepaliDate = gregorianToNepali(date)
    console.log('Nepali date:', nepaliDate)
    const nepaliMonths = [
      'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashoj',
      'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
    ]
    
    const formatted = `${nepaliDate.year} ${nepaliMonths[nepaliDate.month - 1]} ${nepaliDate.day}`
    console.log('Formatted result:', formatted)
    return formatted
  } catch (error) {
    console.error('Error formatting Nepali date:', error)
    // Fallback to original date
    return new Date(dateString).toLocaleDateString("en-IN")
  }
}

// Utility function to clear all local data for deployment
export function clearAllLocalData() {
  if (typeof window !== 'undefined') {
    // Clear all localStorage items
    localStorage.clear()
    
    // Clear specific items that might be used
    localStorage.removeItem('user')
    localStorage.removeItem('currentSystem')
    localStorage.removeItem('sidebarOpen')
    localStorage.removeItem('employeeSidebarOpen')
    localStorage.removeItem('theme')
    
    // Clear any sessionStorage if used
    sessionStorage.clear()
    
    console.log('All local data cleared successfully')
  }
}

// Function to reset the application to initial state
export function resetApplication() {
  clearAllLocalData()
  
  // Reload the page to reset all contexts
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}
