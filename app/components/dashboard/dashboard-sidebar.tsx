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
    LayoutGrid,
    Headphones,
    ChartColumn,
    ChevronsUpDown,
    LogOut,
} from "lucide-react";
import Link from "next/link";

interface MenuItem {
    title: string;
    url?: string;
    icon: LucideIcon;
    onClick?: () => void;
};

interface NavSectionProps {
    label?: string;
    items: MenuItem[];
    pathname: string;
};

function NavSection({ label, items, pathname }: NavSectionProps) {
    return (
        <SidebarGroup>
            {label && (
                <SidebarGroupLabel className="text-[13px] uppercase text-muted-foreground">
                    {label}
                </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild={!!item.url}
                                isActive={
                                    item.url
                                        ? item.url === "/"
                                            ? pathname === "/"
                                            : pathname.startsWith(item.url)
                                        : false
                                }
                                onClick={item.onClick}
                                tooltip={item.title}
                                className="h-9 px-3 py-2 text-[13px] tracking-tight font-medium border border-transparent data-[active=true]:border-border data-[active=true]:bg-sidebar-accent data-[active=true]:shadow-sm"
                            >
                                {item.url ? (
                                    <Link href={`/dashboard/${item.url}`}>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </Link>
                                ) : (
                                    <>
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
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
            title: "Anaytics",
            url: "/analytics",
            icon: ChartColumn,
        },
        {
            title: "Chat",
            url: "/chat",
            icon: LayoutGrid,
        },
    ];

    const othersMenuItems: MenuItem[] = [
        {
            title: "Help and support",
            url: "mailto:mehulprajapati7456e@gmail.com",
            icon: Headphones,
        },
    ];

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="flex flex-col gap-4 pt-4">
                <div
                    className="flex items-center gap-2 pl-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
                    <Image
                        src="/logo.png"
                        alt="Voxara Logo"
                        width={24}
                        height={24}
                        className="rounded-sm"
                    />
                    <span className="group-data-[collapsible=icon]:hidden font-semibold text-lg tracking-tighter text-foreground">
                        Uli
                    </span>
                    <SidebarTrigger className="ml-auto lg:hidden" />
                </div>
            </SidebarHeader>
            <div className="border-b border-dashed border-border" />
            <SidebarContent>
                <NavSection items={mainMenuItems} pathname={pathname} />
                <NavSection
                    label="Others"
                    items={othersMenuItems}
                    pathname={pathname}
                />
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
                                            <span className="truncate font-medium">{session?.user.name}</span>
                                            <span className="truncate text-xs text-muted-foreground">{session?.user.email}</span>
                                        </div>
                                        <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="top" align="end" className="w-(--radix-dropdown-menu-trigger-width)">
                                    <DropdownMenuLabel>{session?.user.name}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => void signOut({ fetchOptions: { onSuccess: () => window.location.assign("/sign-in") } })}>
                                        <LogOut />
                                        Sign out
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
