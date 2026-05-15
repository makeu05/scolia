"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UserInfo from "./userprofile";

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      
      {/* Menu */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="mr-2 lg:hidden"
      >
        <Menu className="size-5" />
      </Button>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un élève, une classe..."
          className="pl-10 bg-secondary/50 border-transparent focus-visible:border-ring"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5 text-muted-foreground" />
          <Badge className="absolute -right-1 -top-1 flex size-5 items-center justify-center p-0 text-[10px]">
            3
          </Badge>
        </Button>

        {/* USER DYNAMIQUE */}
        <UserInfo />
      </div>
    </header>
  );
}