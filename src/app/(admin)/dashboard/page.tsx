import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import { RevenueOverview } from "@/components/ecommerce/RevenueOverview";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import DailyRevenueChart from "@/components/ecommerce/DailyRevenueChart";
import WeeklyRevenueChart from "@/components/ecommerce/WeeklyRevenueChart";
import RevenueComparisonChart from "@/components/ecommerce/RevenueComparisonChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";

export default function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 xl:col-span-12">
        <EcommerceMetrics />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <RevenueOverview />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <DailyRevenueChart />
      </div>

      <div className="col-span-12 xl:col-span-6">
        <WeeklyRevenueChart />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <RevenueComparisonChart />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <MonthlySalesChart />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <RecentOrders />
      </div>
    </div>
  );
}
