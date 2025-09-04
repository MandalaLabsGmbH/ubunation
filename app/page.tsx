import HomePageClient from '@/app/components/HomePageClient';

// This is no longer an async component. It renders instantly.
export default function UBUNΛTIONRootPage() {
  // The client component will now handle all data fetching and loading states.
  return <HomePageClient />;
}