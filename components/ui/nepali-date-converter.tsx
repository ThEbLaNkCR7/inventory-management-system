'use client'

import { useState } from 'react'
import NepaliDate from 'nepali-date'
import { Button } from './button'
import { Input } from './input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Label } from './label'
import { Badge } from './badge'
import {
  englishToNepali,
  nepaliToEnglish,
  formatNepaliDate,
  getCurrentNepaliDate,
  getCurrentNepaliYear,
  getCurrentNepaliMonth,
  getCurrentNepaliDay,
  NEPALI_DATE_FORMATS,
  NEPALI_MONTHS,
  NEPALI_MONTHS_NEPALI
} from '../../lib/nepaliDateUtils'

export function NepaliDateConverter() {
  const [englishDate, setEnglishDate] = useState('')
  const [nepaliYear, setNepaliYear] = useState('')
  const [nepaliMonth, setNepaliMonth] = useState('')
  const [nepaliDay, setNepaliDay] = useState('')
  const [convertedDate, setConvertedDate] = useState<any>(null)
  const [error, setError] = useState('')

  const convertEnglishToNepali = () => {
    try {
      setError('')
      if (!englishDate) {
        setError('Please enter an English date')
        return
      }

      const date = new Date(englishDate)
      if (isNaN(date.getTime())) {
        setError('Invalid date format')
        return
      }

      const nepaliDate = englishToNepali(date)
      setConvertedDate({
        type: 'english-to-nepali',
        original: englishDate,
        converted: nepaliDate,
        formatted: formatNepaliDate(nepaliDate, NEPALI_DATE_FORMATS.FULL)
      })
    } catch (err) {
      setError('Error converting date')
      console.error(err)
    }
  }

  const convertNepaliToEnglish = () => {
    try {
      setError('')
      if (!nepaliYear || !nepaliMonth || !nepaliDay) {
        setError('Please enter all Nepali date components')
        return
      }

      const year = parseInt(nepaliYear)
      const month = parseInt(nepaliMonth)
      const day = parseInt(nepaliDay)

      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        setError('Invalid date components')
        return
      }

      const nepaliDate = new NepaliDate(year, month - 1, day)
      const englishDate = nepaliDate.toJsDate()

      setConvertedDate({
        type: 'nepali-to-english',
        original: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        converted: englishDate,
        formatted: englishDate.toLocaleDateString('en-IN')
      })
    } catch (err) {
      setError('Error converting date')
      console.error(err)
    }
  }

  const getCurrentDate = () => {
    try {
      setError('')
      const currentNepali = getCurrentNepaliDate()
      const currentEnglish = new Date()
      
      setConvertedDate({
        type: 'current',
        nepali: currentNepali,
        english: currentEnglish,
        nepaliFormatted: formatNepaliDate(currentNepali, NEPALI_DATE_FORMATS.FULL),
        englishFormatted: currentEnglish.toLocaleDateString('en-IN')
      })
    } catch (err) {
      setError('Error getting current date')
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nepali Date Converter</CardTitle>
          <CardDescription>
            Convert between English (Gregorian) and Nepali (Bikram Sambat) dates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Date Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Current Date</h3>
              <Button onClick={getCurrentDate} variant="outline">
                Get Current Date
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium text-muted-foreground">Current Nepali Date</Label>
                <div className="text-lg font-semibold mt-1">
                  {getCurrentNepaliYear()} {NEPALI_MONTHS[getCurrentNepaliMonth() - 1]} {getCurrentNepaliDay()}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {NEPALI_MONTHS_NEPALI[getCurrentNepaliMonth() - 1]}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <Label className="text-sm font-medium text-muted-foreground">Current English Date</Label>
                <div className="text-lg font-semibold mt-1">
                  {new Date().toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* English to Nepali Conversion */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">English to Nepali</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="english-date">English Date</Label>
                <Input
                  id="english-date"
                  type="date"
                  value={englishDate}
                  onChange={(e) => setEnglishDate(e.target.value)}
                  placeholder="Select English date"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={convertEnglishToNepali}>
                  Convert
                </Button>
              </div>
            </div>
          </div>

          {/* Nepali to English Conversion */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Nepali to English</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nepali-year">Year (BS)</Label>
                <Input
                  id="nepali-year"
                  type="number"
                  value={nepaliYear}
                  onChange={(e) => setNepaliYear(e.target.value)}
                  placeholder="2080"
                  min="2000"
                  max="2100"
                />
              </div>
              <div>
                <Label htmlFor="nepali-month">Month</Label>
                <Input
                  id="nepali-month"
                  type="number"
                  value={nepaliMonth}
                  onChange={(e) => setNepaliMonth(e.target.value)}
                  placeholder="1-12"
                  min="1"
                  max="12"
                />
              </div>
              <div>
                <Label htmlFor="nepali-day">Day</Label>
                <Input
                  id="nepali-day"
                  type="number"
                  value={nepaliDay}
                  onChange={(e) => setNepaliDay(e.target.value)}
                  placeholder="1-32"
                  min="1"
                  max="32"
                />
              </div>
            </div>
            <Button onClick={convertNepaliToEnglish}>
              Convert
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Result Display */}
          {convertedDate && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Conversion Result</h3>
              <div className="p-4 border rounded-lg bg-muted/50">
                {convertedDate.type === 'english-to-nepali' && (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Original (English)</Label>
                      <div className="font-semibold">{convertedDate.original}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Converted (Nepali)</Label>
                      <div className="font-semibold">{convertedDate.formatted}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        Year: {convertedDate.converted.getYear()}
                      </Badge>
                      <Badge variant="secondary">
                        Month: {NEPALI_MONTHS[convertedDate.converted.getMonth()]}
                      </Badge>
                      <Badge variant="secondary">
                        Day: {convertedDate.converted.getDate()}
                      </Badge>
                    </div>
                  </div>
                )}

                {convertedDate.type === 'nepali-to-english' && (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Original (Nepali)</Label>
                      <div className="font-semibold">{convertedDate.original}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Converted (English)</Label>
                      <div className="font-semibold">{convertedDate.formatted}</div>
                    </div>
                  </div>
                )}

                {convertedDate.type === 'current' && (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Current Nepali Date</Label>
                      <div className="font-semibold">{convertedDate.nepaliFormatted}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Current English Date</Label>
                      <div className="font-semibold">{convertedDate.englishFormatted}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Format Examples */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Format Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(NEPALI_DATE_FORMATS).map(([key, format]) => (
                <div key={key} className="p-3 border rounded-lg">
                  <Label className="text-sm font-medium text-muted-foreground">{key}</Label>
                  <div className="font-mono text-sm mt-1">{format}</div>
                  <div className="text-sm mt-1">
                    {formatNepaliDate(getCurrentNepaliDate(), format)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 