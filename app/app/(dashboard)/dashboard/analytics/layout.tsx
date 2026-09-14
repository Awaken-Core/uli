import { AnalyticsLayout } from "@/components/analytics/anaytics-layout";

export default function Layout({ 
  children
}: { 
  children: React.ReactNode
}) {
  return <AnalyticsLayout>{children}</AnalyticsLayout>;
};