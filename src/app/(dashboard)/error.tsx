'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[80vh] w-full items-center justify-center p-6">
            <Card className="bg-zinc-900 border-zinc-800 max-w-md w-full">
                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
                    <div className="bg-rose-500/10 p-3 rounded-full">
                        <AlertCircle className="h-8 w-8 text-rose-500" />
                    </div>
                    <CardTitle className="text-xl">Something went wrong!</CardTitle>
                    <p className="text-sm text-zinc-400">
                        An unexpected error occurred while loading this page.
                        Ensure your database is connected and available.
                    </p>
                    <div className="pt-4">
                        <Button
                            variant="outline"
                            onClick={() => reset()}
                            className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
                        >
                            Try again
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
