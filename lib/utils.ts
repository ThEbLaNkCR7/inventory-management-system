import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { englishToNepali } from './nepaliDateUtils'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export Nepali date utilities for backward compatibility
export {
  englishToNepali,
  nepaliToEnglish,
  formatNepaliDate,
  getCurrentNepaliDate,
  getCurrentNepaliYear,
  getCurrentNepaliMonth,
  getCurrentNepaliDay,
  getNepaliYear,
  getNepaliMonth,
  getNepaliDay,
  getNepaliMonthName,
  getNepaliMonthNameNepali,
  formatNepaliDateForTable,
  formatDateForReports,
  formatDateForInput,
  getNepaliMonthDates,
  getNepaliYearDates,
  isNepaliToday,
  isCurrentNepaliMonth,
  isCurrentNepaliYear,
  getNepaliDateDifference,
  addNepaliDays,
  subtractNepaliDays,
  getNepaliFiscalYear,
  isValidNepaliDate,
  parseNepaliDate,
  getLastNDays,
  getLastNMonths,
  formatNepaliDateCustom,
  NEPALI_DATE_FORMATS,
  NEPALI_MONTHS,
  NEPALI_MONTHS_NEPALI,
  NEPALI_MONTHS_SHORT,
  NEPALI_DAYS,
  NEPALI_DAYS_NEPALI,
  NEPALI_DAYS_SHORT
} from './nepaliDateUtils'

// Legacy function for backward compatibility
export function gregorianToNepali(date: Date) {
  const nepaliDate = englishToNepali(date)
  return {
    year: nepaliDate.getYear(),
    month: nepaliDate.getMonth() + 1,
    day: nepaliDate.getDate()
  }
}

// Legacy function for backward compatibility
export function nepaliToGregorian(nepaliYear: number, nepaliMonth: number, nepaliDay: number) {
  try {
    const nepaliDate = new (require('nepali-date'))(nepaliYear, nepaliMonth - 1, nepaliDay)
    return nepaliDate.toJsDate()
  } catch (error) {
    console.warn('Error using Nepali date library, using fallback:', error)
    // Fallback to approximate conversion
    const gregorianYear = nepaliYear - 57
    const gregorianMonth = nepaliMonth - 1
    const gregorianDay = nepaliDay
    return new Date(gregorianYear, gregorianMonth, gregorianDay)
  }
}

// Legacy function for backward compatibility
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

// Utility function to clear all local data for deployment
export function clearAllLocalData() {
  if (typeof window !== 'undefined') {
    // Clear all localStorage items
    localStorage.clear()
    
    // Clear all sessionStorage items
    sessionStorage.clear()
    
    // Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    
    console.log('All local data cleared successfully')
  }
}

// Utility function to reset the entire application state
export function resetApplication() {
  if (typeof window !== 'undefined') {
    // Clear all local data
    clearAllLocalData()
    
    // Reload the page to reset all React state
    window.location.reload()
    
    console.log('Application reset successfully')
  }
}
