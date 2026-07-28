"use client";

import { Bell, Grid, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { BranchSwitcher } from "./branch-switcher";
import UserProfileDropdown from "@/components/user-profile-dropdown";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="flex h-14 md:h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-slate-100 h-11 w-11 md:h-10 md:w-10 text-slate-500 hover:text-slate-700">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
               <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Page Title */}
        <h1 className="text-[22px] leading-7 md:text-2xl md:leading-8 lg:text-3xl lg:leading-9 font-bold text-slate-900 font-heading">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          <BranchSwitcher />
        </div>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
          <Grid className="h-5 w-5" />
        </Button>
        <div className="ml-2 h-8 w-px bg-slate-200" />
        <UserProfileDropdown 
          profileHref="/dashboard/profile" 
          avatarSrc="https://i.pravatar.cc/150?u=a042581f4e29026704d" 
        />
      </div>
    </header>
  );
}
