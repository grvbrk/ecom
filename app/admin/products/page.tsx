import { Button } from "@/components/ui/button";
import PageHeader from "../_components/PageHeader";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { pool } from "@/db";
import { connectDB } from "@/db/connection";
import { CheckCircle2, MoreVertical, XCircle } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatter";
import { QueryResult } from "pg";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ActiveToggleDropDownItem,
  DeleteDropDownItem,
} from "./_components/ProductActions";

export default function AdminProductPage() {
  return (
    <>
      <div className="flex justify-center items-center gap-4">
        <PageHeader>Products</PageHeader>
        <Button asChild>
          <Link href="/admin/products/new"> Add Product </Link>
        </Button>
      </div>
      <ProductTable />
    </>
  );
}

async function ProductTable() {
  connectDB();
  const productArray = (await pool.query(`
    SELECT *
    from Products
    ORDER BY name ASC
  `)) as QueryResult<Product>;

  const NumberOfOrders = await pool.query(`
    SELECT COUNT(*) as count
    from Orders
  `);

  const products = productArray?.rows;
  if (products.length === 0) return <p>No Products Found</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-0">
            <span className="sr-only">Available for Purchase</span>
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => {
          return (
            <TableRow key={product.id}>
              <TableCell>
                {product.isavailableforpurchase ? (
                  <>
                    <span className="sr-only">Available</span>
                    <CheckCircle2 />
                  </>
                ) : (
                  <>
                    <span className="sr-only ">Unavailable</span>
                    <XCircle className="stroke-destructive" />
                  </>
                )}
              </TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{formatCurrency(product.priceincents)}</TableCell>
              <TableCell>
                {formatNumber(NumberOfOrders?.rows[0].count)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreVertical />
                    <span className="sr-only">Actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <a
                        download
                        href={`/admin/products/${product.id}/download`}
                      >
                        Download
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <ActiveToggleDropDownItem
                      id={product.id}
                      isavailableforpurchase={product.isavailableforpurchase}
                    />
                    <DropdownMenuSeparator />
                    <DeleteDropDownItem
                      id={product.id}
                      disabled={NumberOfOrders?.rows[0].count > 0}
                      imagePath={product.imagepath}
                      filePath={product.filepath}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
