import { Sidebar } from '@/components/layout/Sidebar';
import { GlobalFilterBar } from '@/components/GlobalFilterBar';
import { HeaderBalance } from '@/components/HeaderBalance';

import { Suspense } from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-50">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden relative">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-800 px-8 bg-zinc-950 z-10">
                    <div className="flex flex-1"></div>
                    <HeaderBalance />
                </header>
                <Suspense fallback={<div className="h-[73px] w-full bg-zinc-900 border-b border-zinc-800"></div>}>
                    <GlobalFilterBar />
                </Suspense>
                <main className="flex-1 overflow-y-auto bg-zinc-950 p-8">
                    <div className="mx-auto max-w-7xl w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
