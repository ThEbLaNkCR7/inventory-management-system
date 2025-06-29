declare module 'nepali-date' {
  export default class NepaliDate {
    constructor(date?: Date | string | number)
    constructor(year: number, month: number, day: number)
    
    getYear(): number
    getMonth(): number
    getDate(): number
    getDay(): number
    getTime(): number
    getDaysInMonth(): number
    toJsDate(): Date
    toString(): string
    valueOf(): number
  }
} 