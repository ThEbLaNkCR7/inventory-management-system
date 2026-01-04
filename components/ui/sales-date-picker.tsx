"use client"

import * as React from "react"
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { Calendar as CalendarIcon, X, Clock, CalendarDays, Pencil } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { MaterialDatePicker } from "@/components/ui/MaterialDatePicker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface SalesDatePickerProps {
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  showClearButton?: boolean
  showQuickDates?: boolean
}

export function SalesDatePicker({
  value,
  onValueChange,
  placeholder = "Select transaction date",
  className,
  disabled = false,
  showClearButton = true,
}: SalesDatePickerProps) {
  return (
    <MaterialDatePicker value={value} onChange={onValueChange ?? (() => {})} />
  )
} 