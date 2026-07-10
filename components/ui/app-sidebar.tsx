import Link from "next/link";
import Image from "next/image";
import { Home, ClipboardPlusIcon, Tag } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
    url: "add-expense",
    icon: ClipboardPlusIcon,
  },
  {
    title: "จัดการประเภท",
    url: "/categories",
    icon: Tag,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      {/* ✅ Logo Section */}
      <div className="flex items-center gap-3 px-4 py-5 border-b">
        <Image
          src="/logo.png"
          alt="Expense Tracker Logo"
          width={36}
          height={36}
          className="rounded-lg"
        />
        <div>
          <p className="text-sm font-semibold leading-tight">Expense Tracker</p>
          <p className="text-xs text-muted-foreground leading-tight">จัดการรายจ่ายของคุณ</p>
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เมนู</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
