import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pool } from "@/db";
import React from "react";
import { formatCurrency, formatNumber } from "@/lib/formatter";

async function getSalesData() {
  const p1 = pool.query(`
    Select SUM(priceInCents) from orders
  `)!;

  const p2 = pool.query(`
    Select COUNT(*) from orders
  `)!;

  const [totalNumberOfSales, totalAmountOfOrders] = await Promise.all([p1, p2]);

  return {
    totalNumberOfSales: (totalNumberOfSales?.rows[0] ?? 0) / 100,
    totalAmountOfOrders: totalAmountOfOrders?.rows[0] ?? 0,
  };
}

async function getUsersData() {
  const p1 = pool.query(`
    SELECT COUNT(*) from users
  `);

  const p2 = pool.query(`
    SELECT AVG(priceInCents) from orders
  `);

  const [totalUsersCount, averageValueOfOrder] = await Promise.all([p1, p2]);

  return {
    totalUsersCount: totalUsersCount?.rows[0] ?? 0,
    averageValueOfOrder: (averageValueOfOrder?.rows[0] ?? 0) / 100,
  };
}

async function getProductsData() {
  // await new Promise((r) => setTimeout(r, 5000));
  const p1 = pool.query(`
    SELECT COUNT(*)
    FROM Products
    where isAvailableForPurchase = 'true'
  `);

  const p2 = pool.query(`
    SELECT COUNT(*)
    FROM Products
    where isAvailableForPurchase = 'false'
  `);

  const [activeProducts, inactiveProducts] = await Promise.all([p1, p2]);

  return {
    activeProducts: activeProducts?.rows[0] ?? 0,
    inactiveProducts: inactiveProducts?.rows[0] ?? 0,
  };
}

export default async function AdminDashboard() {
  const { totalNumberOfSales, totalAmountOfOrders } = await getSalesData();
  const { totalUsersCount, averageValueOfOrder } = await getUsersData();
  const { activeProducts, inactiveProducts } = await getProductsData();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardCard
        title="Sales"
        subtitle={`${formatNumber(totalNumberOfSales)} Orders`}
        body={formatCurrency(totalAmountOfOrders)}
      />

      <DashboardCard
        title="Customers"
        subtitle={`${formatCurrency(averageValueOfOrder)} Average Value`}
        body={formatNumber(totalUsersCount)}
      />

      <DashboardCard
        title="Active Products"
        subtitle={`${formatNumber(inactiveProducts)} Inactive`}
        body={formatNumber(activeProducts)}
      />
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
};

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}
