'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { PageLoader } from '@/components/ui/Spinner';
import { ColdStartBanner } from '@/components/ui/ColdStartBanner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) return <PageLoader />;
  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <ColdStartBanner />
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen pb-16 lg:pb-0">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
