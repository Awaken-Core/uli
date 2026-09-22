"use client";

import { useSession } from "@/lib/auth-client";
import { Headphones, ThumbsUp } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme-toggle";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
    const { data: session, isPending } = useSession();

    return (
        <div className="flex items-start justify-between font-sans">
            <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">
                        Nice to see you
                    </p>
                    <h1 className="text-2xl lg:text-3xl font-semibold tracking-[-0.8px] text-foreground">
                        {isPending ? "..." : (session?.user.name ?? "there")}
                    </h1>
                </div>
            </div>

            <div className="lg:flex items-center gap-3 hidden">
                <ModeToggle />
                <Button variant="outline" size="sm" asChild>
                    <Link href="mailto:mehulprajapati7456e@gmail.com">
                        <ThumbsUp />
                        <span className="hidden lg:block">Feedback</span>
                    </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                    <Link href="mailto:mehulprajapati7456e@gmail.com">
                        <Headphones />
                        <span className="hidden lg:block">Need help?</span>
                    </Link>
                </Button>
            </div>


        </div>
    );
};
