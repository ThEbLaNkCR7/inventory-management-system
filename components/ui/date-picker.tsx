"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DatePickerProps {
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showClearButton?: boolean
}

export function DatePicker({
  value,
  onValueChange,
  placeholder = "Select date",
  className,
  disabled = false,
  showClearButton = true
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, "PPP"))
    } else {
      setInputValue("")
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    onValueChange?.(date)
    if (date) {
      setIsOpen(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    // Try to parse the input value as a date
    if (inputValue.trim()) {
      const parsedDate = new Date(inputValue)
      if (!isNaN(parsedDate.getTime())) {
        onValueChange?.(parsedDate)
      }
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange?.(undefined)
    setInputValue("")
  }

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className={cn(
                "pr-10 cursor-pointer",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
              readOnly
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {showClearButton && value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <CalendarIcon className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 