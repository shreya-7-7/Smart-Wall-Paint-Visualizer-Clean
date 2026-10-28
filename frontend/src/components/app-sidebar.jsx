import * as React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboardIcon,
  UsersIcon,
  SofaIcon,
  FolderTreeIcon,
  SettingsIcon,
  LogOutIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navMain = [
  { title: "Dashboard", url: "/admin-dashboard", icon: LayoutDashboardIcon },
  { title: "Manage Users", url: "/admin/users", icon: UsersIcon },
  { title: "Manage Furniture", url: "/admin/furniture-management", icon: SofaIcon },
  { title: "Manage Designs", url: "/admin/designs", icon: FolderTreeIcon },
]

const navSecondary = [
  { title: "Settings", url: "/admin/settings", icon: SettingsIcon },
]

export function AppSidebar({ ...props }) {
  const navigate = useNavigate()
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
  const user = {
    name: storedUser.name || "Admin",
    email: storedUser.email || "admin@example.com",
    avatar: "",
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("role")
    navigate("/admin-login")
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <NavLink to="/admin-dashboard">
                <ShieldCheckIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Admin Panel</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <NavLink
                    to={item.url}
                    className={({ isActive }) =>
                      isActive ? "font-semibold" : ""
                    }
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            {navSecondary.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title}>
                  <NavLink to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip="Log out">
                <LogOutIcon />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
