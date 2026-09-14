import { redirect } from 'next/navigation';

const DashboardPage = () => {
  return redirect("/dashboard/analytics");
}

export default DashboardPage;