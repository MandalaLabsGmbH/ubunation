'use client'

import withAuth from "@/app/(auth)/withAuth";

function CollectiblesPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold">My Collectibles</h1>
      <p className="text-lg text-muted-foreground mt-4">Under Construction</p>
    </div>
  );
}

export default withAuth(CollectiblesPage);