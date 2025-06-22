"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  salary: number
  status: "active" | "inactive" | "on_leave"
  manager?: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  photo?: string
}

export interface Department {
  id: string
  name: string
  manager: string
  employeeCount: number
  budget: number
  location: string
}

export interface Attendance {
  id: string
  employeeId: string
  employeeName: string
  date: string
  checkIn: string
  checkOut?: string
  status: "present" | "absent" | "late" | "half_day"
  notes?: string
}

export interface Payroll {
  id: string
  employeeId: string
  employeeName: string
  month: string
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: "pending" | "paid" | "cancelled"
}

interface EmployeeContextType {
  employees: Employee[]
  departments: Department[]
  attendance: Attendance[]
  payroll: Payroll[]
  addEmployee: (employee: Omit<Employee, "id">) => void
  updateEmployee: (id: string, employee: Partial<Employee>) => void
  deleteEmployee: (id: string) => void
  addDepartment: (department: Omit<Department, "id">) => void
  updateDepartment: (id: string, department: Partial<Department>) => void
  deleteDepartment: (id: string) => void
  addAttendance: (attendance: Omit<Attendance, "id">) => void
  updateAttendance: (id: string, attendance: Partial<Attendance>) => void
  deleteAttendance: (id: string) => void
  addPayroll: (payroll: Omit<Payroll, "id">) => void
  updatePayroll: (id: string, payroll: Partial<Payroll>) => void
  deletePayroll: (id: string) => void
  getEmployeeById: (id: string) => Employee | undefined
  getEmployeesByDepartment: (department: string) => Employee[]
  getActiveEmployees: () => Employee[]
  getAttendanceByEmployee: (employeeId: string) => Attendance[]
  getPayrollByEmployee: (employeeId: string) => Payroll[]
  getTotalEmployees: () => number
  getTotalSalary: () => number
  getAverageSalary: () => number
  getDepartmentStats: () => { name: string; count: number; avgSalary: number }[]
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined)

export function EmployeeProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [payroll, setPayroll] = useState<Payroll[]>([])

  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee = {
      ...employee,
      id: Date.now().toString(),
    }
    setEmployees([...employees, newEmployee])
  }

  const updateEmployee = (id: string, updatedEmployee: Partial<Employee>) => {
    setEmployees(employees.map((emp) => (emp.id === id ? { ...emp, ...updatedEmployee } : emp)))
  }

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id))
  }

  const addDepartment = (department: Omit<Department, "id">) => {
    const newDepartment = {
      ...department,
      id: Date.now().toString(),
    }
    setDepartments([...departments, newDepartment])
  }

  const updateDepartment = (id: string, updatedDepartment: Partial<Department>) => {
    setDepartments(departments.map((dept) => (dept.id === id ? { ...dept, ...updatedDepartment } : dept)))
  }

  const deleteDepartment = (id: string) => {
    setDepartments(departments.filter((dept) => dept.id !== id))
  }

  const addAttendance = (attendanceRecord: Omit<Attendance, "id">) => {
    const newAttendance = {
      ...attendanceRecord,
      id: Date.now().toString(),
    }
    setAttendance([...attendance, newAttendance])
  }

  const updateAttendance = (id: string, updatedAttendance: Partial<Attendance>) => {
    setAttendance(attendance.map((att) => (att.id === id ? { ...att, ...updatedAttendance } : att)))
  }

  const deleteAttendance = (id: string) => {
    setAttendance(attendance.filter((att) => att.id !== id))
  }

  const addPayroll = (payrollRecord: Omit<Payroll, "id">) => {
    const newPayroll = {
      ...payrollRecord,
      id: Date.now().toString(),
    }
    setPayroll([...payroll, newPayroll])
  }

  const updatePayroll = (id: string, updatedPayroll: Partial<Payroll>) => {
    setPayroll(payroll.map((pay) => (pay.id === id ? { ...pay, ...updatedPayroll } : pay)))
  }

  const deletePayroll = (id: string) => {
    setPayroll(payroll.filter((pay) => pay.id !== id))
  }

  const getEmployeeById = (id: string) => {
    return employees.find((emp) => emp.id === id)
  }

  const getEmployeesByDepartment = (department: string) => {
    return employees.filter((emp) => emp.department === department)
  }

  const getActiveEmployees = () => {
    return employees.filter((emp) => emp.status === "active")
  }

  const getAttendanceByEmployee = (employeeId: string) => {
    return attendance.filter((att) => att.employeeId === employeeId)
  }

  const getPayrollByEmployee = (employeeId: string) => {
    return payroll.filter((pay) => pay.employeeId === employeeId)
  }

  const getTotalEmployees = () => {
    return employees.length
  }

  const getTotalSalary = () => {
    return employees.reduce((total, emp) => total + emp.salary, 0)
  }

  const getAverageSalary = () => {
    return employees.length > 0 ? getTotalSalary() / employees.length : 0
  }

  const getDepartmentStats = () => {
    return departments.map((dept) => {
      const deptEmployees = getEmployeesByDepartment(dept.name)
      const avgSalary = deptEmployees.length > 0 
        ? deptEmployees.reduce((sum, emp) => sum + emp.salary, 0) / deptEmployees.length 
        : 0
      
      return {
        name: dept.name,
        count: deptEmployees.length,
        avgSalary,
      }
    })
  }

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        departments,
        attendance,
        payroll,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addAttendance,
        updateAttendance,
        deleteAttendance,
        addPayroll,
        updatePayroll,
        deletePayroll,
        getEmployeeById,
        getEmployeesByDepartment,
        getActiveEmployees,
        getAttendanceByEmployee,
        getPayrollByEmployee,
        getTotalEmployees,
        getTotalSalary,
        getAverageSalary,
        getDepartmentStats,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  )
}

export function useEmployee() {
  const context = useContext(EmployeeContext)
  if (context === undefined) {
    throw new Error("useEmployee must be used within an EmployeeProvider")
  }
  return context
} 