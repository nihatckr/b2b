/**
 * Notification Bell Component
 *
 * Bell icon with unread badge count
 * Opens notification dropdown when clicked
 *
 * Usage:
 * - Add to Navbar
 * - Shows unread count
 * - Opens NotificationPanel on click
 */

"use client";

import { useNotifications } from "@/components/providers/notification-context";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { useState } from "react";
import { NotificationPanel } from "./notification-panel";

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Bildirimler"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        <NotificationPanel onClose={() => setIsOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
