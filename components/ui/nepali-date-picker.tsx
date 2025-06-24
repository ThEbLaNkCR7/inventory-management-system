"use client"

import React, { useEffect, useState } from 'react'
import { Input } from './input'
import { Label } from './label'
import { Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'

// Try to load the Nepali date library
let NepaliDate: any = null
try {
  NepaliDate = require('nepali-date')
} catch (error) {
  console.warn('Nepali date library not available, using fallback conversion')
}

interface NepaliDatePickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

// Nepali months
const nepaliMonths = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashoj',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
]

// Nepali years (2020-2090)
const nepaliYears = Array.from({ length: 71 }, (_, i) => 2020 + i)

// Get accurate days in month for a specific Nepali year and month
const getDaysInMonth = (year: number, month: number): number => {
  try {
    // Create a NepaliDate object for the first day of the month
    const nepaliDate = new NepaliDate(year, month, 1)
    
    // Get the last day of the month by going to next month and subtracting 1 day
    const nextMonth = new NepaliDate(year, month + 1, 1)
    const lastDay = new NepaliDate(nextMonth.getTime() - 24 * 60 * 60 * 1000)
    
    return lastDay.getDate()
  } catch (error) {
    // Fallback to approximate values if library fails
    const fallbackDays: { [key: number]: number } = {
      1: 31, 2: 31, 3: 31, 4: 31, 5: 31, 6: 30,
      7: 29, 8: 29, 9: 30, 10: 29, 11: 30, 12: 30
    }
    return fallbackDays[month] || 30
  }
}

export function NepaliDatePicker({ 
  value, 
  onChange, 
  label, 
  placeholder = "Select Nepali date",
  className,
  disabled = false
}: NepaliDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + 57)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState(new Date().getDate())
  const [previewYear, setPreviewYear] = useState(new Date().getFullYear() + 57)
  const [previewMonth, setPreviewMonth] = useState(new Date().getMonth() + 1)
  const [previewDay, setPreviewDay] = useState(new Date().getDate())

  // Convert Gregorian to Nepali date using the library
  const gregorianToNepali = (date: Date) => {
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

  // Convert Nepali to Gregorian date using the library
  const nepaliToGregorian = (nepaliYear: number, nepaliMonth: number, nepaliDay: number) => {
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

  // Format Nepali date for display
  const formatNepaliDate = (year: number, month: number, day: number) => {
    return `${year} ${nepaliMonths[month - 1]} ${day}`
  }

  // Format date for button display (both Nepali and Gregorian)
  const formatDateForDisplay = (year: number, month: number, day: number) => {
    const nepaliDate = formatNepaliDate(year, month, day)
    try {
      const gregorianDate = nepaliToGregorian(year, month, day)
      const gregorianFormatted = gregorianDate.toLocaleDateString("en-IN")
      return `${nepaliDate} (${gregorianFormatted})`
    } catch (error) {
      return nepaliDate
    }
  }

  // Parse value if it exists
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value)
        const nepaliDate = gregorianToNepali(date)
        setSelectedYear(nepaliDate.year)
        setSelectedMonth(nepaliDate.month)
        setSelectedDay(nepaliDate.day)
        setPreviewYear(nepaliDate.year)
        setPreviewMonth(nepaliDate.month)
        setPreviewDay(nepaliDate.day)
      } catch (error) {
        console.error('Error parsing date:', error)
      }
    }
  }, [value])

  // Reset preview when opening modal
  useEffect(() => {
    if (isOpen) {
      setPreviewYear(selectedYear)
      setPreviewMonth(selectedMonth)
      setPreviewDay(selectedDay)
    }
  }, [isOpen])

  const handleDatePreview = (day: number) => {
    setPreviewDay(day)
  }

  const handleMonthPreview = (month: number) => {
    setPreviewMonth(month)
    // Reset to day 1 when changing month, but validate it exists
    const daysInNewMonth = getDaysInMonth(previewYear, month)
    setPreviewDay(Math.min(1, daysInNewMonth))
  }

  const handleYearPreview = (year: number) => {
    setPreviewYear(year)
    // Reset to day 1 when changing year, but validate it exists
    const daysInNewMonth = getDaysInMonth(year, previewMonth)
    setPreviewDay(Math.min(1, daysInNewMonth))
  }

  const handleConfirm = () => {
    setSelectedYear(previewYear)
    setSelectedMonth(previewMonth)
    setSelectedDay(previewDay)
    const gregorianDate = nepaliToGregorian(previewYear, previewMonth, previewDay)
    const dateString = gregorianDate.toISOString().split('T')[0]
    console.log('Nepali Date:', { year: previewYear, month: previewMonth, day: previewDay })
    console.log('Gregorian Date:', gregorianDate)
    console.log('Date String:', dateString)
    onChange(dateString)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  const handlePreviousMonth = () => {
    let newMonth = previewMonth - 1
    let newYear = previewYear
    
    if (newMonth < 1) {
      newMonth = 12
      newYear = previewYear - 1
    }
    
    handleMonthPreview(newMonth)
    setPreviewYear(newYear)
  }

  const handleNextMonth = () => {
    let newMonth = previewMonth + 1
    let newYear = previewYear
    
    if (newMonth > 12) {
      newMonth = 1
      newYear = previewYear + 1
    }
    
    handleMonthPreview(newMonth)
    setPreviewYear(newYear)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = []
    const daysInCurrentMonth = getDaysInMonth(previewYear, previewMonth)
    
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()

  return (
    <div className={className}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Button
        variant="outline"
        className="w-full justify-start text-left font-normal"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!disabled) {
            setIsOpen(true)
          }
        }}
        type="button"
        disabled={disabled}
      >
        <Calendar className="mr-2 h-4 w-4" />
        {value ? formatDateForDisplay(selectedYear, selectedMonth, selectedDay) : placeholder}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Select Nepali Date</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Preview Display */}
            <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">Selected Date:</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatNepaliDate(previewYear, previewMonth, previewDay)}
              </div>
            </div>
            
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <select
                  value={previewMonth}
                  onChange={(e) => handleMonthPreview(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm bg-transparent font-medium"
                >
                  {nepaliMonths.map((month, index) => (
                    <option key={index + 1} value={index + 1}>{month}</option>
                  ))}
                </select>
                
                <select
                  value={previewYear}
                  onChange={(e) => handleYearPreview(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm bg-transparent font-medium w-20"
                >
                  {nepaliYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['आ', 'सो', 'मं', 'बु', 'बि', 'शु', 'श'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 p-2 h-8 flex items-center justify-center">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map(day => (
                <Button
                  key={day}
                  variant={previewDay === day ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleDatePreview(day)}
                >
                  {day}
                </Button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-3 border-t">
              <Button variant="outline" onClick={handleCancel} type="button">
                Cancel
              </Button>
              <Button onClick={handleConfirm} type="button">
                Select Date
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 