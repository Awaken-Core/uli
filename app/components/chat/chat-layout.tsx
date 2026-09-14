import { PageHeader } from "@/components/page-header";

export function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <PageHeader title="Chat" />
            {children}
        </div>
    );
};