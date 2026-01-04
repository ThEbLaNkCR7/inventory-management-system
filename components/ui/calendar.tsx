"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(props.month ?? new Date());

  // Inline style for calendar dropdowns only
  const calendarDropdownStyle = `
    .rdp-caption select {
      background: none !important;
      color: #444 !important;
      border: none !important;
      box-shadow: none !important;
      font-size: 1.1rem !important;
      font-weight: 500 !important;
      padding: 0 4px !important;
      appearance: none !important;
      cursor: pointer;
    }
    .rdp-caption select:focus {
      outline: none !important;
    }
    .rdp-caption option {
      background: #fff !important;
      color: #444 !important;
    }
  `;

  return (
    <>
      <style>{calendarDropdownStyle}</style>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex flex-row justify-center items-center gap-2",
          caption_label: "text-sm font-medium text-gray-900 dark:text-gray-100",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell:
            "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-600 focus:text-white",
          day_today: "bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 font-semibold",
          day_outside:
            "day-outside text-gray-400 dark:text-gray-500 aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
          day_disabled: "text-gray-300 dark:text-gray-600 opacity-50 cursor-not-allowed",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        captionLayout="dropdown"
        month={month}
        onMonthChange={setMonth}
        {...props}
      />
    </>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
