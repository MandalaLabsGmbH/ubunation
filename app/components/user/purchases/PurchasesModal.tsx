'use client'

import { useState, useEffect } from 'react';
import { usePurchasesModal } from '@/app/contexts/PurchasesModalContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from '@/app/hooks/useTranslation';
import CollectibleImage from '../../CollectibleImage'; // Import the new component

// --- Types for API Data ---
type Purchase = {
  purchaseId: number;
  updatedDt: string;
  purchaseData: {
    totalPrice: number;
  };
  itemCount: number;
};

type PurchaseDetailItem = {
  purchaseItemId: number;
  purchasedUserItemId: number;
  itemTable: string;
  itemId: number;
  collectible: {
    name: { en: string; de: string };
    price?: { base: string };
    imageRef: { url: string };
  };
  userCollectible: {
    mint: number;
  };
};

// --- API Fetching Functions ---
const fetchPurchases = async (): Promise<Purchase[]> => {
  try {
    const response = await fetch(`/api/db/purchase`);
    if (!response.ok) {
      throw new Error('Failed to fetch purchases');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchPurchaseDetails = async (purchaseId: number): Promise<PurchaseDetailItem[]> => {
  try {
    const response = await fetch(`/api/db/purchaseItem?purchaseId=${purchaseId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch purchase details');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

// --- Main Component ---
export default function PurchasesModal() {
  const { isOpen, closeModal } = usePurchasesModal();
  const { language } = useTranslation();
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    const loadAndSortPurchases = async () => {
      if (!isOpen) return;
      setIsLoading(true);
      const fetchedPurchases = await fetchPurchases();
      const sortedPurchases = fetchedPurchases.sort((a, b) => new Date(b.updatedDt).getTime() - new Date(a.updatedDt).getTime());
      setPurchases(sortedPurchases);
      setIsLoading(false);
    };

    loadAndSortPurchases();

    if (!isOpen) {
      setTimeout(() => {
        setView('list');
        setPurchases([]);
      }, 300);
    }
  }, [isOpen]);

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
      </div>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
        ) : (
          purchases.map(p => (
            <Card key={p.purchaseId} className="p-4 hover:bg-muted cursor-pointer transition-colors" onClick={() => handleSelectPurchase(p)}>
              <div className="flex justify-between items-center">
                <div className="font-semibold">{formatDate(p.updatedDt)}</div>
                <div className="text-muted-foreground">{p.itemCount} collectibles purchased</div>
                <div className="font-bold">€{p.purchaseData.totalPrice.toFixed(2)}</div>
              </div>
            </Card>
          ))
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
              {purchaseDetails.map((item) => {
                const imageUrl = `${item.collectible.imageRef.url}/${item.userCollectible.mint}.png`;
                const displayName = item.collectible.name[language as 'en' | 'de'] || item.collectible.name.en;
                const itemPrice = parseFloat(item.collectible.price?.base || '0');
                return (
                  <div key={item.purchaseItemId} className="flex items-center gap-4 py-2 border-b last:border-b-0">
                    {/* The Fix: Use the CollectibleImage component */}
                    <CollectibleImage 
                      src={imageUrl} 
                      fallbackSrc="/images/ubuLion.jpg"
                      alt={displayName} 
                      width={48} 
                      height={48} 
                      className="rounded-md bg-background" 
                    />
                    <div className="flex-grow">
                      <p className="font-semibold">{displayName}</p>
                      <p className="text-xs text-muted-foreground">Mint #{item.userCollectible.mint}</p>
                    </div>
                    <div className="font-semibold">€{itemPrice.toFixed(2)}</div>
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
