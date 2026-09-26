"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";
import {
    type LucideIcon,
    LayoutDashboard,
    CheckSquare,
    Utensils,
    Apple,
    Target,
    ChartColumn,
    Bot,
    Gem,
    Settings,
    Headphones,
    ChevronsUpDown,
    LogOut,
} from "lucide-react";
import Link from "next/link";

interface MenuItem {
    title: string;
    url?: string;
    icon: LucideIcon;
    badge?: string;
    onClick?: () => void;
}

interface NavSectionProps {
    label?: string;
    items: MenuItem[];
    pathname: string;
}

function NavSection({ label, items, pathname }: NavSectionProps) {
    return (
        <SidebarGroup>
            {label && (
                <SidebarGroupLabel className="text-[12px] font-semibold tracking-wider uppercase text-muted-foreground/80 px-3">
                    {label}
                </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => {
                        const isActive = item.url ? pathname === item.url : false;

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild={!!item.url}
                                    isActive={isActive}
                                    onClick={item.onClick}
                                    tooltip={item.title}
                                    className="h-9 px-3 py-2 text-[13px] tracking-tight font-medium border border-transparent data-[active=true]:border-border data-[active=true]:bg-sidebar-accent data-[active=true]:shadow-sm rounded-md transition-colors"
                                >
                                    {item.url ? (
                                        <Link href={item.url} className="flex items-center gap-2.5">
                                            <item.icon className="size-4 shrink-0 text-muted-foreground group-data-[active=true]/menu-button:text-primary" />
                                            <span className="truncate">{item.title}</span>
                                            {item.badge && (
                                                <span className="ml-auto text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    ) : (
                                        <div className="flex items-center gap-2.5">
                                            <item.icon className="size-4 shrink-0 text-muted-foreground" />
                                            <span className="truncate">{item.title}</span>
                                        </div>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

export function DashboardSidebar() {
    const pathname = usePathname();
    const { data: session, isPending } = useSession();

    const mainMenuItems: MenuItem[] = [
        {
            title: "Overview",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Tasks & Planner",
            url: "/dashboard/tasks",
            icon: CheckSquare,
        },
        {
            title: "Nutrition & Diet",
            url: "/dashboard/nutrition",
            icon: Utensils,
        },
        {
            title: "Food Database",
            url: "/dashboard/nutrition/foods",
            icon: Apple,
        },
        {
            title: "Daily Goals",
            url: "/dashboard/nutrition/goals",
            icon: Target,
        },
        {
            title: "Analytics",
            url: "/dashboard/analytics",
            icon: ChartColumn,
        },
        {
            title: "AI Health Chat",
            url: "/dashboard/chat",
            icon: Bot,
            badge: "AI",
        },
    ];

    const accountMenuItems: MenuItem[] = [
        {
            title: "HaaS Membership",
            url: "/dashboard/pricing",
            icon: Gem,
        },
        {
            title: "Settings",
            url: "/dashboard/settings",
            icon: Settings,
        },
    ];

    const supportMenuItems: MenuItem[] = [
        {
            title: "Help & Support",
            url: "mailto:mehulprajapati7456e@gmail.com",
            icon: Headphones,
        },
    ];

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex flex-col gap-4 pt-4">
                <div className="flex items-center gap-2.5 pl-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
                    <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                        U
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden leading-tight flex-1">
                        <span className="font-semibold text-base tracking-tight text-foreground flex items-center gap-1.5">
                            Uli
                            <span className="text-[10px] font-bold px-1.5 py-0.2 uppercase rounded bg-primary/10 text-primary border border-primary/20">
                                HaaS
                            </span>
                        </span>
                        <span className="text-[11px] text-muted-foreground">Health as a Service</span>
                    </div>
                    <SidebarTrigger className="ml-auto" />
                </div>
            </SidebarHeader>
            <div className="border-b border-dashed border-border" />
            <SidebarContent>
                <NavSection items={mainMenuItems} pathname={pathname} />
                <NavSection label="Platform" items={accountMenuItems} pathname={pathname} />
                <NavSection label="Support" items={supportMenuItems} pathname={pathname} />
            </SidebarContent>
            <div className="border-b border-dashed border-border" />
            <SidebarFooter className="gap-3 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        {isPending ? (
                            <Skeleton className="h-9 w-full group-data-[collapsible=icon]:size-9" />
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                                        <Avatar size="sm">
                                            <AvatarImage src={session?.user.image ?? undefined} alt={session?.user.name ?? "User"} />
                                            <AvatarFallback>{session?.user.name?.slice(0, 1).toUpperCase() ?? "U"}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                            <span className="truncate font-medium">{session?.user.name ?? "Member"}</span>
                                            <span className="truncate text-xs text-muted-foreground">{session?.user.email ?? "Signed In"}</span>
                                        </div>
                                        <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="top" align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{session?.user.name ?? "Member"}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{session?.user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/settings">
                                            <Settings className="mr-2 size-4" />
                                            <span>Account Settings</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard/pricing">
                                            <Gem className="mr-2 size-4" />
                                            <span>Membership Plans</span>
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onSelect={() => void signOut({ fetchOptions: { onSuccess: () => window.location.assign("/sign-in") } })}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
