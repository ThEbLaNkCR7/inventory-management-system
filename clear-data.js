// Clear Data Script for Deployment
// Run this script in the browser console to clear all local data

console.log('🧹 Clearing all local data for deployment...')

// Clear all localStorage
localStorage.clear()

// Clear specific items
localStorage.removeItem('user')
localStorage.removeItem('currentSystem')
localStorage.removeItem('sidebarOpen')
localStorage.removeItem('employeeSidebarOpen')
localStorage.removeItem('theme')

// Clear sessionStorage
sessionStorage.clear()

// Clear any cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
})

console.log('✅ All local data cleared successfully!')
console.log('🔄 Refreshing page...')

// Reload the page
setTimeout(() => {
  window.location.reload()
}, 1000) 