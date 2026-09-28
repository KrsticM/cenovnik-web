"use client";

import { useShoppingList } from "@/contexts/ShoppingListContext";
import { QuantityStepper } from "@/components/QuantityStepper/QuantityStepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import Link from "next/link";

export default function ListaPage() {
  const { items, itemCount, clearList, setQuantity } = useShoppingList();

  const handleClearList = () => {
    if (window.confirm("Zaista želite da obrisete sve stavke iz liste?")) {
      clearList();
    }
  };

  return (
    <main className="min-h-screen bg-background py-8">
      <Container size="sm">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-foreground">Vaša lista</h1>
          <p className="mt-2 text-muted-foreground">
            Lista za kupovinu sa {itemCount} {itemCount === 1 ? "artiklom" : "artikala"}
          </p>
        </div>

        {itemCount === 0 ? (
          <Card className="border border-border bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                  Vaša lista je prazna.
                </h2>
                <p className="mb-6 text-muted-foreground">
                  Počnite da dodajete proizvode iz pregleda.
                </p>
                <Button asChild variant="default">
                  <Link href="/proizvodi">Pregledaj proizvode</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="border border-border bg-card">
                <CardContent className="grid grid-cols-4 gap-4 p-4 sm:gap-6 sm:p-6">
                  <div className="col-span-2 sm:col-span-3">
                    <h3 className="line-clamp-2 font-medium text-foreground">
                      {item.productName}
                    </h3>
                    {item.primaryBarcode && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.primaryBarcode}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 flex flex-col items-end justify-between gap-2 sm:col-span-1">
                    <QuantityStepper
                      quantity={item.quantity}
                      onIncrement={() => setQuantity(item.productId, item.quantity + 1)}
                      onDecrement={() => setQuantity(item.productId, item.quantity - 1)}
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="space-y-4 rounded-lg border border-border bg-card p-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Ukupno:</span>
                <span className="text-primary">
                  {items.length} {items.length === 1 ? "artikal" : "artikala"}
                </span>
              </div>

              <div className="flex gap-2">
                <Button asChild variant="default" className="flex-1">
                  <Link href="/proizvodi">Nastavi kupovinu</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearList}
                  className="flex-1"
                >
                  Isprazni
                </Button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </main>
  );
}
