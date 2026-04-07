"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Calendar, Box, Home, Search, User, LogOut, Settings } from "lucide-react";
import { NotificationsDropdown } from "../NotificationsDropdown";
import { SettingsModal } from "../SettingsModal";
import { useState, useEffect } from "react";
// Removed Clerk imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const user = { fullName: "Demo Student", primaryEmailAddress: { emailAddress: "demo@elmhurst.edu" } };
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/register') {
    return null;
  }

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <nav className="w-full border-b bg-white dark:bg-black px-6 py-2 flex items-center justify-between">
      {/* Left: Logo and nav links */}
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-blue-600">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="14" rx="3" fill="#2563eb" />
              <path d="M7 9V15M17 9V15M12 9V15" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-bold text-2xl tracking-tight select-none">MediaHub</span>
        </Link>
        <div className="flex items-center gap-6 text-base font-medium">
          <Link href="/dashboard" className="flex items-center gap-1 text-black dark:text-white hover:text-blue-600 transition-colors">
            <Home className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/inventory" className="flex items-center gap-1 text-black dark:text-white hover:text-blue-600 transition-colors">
            <Box className="w-5 h-5" /> Equipment
          </Link>
          <Link href="/reservations" className="flex items-center gap-1 text-black dark:text-white hover:text-blue-600 transition-colors">
            <Calendar className="w-5 h-5" /> My Reservations
          </Link>
        </div>
      </div>
      {/* Center: Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-[340px] max-w-full">
          <input
            type="text"
            placeholder="Search equipment..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>
      {/* Right: Notifications and user */}
      <div className="flex items-center gap-6">
        <div className="relative mt-1">
          <NotificationsDropdown />
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg select-none">
                  {getUserInitials()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium text-base">{user?.fullName || 'User'}</p>
                  <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress || ''}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              {/*<DropdownMenuItem className="cursor-pointer" onClick={handleSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>*/}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </nav>
  );
}
