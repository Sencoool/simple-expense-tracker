"use client";

import Link from "next/link";
import Image from "next/image";
import { Home, ClipboardPlusIcon, Tag } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "หน้าหลัก",
    url: "/",
    icon: Home,
  },
  {
    title: "เพิ่มรายการค่าใช้จ่ายใหม่",
    url: "/add-expense",
    icon: ClipboardPlusIcon,
  },
  {
    title: "จัดการประเภท",
    url: "/categories",
    icon: Tag,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-0 shadow-[2px_0_12px_0_rgba(0,0,0,0.06)]"
    >
      {/* ✅ Logo + Trigger Section */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-gray-100">
        {/* Logo area — hidden when sidebar collapses to icon-only mode */}
        <div className="flex items-center gap-3 flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
          <Image
            src="/logo.png"
            alt="Expense Tracker Logo"
            width={36}
            height={36}
            className="rounded-lg shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight truncate">Expense Tracker</p>
            <p className="text-xs text-muted-foreground leading-tight truncate">
              จัดการรายจ่ายของคุณ
            </p>
          </div>
        </div>

        {/* Trigger — always visible, centered when icon-only */}
        <SidebarTrigger className="shrink-0 ml-auto group-data-[collapsible=icon]:mx-auto" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          {/* ✅ Improved typography hierarchy for group label */}
          <SidebarGroupLabel className="text-[11px] font-bold uppercase tracking-widest text-gray-400 px-3 pt-4 pb-1 h-auto">
            เมนู
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-1 gap-0.5">
              {items.map((item) => {
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={
                        isActive
                          ? "relative border-l-[3px] border-blue-500 rounded-l-none bg-blue-50 text-blue-700 font-semibold pl-[calc(0.5rem-3px)] hover:bg-blue-50 hover:text-blue-700 [&>svg]:text-blue-600 group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:pl-2 group-data-[collapsible=icon]:bg-blue-50"
                          : "border-l-[3px] border-transparent rounded-l-none pl-[calc(0.5rem-3px)] hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150 group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:pl-2"
                      }
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
