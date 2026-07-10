"use client";

import { Bell, Grid, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-slate-100 h-10 w-10 text-slate-500 hover:text-slate-700">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
               <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Page Title */}
        <h1 className="text-xl font-bold text-slate-900 font-heading">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
          <Grid className="h-5 w-5" />
        </Button>
        <div className="ml-2 h-8 w-px bg-slate-200" />
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-indigo-500 transition-all">
          <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Super Admin" />
          <AvatarFallback className="bg-indigo-100 text-indigo-700 font-medium text-xs">SA</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
