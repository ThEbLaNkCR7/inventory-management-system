import NepaliDate from 'nepali-date'

// Nepali month names
export const NEPALI_MONTHS = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashoj',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
]

// Nepali month names in Nepali script
export const NEPALI_MONTHS_NEPALI = [
  'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज',
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत'
]

// Short month names
export const NEPALI_MONTHS_SHORT = [
  'Bai', 'Jes', 'Asa', 'Shr', 'Bha', 'Ashoj',
  'Kar', 'Man', 'Pou', 'Mag', 'Fal', 'Chai'
]

// Day names in English
export const NEPALI_DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

// Day names in Nepali
export const NEPALI_DAYS_NEPALI = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहिबार', 'शुक्रबार', 'शनिबार'
]

// Short day names
export const NEPALI_DAYS_SHORT = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
]

/**
 * Convert English date to Nepali date
 * @param englishDate - English date string or Date object
 * @returns NepaliDate object
 */
export function englishToNepali(englishDate: string | Date): NepaliDate {
  const date = typeof englishDate === 'string' ? new Date(englishDate) : englishDate
  return new NepaliDate(date)
}

/**
 * Convert Nepali date to English date
 * @param nepaliDate - NepaliDate object or Nepali date string
 * @returns Date object
 */
export function nepaliToEnglish(nepaliDate: NepaliDate | string): Date {
  if (typeof nepaliDate === 'string') {
    // Parse Nepali date string (format: YYYY-MM-DD)
    const [year, month, day] = nepaliDate.split('-').map(Number)
    const nepaliDateObj = new NepaliDate(year, month - 1, day)
    return nepaliDateObj.toJsDate()
  }
  return nepaliDate.toJsDate()
}

/**
 * Format Nepali date to string
 * @param nepaliDate - NepaliDate object or English date
 * @param format - Format string
 * @returns Formatted date string
 */
export function formatNepaliDate(
  nepaliDate: NepaliDate | string | Date,
  format: string = 'YYYY-MM-DD'
): string {
  let nepaliDateObj: NepaliDate

  if (nepaliDate instanceof NepaliDate) {
    nepaliDateObj = nepaliDate
  } else if (typeof nepaliDate === 'string') {
    nepaliDateObj = englishToNepali(nepaliDate)
  } else {
    nepaliDateObj = englishToNepali(nepaliDate)
  }

  const year = nepaliDateObj.getYear()
  const month = nepaliDateObj.getMonth()
  const day = nepaliDateObj.getDate()
  const dayOfWeek = nepaliDateObj.getDay()

  return format
    .replace('YYYY', year.toString())
    .replace('YY', year.toString().slice(-2))
    .replace('MM', (month + 1).toString().padStart(2, '0'))
    .replace('M', (month + 1).toString())
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('D', day.toString())
    .replace('dddd', NEPALI_DAYS[dayOfWeek])
    .replace('ddd', NEPALI_DAYS_SHORT[dayOfWeek])
    .replace('MMMM', NEPALI_MONTHS[month])
    .replace('MMM', NEPALI_MONTHS_SHORT[month])
    .replace('MMMM_NP', NEPALI_MONTHS_NEPALI[month])
    .replace('dddd_NP', NEPALI_DAYS_NEPALI[dayOfWeek])
}

/**
 * Get current Nepali date
 * @returns NepaliDate object
 */
export function getCurrentNepaliDate(): NepaliDate {
  return new NepaliDate()
}

/**
 * Get current Nepali year
 * @returns Current Nepali year
 */
export function getCurrentNepaliYear(): number {
  return new NepaliDate().getYear()
}

/**
 * Get current Nepali month (1-12)
 * @returns Current Nepali month
 */
export function getCurrentNepaliMonth(): number {
  return new NepaliDate().getMonth() + 1
}

/**
 * Get current Nepali day
 * @returns Current Nepali day
 */
export function getCurrentNepaliDay(): number {
  return new NepaliDate().getDate()
}

/**
 * Get Nepali year from English date
 * @param englishDate - English date string or Date object
 * @returns Nepali year
 */
export function getNepaliYear(englishDate: string | Date): number {
  return englishToNepali(englishDate).getYear()
}

/**
 * Get Nepali month from English date
 * @param englishDate - English date string or Date object
 * @returns Nepali month (1-12)
 */
export function getNepaliMonth(englishDate: string | Date): number {
  return englishToNepali(englishDate).getMonth() + 1
}

/**
 * Get Nepali day from English date
 * @param englishDate - English date string or Date object
 * @returns Nepali day
 */
export function getNepaliDay(englishDate: string | Date): number {
  return englishToNepali(englishDate).getDate()
}

/**
 * Get Nepali month name from English date
 * @param englishDate - English date string or Date object
 * @returns Nepali month name
 */
export function getNepaliMonthName(englishDate: string | Date): string {
  const month = getNepaliMonth(englishDate)
  return NEPALI_MONTHS[month - 1]
}

/**
 * Get Nepali month name in Nepali script from English date
 * @param englishDate - English date string or Date object
 * @returns Nepali month name in Nepali script
 */
export function getNepaliMonthNameNepali(englishDate: string | Date): string {
  const month = getNepaliMonth(englishDate)
  return NEPALI_MONTHS_NEPALI[month - 1]
}

/**
 * Format date for display in tables
 * @param englishDate - English date string or Date object
 * @returns Formatted Nepali date string
 */
export function formatNepaliDateForTable(englishDate: string | Date): string {
  try {
    const nepaliDate = englishToNepali(englishDate)
    const year = nepaliDate.getYear()
    const month = nepaliDate.getMonth()
    const day = nepaliDate.getDate()
    
    return `${year} ${NEPALI_MONTHS[month]} ${day}`
  } catch (error) {
    console.error('Error formatting Nepali date:', error)
    // Fallback to original date
    const date = typeof englishDate === 'string' ? new Date(englishDate) : englishDate
    return date.toLocaleDateString('en-IN')
  }
}

/**
 * Format date for reports
 * @param englishDate - English date string or Date object
 * @returns Formatted date string with both English and Nepali
 */
export function formatDateForReports(englishDate: string | Date): string {
  try {
    const date = typeof englishDate === 'string' ? new Date(englishDate) : englishDate
    const nepaliDate = englishToNepali(date)
    
    const englishFormatted = date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    
    const nepaliFormatted = formatNepaliDate(nepaliDate, 'YYYY MMM DD')
    
    return `${englishFormatted} (${nepaliFormatted})`
  } catch (error) {
    console.error('Error formatting date for reports:', error)
    const date = typeof englishDate === 'string' ? new Date(englishDate) : englishDate
    return date.toLocaleDateString('en-IN')
  }
}

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param englishDate - English date string or Date object
 * @returns Formatted date string
 */
export function formatDateForInput(englishDate: string | Date): string {
  try {
    const nepaliDate = englishToNepali(englishDate)
    return formatNepaliDate(nepaliDate, 'YYYY-MM-DD')
  } catch (error) {
    console.error('Error formatting date for input:', error)
    const date = typeof englishDate === 'string' ? new Date(englishDate) : englishDate
    return date.toISOString().split('T')[0]
  }
}

/**
 * Get Nepali date range for a month
 * @param year - Nepali year
 * @param month - Nepali month (1-12)
 * @returns Array of Nepali dates for the month
 */
export function getNepaliMonthDates(year: number, month: number): NepaliDate[] {
  const dates: NepaliDate[] = []
  const nepaliDate = new NepaliDate(year, month - 1, 1)
  const daysInMonth = nepaliDate.getDaysInMonth()
  
  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new NepaliDate(year, month - 1, day))
  }
  
  return dates
}

/**
 * Get Nepali date range for a year
 * @param year - Nepali year
 * @returns Array of Nepali dates for the year
 */
export function getNepaliYearDates(year: number): NepaliDate[] {
  const dates: NepaliDate[] = []
  
  for (let month = 0; month < 12; month++) {
    const monthDates = getNepaliMonthDates(year, month + 1)
    dates.push(...monthDates)
  }
  
  return dates
}

/**
 * Check if a date is today in Nepali calendar
 * @param englishDate - English date string or Date object
 * @returns boolean
 */
export function isNepaliToday(englishDate: string | Date): boolean {
  const today = getCurrentNepaliDate()
  const date = englishToNepali(englishDate)
  
  return today.getYear() === date.getYear() &&
         today.getMonth() === date.getMonth() &&
         today.getDate() === date.getDate()
}

/**
 * Check if a date is in current Nepali month
 * @param englishDate - English date string or Date object
 * @returns boolean
 */
export function isCurrentNepaliMonth(englishDate: string | Date): boolean {
  const today = getCurrentNepaliDate()
  const date = englishToNepali(englishDate)
  
  return today.getYear() === date.getYear() &&
         today.getMonth() === date.getMonth()
}

/**
 * Check if a date is in current Nepali year
 * @param englishDate - English date string or Date object
 * @returns boolean
 */
export function isCurrentNepaliYear(englishDate: string | Date): boolean {
  const today = getCurrentNepaliDate()
  const date = englishToNepali(englishDate)
  
  return today.getYear() === date.getYear()
}

/**
 * Get Nepali date difference in days
 * @param date1 - First English date
 * @param date2 - Second English date
 * @returns Difference in days
 */
export function getNepaliDateDifference(date1: string | Date, date2: string | Date): number {
  const nepaliDate1 = englishToNepali(date1)
  const nepaliDate2 = englishToNepali(date2)
  
  const timeDiff = Math.abs(nepaliDate2.toJsDate().getTime() - nepaliDate1.toJsDate().getTime())
  return Math.ceil(timeDiff / (1000 * 3600 * 24))
}

/**
 * Add days to Nepali date
 * @param englishDate - English date string or Date object
 * @param days - Number of days to add
 * @returns New NepaliDate object
 */
export function addNepaliDays(englishDate: string | Date, days: number): NepaliDate {
  const nepaliDate = englishToNepali(englishDate)
  const jsDate = nepaliDate.toJsDate()
  jsDate.setDate(jsDate.getDate() + days)
  return new NepaliDate(jsDate)
}

/**
 * Subtract days from Nepali date
 * @param englishDate - English date string or Date object
 * @param days - Number of days to subtract
 * @returns New NepaliDate object
 */
export function subtractNepaliDays(englishDate: string | Date, days: number): NepaliDate {
  return addNepaliDays(englishDate, -days)
}

/**
 * Get Nepali fiscal year (starts from Baisakh)
 * @param englishDate - English date string or Date object
 * @returns Fiscal year string (e.g., "2080-81")
 */
export function getNepaliFiscalYear(englishDate: string | Date): string {
  const nepaliDate = englishToNepali(englishDate)
  const year = nepaliDate.getYear()
  const month = nepaliDate.getMonth()
  
  // Fiscal year starts from Baisakh (month 0)
  if (month >= 0 && month <= 2) { // Baisakh to Asar
    return `${year}-${(year + 1).toString().slice(-2)}`
  } else {
    return `${year + 1}-${(year + 2).toString().slice(-2)}`
  }
}

/**
 * Validate Nepali date
 * @param year - Nepali year
 * @param month - Nepali month (1-12)
 * @param day - Nepali day
 * @returns boolean
 */
export function isValidNepaliDate(year: number, month: number, day: number): boolean {
  try {
    const nepaliDate = new NepaliDate(year, month - 1, day)
    const daysInMonth = nepaliDate.getDaysInMonth()
    return day >= 1 && day <= daysInMonth
  } catch (error) {
    return false
  }
}

/**
 * Get Nepali date from string input
 * @param dateString - Date string in format "YYYY-MM-DD" or "YYYY/MM/DD"
 * @returns NepaliDate object or null if invalid
 */
export function parseNepaliDate(dateString: string): NepaliDate | null {
  try {
    const [year, month, day] = dateString.split(/[-/]/).map(Number)
    
    if (!year || !month || !day) {
      return null
    }
    
    if (!isValidNepaliDate(year, month, day)) {
      return null
    }
    
    return new NepaliDate(year, month - 1, day)
  } catch (error) {
    return null
  }
}

/**
 * Get Nepali date range for last N days
 * @param days - Number of days to go back
 * @returns Array of Nepali dates
 */
export function getLastNDays(days: number): NepaliDate[] {
  const dates: NepaliDate[] = []
  const today = getCurrentNepaliDate()
  
  for (let i = days - 1; i >= 0; i--) {
    dates.push(subtractNepaliDays(today.toJsDate(), i))
  }
  
  return dates
}

/**
 * Get Nepali date range for last N months
 * @param months - Number of months to go back
 * @returns Array of Nepali dates (first day of each month)
 */
export function getLastNMonths(months: number): NepaliDate[] {
  const dates: NepaliDate[] = []
  const today = getCurrentNepaliDate()
  
  for (let i = months - 1; i >= 0; i--) {
    const jsDate = today.toJsDate()
    jsDate.setMonth(jsDate.getMonth() - i)
    dates.push(new NepaliDate(jsDate))
  }
  
  return dates
}

/**
 * Format Nepali date for display with custom format
 * @param englishDate - English date string or Date object
 * @param format - Custom format string
 * @returns Formatted date string
 */
export function formatNepaliDateCustom(
  englishDate: string | Date,
  format: string
): string {
  return formatNepaliDate(englishDate, format)
}

// Export commonly used formats
export const NEPALI_DATE_FORMATS = {
  FULL: 'YYYY MMMM DD, dddd',
  SHORT: 'YYYY-MM-DD',
  MEDIUM: 'YYYY MMM DD',
  LONG: 'YYYY MMMM DD',
  WITH_DAY: 'YYYY MMMM DD, ddd',
  NEPALI_FULL: 'YYYY MMMM_NP DD, dddd_NP',
  NEPALI_SHORT: 'YYYY-MM-DD',
  NEPALI_MEDIUM: 'YYYY MMMM_NP DD'
} as const 