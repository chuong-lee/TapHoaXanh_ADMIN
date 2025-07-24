import React from "react";
import AdminLayout from "./(admin)/layout";
import Dashboard from "./(admin)/dashboard/page";

export default function HomePage() {
  return (
    <div>
      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    </div>
  );
}
