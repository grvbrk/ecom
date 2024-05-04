"use client";

import { addProduct, updateProduct } from "@/app/admin/_actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatter";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

export default function ProductForm({ product }: { product: Product }) {
  const [error, action] = useFormState(
    product === undefined ? addProduct : updateProduct.bind(null, product.id),
    {}
  );
  const [priceInCents, setPriceInCents] = useState<number>(
    product.priceincents
  );

  return (
    <form action={action} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product.name ?? ""}
        />
      </div>
      {error.name && <div className="text-destructive">{error.name}</div>}

      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price in Rupees</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents}
          onChange={(e) => setPriceInCents(Number(e.target.value))}
        />
      </div>
      <div className="text-muted-foreground">
        {formatCurrency(priceInCents ?? 0)}
      </div>
      {error.priceInCents && (
        <div className="text-destructive">{error.priceInCents}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product.description ?? ""}
        />
      </div>
      {error.description && (
        <div className="text-destructive">{error.description}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="file">Files</Label>
        <Input
          type="file"
          id="file"
          name="file"
          required={product === undefined}
        />
      </div>
      {error.file && <div className="text-destructive">{error.file}</div>}

      <div className="space-y-2">
        <Label htmlFor="image">Images</Label>
        <Input
          type="file"
          id="image"
          name="image"
          required={product === undefined}
        />
      </div>
      {error.image && <div className="text-destructive">{error.image}</div>}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
