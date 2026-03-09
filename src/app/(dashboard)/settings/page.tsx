'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-zinc-500">Manage your account settings and trading preferences.</p>
            </div>

            <div className="grid gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription className="text-zinc-400">Update your personal details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" defaultValue="Guest User" className="bg-zinc-950 border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue="guest@tradejournal.app" className="bg-zinc-950 border-zinc-800" />
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-zinc-800 mt-4 pt-6">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
                    </CardFooter>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle>Trading Preferences</CardTitle>
                        <CardDescription className="text-zinc-400">Configure default values for quick trade entry.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="defaultFee">Default Stock Commision</Label>
                                <Input id="defaultFee" type="number" defaultValue="0.00" className="bg-zinc-950 border-zinc-800" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="defaultOptFee">Default Option Contract Fee</Label>
                                <Input id="defaultOptFee" type="number" defaultValue="0.65" className="bg-zinc-950 border-zinc-800" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t border-zinc-800 mt-4 pt-6">
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Update Preferences</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
