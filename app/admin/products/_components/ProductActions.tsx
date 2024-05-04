"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import {
  deleteProduct,
  toggleProductAvailability,
} from "../../_actions/products";
import { useRouter } from "next/navigation";

export function ActiveToggleDropDownItem({
  id,
  isavailableforpurchase,
}: {
  id: number;
  isavailableforpurchase: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await toggleProductAvailability(id, !isavailableforpurchase);
          router.refresh();
        });
      }}
    >
      {isavailableforpurchase ? "Deactivate" : "Activate"}
    </DropdownMenuItem>
  );
}

export function DeleteDropDownItem({
  id,
  disabled,
  imagePath,
  filePath,
}: {
  id: number;
  disabled: boolean;
  imagePath: string;
  filePath: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <DropdownMenuItem
      className="text-red-600"
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          await deleteProduct(id, imagePath, filePath);
          router.refresh();
        });
      }}
    >
      Delete
    </DropdownMenuItem>
  );
}
