"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Calendar, Box, Home, Search, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { searchEquipment } from "@/app/actions/searchActions";

export default function Navbar() {
  const { user, isLoaded, isSignedIn } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const role = user?.publicMetadata?.role;
  const [navSearch, setNavSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (navSearch.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchEquipment(navSearch);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [navSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false);
    if (navSearch.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(navSearch)}`);
    } else {
      router.push(`/catalog`);
    }
  };

  if (pathname === "/" || pathname === "/register") {
    return null;
  }

  if (!isLoaded || !isSignedIn) {
    return null;
  }



  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <nav className="w-full border-b bg-white dark:bg-black px-4 md:px-6 py-2 flex items-center justify-between gap-4">
      {/* Left: Logo and nav links */}
      <div className="flex items-center gap-4 md:gap-8">
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-blue-600">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="18" height="14" rx="3" fill="#2563eb" />
              <path d="M7 9V15M17 9V15M12 9V15" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-bold text-2xl tracking-tight select-none">MediaHub</span>
        </Link>
        <div className="hidden lg:flex items-center gap-6 text-sm lg:text-base font-medium whitespace-nowrap">
          <Link href={role === "admin" ? "/admin" : "/dashboard"} className="flex items-center gap-1 text-black dark:text-white hover:text-blue-600 transition-colors">
            <Home className="w-4 h-4 lg:w-5 lg:h-5" /> Dashboard
          </Link>
          {role !== "admin" && (
            <>
              <Link href="/catalog" className="flex items-center gap-1 text-black dark:text-white hover:text-blue-600 transition-colors">
                <Box className="w-4 h-4 lg:w-5 lg:h-5" /> Equipment
              </Link>
              <Link href="/reservations" className="flex items-center gap-1 text-black dark:text-white hover:text-blue-600 transition-colors">
                <Calendar className="w-4 h-4 lg:w-5 lg:h-5" /> My Reservations
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Center: Search */}
      {role !== "admin" ? (
        <div className="hidden md:flex flex-1 justify-center max-w-md" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search equipment..."
              value={navSearch}
              onChange={(e) => {
                setNavSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => { if (navSearch.trim().length >= 2) setShowDropdown(true); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

            {/* Autocomplete Dropdown */}
            {showDropdown && (navSearch.trim().length >= 2) && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 z-50 overflow-hidden text-sm">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/equipment/${item.id}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border-b border-gray-100 dark:border-zinc-800 last:border-0"
                      >
                        {item.imageUrl && (
                          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="font-medium text-gray-900 dark:text-white truncate">{item.name}</span>
                          <span className="text-xs text-gray-500 truncate">{item.brand} • {item.category}</span>
                        </div>
                      </Link>
                    ))}
                    <button
                      type="submit"
                      className="p-3 text-center text-blue-600 dark:text-blue-400 font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors bg-gray-50 dark:bg-zinc-900/50"
                    >
                      View all results
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">No equipment found.</div>
                )}
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="flex-1"></div>
      )}
      {/* Right: Notifications and user */}
      <div className="flex items-center gap-3 lg:gap-6 flex-shrink-0">

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg select-none">
                  {getUserInitials()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-56 max-w-xs mt-2">
              <DropdownMenuLabel>
                <div className="min-w-0">
                  <p className="font-medium text-base truncate">{user?.fullName || 'User'}</p>
                  <p
                    className="text-sm text-gray-500 truncate"
                    title={user?.primaryEmailAddress?.emailAddress || ''}
                  >
                    {user?.primaryEmailAddress?.emailAddress || ''}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <SignOutButton redirectUrl="/">
                <DropdownMenuItem className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </SignOutButton>
              <DropdownMenuSeparator />

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

    </nav>
  );
}