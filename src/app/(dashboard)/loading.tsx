export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div>
                <div className="h-8 w-48 bg-zinc-800/50 rounded-md animate-pulse"></div>
                <div className="h-4 w-96 bg-zinc-900 rounded-md animate-pulse mt-2"></div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 text-card-foreground shadow h-32 animate-pulse"></div>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-zinc-800 bg-zinc-900/50 h-96 animate-pulse"></div>
                <div className="col-span-3 rounded-xl border border-zinc-800 bg-zinc-900/50 h-96 animate-pulse"></div>
            </div>
        </div>
    );
}
