// Utility script to clear all local data for testing
// Run this in the browser console or as a Node.js script

function clearAllLocalData() {
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

// Clear all data
clearAllLocalData()

// If running in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { clearAllLocalData }
} 