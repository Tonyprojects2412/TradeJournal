'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, Import, BarChart2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Trade Log', href: '/trades', icon: List },
    { name: 'Import Trades', href: '/import', icon: Import },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-zinc-950 border-r border-zinc-800">
            <div className="flex h-16 shrink-0 items-center px-6">
                <div className="font-bold text-xl tracking-tight text-white flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                        <BarChart2 className="w-5 h-5 text-white" />
                    </div>
                    <span>TradeJournal</span>
                </div>
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto">
                <nav className="flex-1 space-y-1 px-4 py-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive
                                        ? 'bg-zinc-800/50 text-white'
                                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100',
                                    'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300',
                                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700"></div>
                    <div>
                        <p className="text-sm font-medium text-white">Guest User</p>
                        <p className="text-xs text-zinc-500">Free Tier</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
