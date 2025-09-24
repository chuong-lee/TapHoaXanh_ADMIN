import GridShape from "@/components/common/GridShape";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <div className="flex items-center gap-2 text-white uppercase mb-3">
                  <Image
                    width={45}
                    height={45}
                    src="/images/brand/brand-01.svg"
                    alt="Logo"
                  />
                  <span> Tạp hóa xanh ADMIN</span>
                </div>
                <p className="text-center uppercase text-gray-400 dark:text-white/60">
                  Chào mừng đến phần mềm quản lý
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
