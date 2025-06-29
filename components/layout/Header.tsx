"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useNotifications } from "@/contexts/NotificationContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, LogOut, User, Settings, Building2, Users, Bell, CheckCircle, AlertCircle, Info, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { formatDistanceToNow } from 'date-fns'

interface HeaderProps {
  user: any
  onMenuClick: () => void
  sidebarOpen: boolean
  isMobile: boolean
}

export default function Header({ user, onMenuClick, sidebarOpen, isMobile }: HeaderProps) {
  const { logout } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } = useNotifications()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const isEmployeeSystem = pathname.includes("/employee-dashboard")
  const isInventorySystem = pathname.includes("/dashboard") || pathname === "/"

  const switchToInventory = () => {
    router.push("/dashboard")
  }

  const switchToEmployee = () => {
    router.push("/employee-dashboard")
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/20'
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6 relative">
        {/* Left side - Menu button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Center - Animated Title */}
        <div className={`absolute transition-all duration-700 ease-in-out ${
          !isMobile && sidebarOpen 
            ? 'left-0 transform -translate-x-32 opacity-0 scale-95' 
            : 'left-1/2 transform -translate-x-1/2 opacity-100 scale-100'
        }`}>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center whitespace-nowrap">
            {isEmployeeSystem ? "Sheel Employment Management" : "Sheel Inventory Management"}
          </h1>
        </div>

        {/* Right side - Notifications and User dropdown */}
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end" forceMount>
              <DropdownMenuLabel className="flex items-center justify-between">
                <span className="font-semibold">Notifications</span>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs h-6 px-2"
                    >
                      Mark all read
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllNotifications}
                      className="text-xs h-6 px-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {notifications.slice(0, 10).map((notification) => (
                    <div key={notification.id} className="relative group">
                      <DropdownMenuItem 
                        className={`flex flex-col items-start p-3 gap-2 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between w-full">
                          <div className="flex items-start gap-2 flex-1">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${!notification.read ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                                title="Mark as read"
                              >
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeNotification(notification.id)
                              }}
                              title="Remove notification"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </DropdownMenuItem>
                      {!notification.read && (
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {notifications.length > 10 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>View all notifications ({notifications.length})</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs h-6 px-2"
                        >
                          Mark all read
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllNotifications}
                          className="text-xs h-6 px-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Clear all
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-user.jpg" alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
