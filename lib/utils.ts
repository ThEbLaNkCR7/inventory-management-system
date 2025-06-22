import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to clear all local data for deployment
export function clearAllLocalData() {
  if (typeof window !== 'undefined') {
    // Clear all localStorage items
    localStorage.clear()
    
    // Clear specific items that might be used
    localStorage.removeItem('user')
    localStorage.removeItem('currentSystem')
    localStorage.removeItem('sidebarOpen')
    localStorage.removeItem('employeeSidebarOpen')
    localStorage.removeItem('theme')
    
    // Clear any sessionStorage if used
    sessionStorage.clear()
    
    console.log('All local data cleared successfully')
  }
}

// Function to reset the application to initial state
export function resetApplication() {
  clearAllLocalData()
  
  // Reload the page to reset all contexts
  if (typeof window !== 'undefined') {
    window.location.reload()
  }
}
