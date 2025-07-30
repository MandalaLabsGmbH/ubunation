'use client'

import { useState, useEffect } from 'react';
import { usePurchasesModal } from '@/app/contexts/PurchasesModalContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import Image from 'next/image';

// --- Mock Data and Types (replace with actual API calls) ---
// These types define the data structure we expect from the backend.
type Purchase = {
  purchaseId: number;
  updatedDt: string;
  purchaseData: {
    totalPrice: number;
    cart: { quantity: number }[];
  };
};

type PurchaseDetailItem = {
  userCollectible: { mint: number };
  collectible: {
    name: { en: string; de: string };
    price: number;
    imageRef: { url: string };
  };
};

// This function simulates fetching a list of purchases.
const fetchPurchases = async (page: number): Promise<{ purchases: Purchase[], hasMore: boolean }> => {
  console.log(`Fetching page ${page}...`);
  // In a real app, this would be: await fetch(`/api/db/purchases?page=${page}&limit=10`);
  return new Promise(resolve => setTimeout(() => {
    const mockPurchases: Purchase[] = Array.from({ length: 10 }, (_, i) => ({
      purchaseId: page * 10 + i,
      updatedDt: new Date(2025, 4, 5 + i).toISOString(),
      purchaseData: {
        totalPrice: 29.97,
        cart: [{ quantity: 2 }, { quantity: 1 }],
      },
    }));
    resolve({ purchases: mockPurchases, hasMore: page < 2 }); // Simulate 3 pages of data
  }, 1000));
};

// This function simulates fetching the details for a single purchase.
const fetchPurchaseDetails = async (purchaseId: number): Promise<PurchaseDetailItem[]> => {
  console.log(`Fetching details for purchase ${purchaseId}...`);
  // In a real app, this would be: await fetch(`/api/db/purchaseItems?purchaseId=${purchaseId}`);
  return new Promise(resolve => setTimeout(() => {
    resolve([
      { userCollectible: { mint: 55 }, collectible: { name: { en: 'Lion King', de: 'König der Löwen' }, price: 9.99, imageRef: { url: 'https://ubunation.s3.eu-central-1.amazonaws.com/collections/wlfa/springboks1' } } },
      { userCollectible: { mint: 101 }, collectible: { name: { en: 'Lion King', de: 'König der Löwen' }, price: 9.99, imageRef: { url: 'https://ubunation.s3.eu-central-1.amazonaws.com/collections/wlfa/springboks1' } } },
      { userCollectible: { mint: 23 }, collectible: { name: { en: 'Elk', de: 'Elch' }, price: 9.99, imageRef: { url: 'https://deins.s3.eu-central-1.amazonaws.com/images/ubu2' } } },
    ]);
  }, 1000));
};
// --- End Mock Data ---


// Main Component
export default function PurchasesModal() {
  const { isOpen, closeModal } = usePurchasesModal();
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetailItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPurchases(0, true);
    } else {
      // Reset state when modal is closed
      setTimeout(() => {
        setView('list');
        setPurchases([]);
        setPage(0);
        setHasMore(true);
      }, 300);
    }
  }, [isOpen]);

  const loadPurchases = async (pageToLoad: number, fresh = false) => {
    if (isLoading || (!hasMore && !fresh)) return;
    setIsLoading(true);
    const { purchases: newPurchases, hasMore: newHasMore } = await fetchPurchases(pageToLoad);
    setPurchases(prev => fresh ? newPurchases : [...prev, ...newPurchases]);
    setHasMore(newHasMore);
    setPage(pageToLoad);
    setIsLoading(false);
  };

  const handleSelectPurchase = async (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setView('detail');
    setIsLoadingDetails(true);
    const details = await fetchPurchaseDetails(purchase.purchaseId);
    setPurchaseDetails(details);
    setIsLoadingDetails(false);
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedPurchase(null);
    setPurchaseDetails([]);
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  };

  const renderListView = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Purchases</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-2" /> Filter by Date</Button>
        </div>
      </div>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {purchases.map(p => (
          <Card key={p.purchaseId} className="p-4 hover:bg-muted cursor-pointer transition-colors" onClick={() => handleSelectPurchase(p)}>
            <div className="flex justify-between items-center">
              <div className="font-semibold">{formatDate(p.updatedDt)}</div>
              <div className="text-muted-foreground">{p.purchaseData.cart.reduce((sum, item) => sum + item.quantity, 0)} collectibles purchased</div>
              <div className="font-bold">€{p.purchaseData.totalPrice.toFixed(2)}</div>
            </div>
          </Card>
        ))}
        {isLoading && <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>}
        {hasMore && !isLoading && (
          <Button className="w-full mt-4" variant="outline" onClick={() => loadPurchases(page + 1)}>Load More</Button>
        )}
      </div>
    </>
  );

  const renderDetailView = () => {
    if (!selectedPurchase) return null;
    const total = selectedPurchase.purchaseData.totalPrice;

    return (
      <>
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" className="mr-2" onClick={handleBackToList}><ArrowLeft /></Button>
          <h2 className="text-2xl font-bold">Receipt - {formatDate(selectedPurchase.updatedDt)}</h2>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 bg-muted/50 p-4 rounded-lg">
          {isLoadingDetails ? (
            <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
          ) : (
            <>
              {purchaseDetails.map((item, index) => {
                const imageUrl = `${item.collectible.imageRef.url}/${item.userCollectible.mint}.png`;
                return (
                  <div key={index} className="flex items-center gap-4 py-2 border-b last:border-b-0">
                    <Image src={imageUrl} alt={item.collectible.name.en} width={48} height={48} className="rounded-md bg-background" />
                    <div className="flex-grow">
                      <p className="font-semibold">{item.collectible.name.en}</p>
                      <p className="text-xs text-muted-foreground">Mint #{item.userCollectible.mint}</p>
                    </div>
                    <div className="font-semibold">€{item.collectible.price.toFixed(2)}</div>
                  </div>
                );
              })}
              <div className="flex justify-end items-center pt-4 mt-4 border-t-2">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold ml-4">€{total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
      <Card className="relative bg-background rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
        <button onClick={closeModal} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="h-6 w-6" /></button>
        {view === 'list' ? renderListView() : renderDetailView()}
      </Card>
    </div>
  );
}
