"use client";

import { IconChevronRight, type Icon } from "@tabler/icons-react";
import { useState } from "react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavBusiness({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter((item) => item.isActive).map((item) => item.title))
  );

  const toggleItem = (title: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(title)) {
        newSet.delete(title);
      } else {
        newSet.add(title);
      }
      return newSet;
    });
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Business Operations</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              onClick={() => toggleItem(item.title)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </div>
              {item.items && (
                <IconChevronRight
                  className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                    openItems.has(item.title) ? "rotate-90" : ""
                  }`}
                />
              )}
            </SidebarMenuButton>
            {item.items && openItems.has(item.title) && (
              <SidebarMenuSub>
                {item.items.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild>
                      <a href={subItem.url}>
                        <span>{subItem.title}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
