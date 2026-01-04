import React, { useState, useRef, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from "date-fns";
import { Pencil, ChevronLeft, ChevronRight } from "lucide-react";

const PRIMARY = undefined; // not used anymore
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export interface MaterialDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  onCancel?: () => void;
}

export function MaterialDatePicker({ value, onChange, onCancel }: MaterialDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempDate, setTempDate] = useState<Date | undefined>(value);
  const [month, setMonth] = useState<Date>(value ? startOfMonth(value) : startOfMonth(new Date()));
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Month/year dropdown logic
  const years = Array.from({ length: 31 }, (_, i) => 2000 + i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Calendar grid logic
  function getCalendarGrid(month: Date) {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    const days = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }
  const days = getCalendarGrid(month);

  // Handlers
  function handleMonthChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newMonth = new Date(month);
    newMonth.setMonth(Number(e.target.value));
    setMonth(startOfMonth(newMonth));
  }
  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newMonth = new Date(month);
    newMonth.setFullYear(Number(e.target.value));
    setMonth(startOfMonth(newMonth));
  }
  function handlePrevMonth() {
    setMonth(subMonths(month, 1));
  }
  function handleNextMonth() {
    setMonth(addMonths(month, 1));
  }
  function handleDayClick(day: Date) {
    setTempDate(day);
  }
  function handleCancel() {
    setTempDate(value);
    setOpen(false);
    onCancel?.();
  }
  function handleOk() {
    onChange(tempDate);
    setOpen(false);
  }

  useEffect(() => {
    if (open && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [open]);

  // Render
  return (
    <>
      <style>{`
        .material-picker select, .material-picker option {
          background: #fff !important;
          color: #444 !important;
        }
        @keyframes material-fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-material-fade-in {
          animation: material-fade-in 0.3s cubic-bezier(0.4,0,0.2,1) forwards;
        }
      `}</style>
      <div className="material-picker">
        <button
          type="button"
          className="w-full border rounded px-3 py-2 text-left"
          style={{ color: tempDate ? PRIMARY : undefined }}
          onClick={() => setOpen(true)}
        >
          {tempDate ? format(tempDate, "PPP") : "Select date"}
        </button>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white rounded-lg shadow-lg w-[340px] transition-all duration-300 transform scale-95 opacity-0 animate-material-fade-in">
              {/* Header */}
              <div className="px-6 pt-4 pb-3 rounded-t-lg bg-gray-900 dark:bg-gray-950">
                <div className="text-xs tracking-widest text-white/80 mb-1">SELECT DATE</div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-semibold text-white">{tempDate ? format(tempDate, "EEE, MMM d") : "---"}</div>
                  <Pencil className="h-5 w-5 text-white/80 cursor-pointer" />
                </div>
              </div>
              {/* Month/Year Dropdown and Navigation */}
              <div className="flex items-center justify-between px-6 pt-4">
                <div className="flex items-center gap-2 relative">
                  <div className="relative">
                    <select
                      value={month.getMonth()}
                      onChange={handleMonthChange}
                      className="appearance-none bg-none border-none text-gray-700 font-medium text-base focus:outline-none cursor-pointer pr-6"
                      style={{ padding: 0, minWidth: '120px' }}
                    >
                      {months.map((m, idx) => (
                        <option key={m} value={idx}>{m}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">▼</span>
                  </div>
                  <div className="relative">
                    <select
                      value={month.getFullYear()}
                      onChange={handleYearChange}
                      className="appearance-none bg-none border-none text-gray-700 font-medium text-base focus:outline-none cursor-pointer pr-6"
                      style={{ padding: 0, minWidth: '90px' }}
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">▼</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={handlePrevMonth} className="rounded border border-transparent hover:border-gray-900 dark:hover:border-gray-950 p-1 transition-colors">
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                  </button>
                  <button type="button" onClick={handleNextMonth} className="rounded border border-transparent hover:border-gray-900 dark:hover:border-gray-950 p-1 transition-colors">
                    <ChevronRight className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>
              {/* Calendar Grid */}
              <div className="px-6 pt-2 pb-2">
                <div className="flex justify-between mb-1 text-gray-500 text-xs font-medium">
                  {WEEKDAYS.map(d => <div key={d} className="w-9 text-center">{d}</div>)}
                </div>
                <div className="flex flex-wrap">
                  {days.map((day, idx) => {
                    const isToday = isSameDay(day, new Date());
                    const isSelected = tempDate && isSameDay(day, tempDate);
                    const inMonth = isSameMonth(day, month);
                    return (
                      <div
                        key={idx}
                        className="w-9 h-9 flex items-center justify-center mb-1"
                      >
                        <button
                          type="button"
                          className={
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all " +
                            (isSelected
                              ? "bg-gray-900 dark:bg-gray-950 text-white font-bold"
                              : isToday
                              ? "border-2 border-gray-900 dark:border-gray-950 text-gray-900 dark:text-gray-950 font-semibold"
                              : inMonth
                              ? "text-gray-800 hover:bg-gray-100"
                              : "text-gray-300")
                          }
                          style={{ outline: "none" }}
                          onClick={() => inMonth && handleDayClick(day)}
                          disabled={!inMonth}
                        >
                          {format(day, "d")}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Footer */}
              <div className="flex justify-end items-center gap-4 px-6 pb-4 pt-2">
                <button type="button" ref={cancelBtnRef} onClick={handleCancel} className="uppercase text-gray-900 dark:text-gray-950 text-sm font-medium tracking-wider px-2 py-1 rounded hover:bg-gray-100">Cancel</button>
                <button type="button" onClick={handleOk} className="uppercase text-gray-900 dark:text-gray-950 text-sm font-medium tracking-wider px-2 py-1 rounded hover:bg-gray-100">OK</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 