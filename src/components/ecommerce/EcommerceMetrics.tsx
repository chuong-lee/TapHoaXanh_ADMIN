"use client";
import api from "@/app/lib/axios";
import { GroupIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TitleHeaderProps {
  year?: number | null;
  month?: number | null;
}

export const EcommerceMetrics = ({ year, month }: TitleHeaderProps) => {
  const [numberOfUser, setNumberOfUser] = useState(0);
  const [numberOfOrder, setNumberOfOrder] = useState(0);
  const [numberOfRevenue, setNumberOfRevenue] = useState(0);
  // Lấy số user
  useEffect(() => {
    const getNumberOfUser = async () => {
      const response = await api.get("/users/count");
      setNumberOfUser(response.data);
    };
    getNumberOfUser();
  }, []);

  // Lấy số order theo year
  useEffect(() => {
    const getNumberOfOrder = async () => {
      const response = await api.get("/order/count", {
        params: { year, month },
      });
      setNumberOfOrder(response.data);
    };
    getNumberOfOrder();
  }, [year, month]);

  // Lấy tổng doanh thu
  useEffect(() => {
    const getTotalRevenueSuccess = async () => {
      const response = await api.get("/order/revenue", {
        params: { year, month },
      });
      setNumberOfRevenue(response.data);
    };
    getTotalRevenueSuccess();
  }, [year, month]);

  function formatNumberWithComma(num: number): string {
    return num.toLocaleString("en-US"); // hoặc "vi-VN" nếu muốn dùng dấu chấm cho VN
  }

  const totalRevenue = formatNumberWithComma(numberOfRevenue);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <Link href={"/profile"}>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Tổng số khách hàng
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {numberOfUser}
              </h4>
            </div>
          </div>
        </div>
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tổng doanh thu
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {totalRevenue}
            </h4>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <Link href={"/order"}>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Tổng đơn hàng
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {numberOfOrder}
              </h4>
            </div>
          </div>
        </div>
      </Link>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
