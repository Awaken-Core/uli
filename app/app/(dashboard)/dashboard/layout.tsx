import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
    SidebarInset,
    SidebarProvider
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { getServerSession } from "@/lib/auth-session";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const session = await getServerSession();

    if (!session) {
        redirect("/sign-in");
    }

    // Default open to true so the sidebar is expanded on visit
    const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

    return (
        <SidebarProvider defaultOpen={defaultOpen} className="h-svh">
            <DashboardSidebar />
            <SidebarInset className="min-h-0 min-w-0">
                <main className="flex min-h-0 flex-1 flex-col">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
};

