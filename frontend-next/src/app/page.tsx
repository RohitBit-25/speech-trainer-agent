import { Button } from "@/components/ui/button";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold font-sans mb-4">AI Speech Trainer</h1>
            <p className="text-xl text-muted-foreground font-mono mb-8">System Initialized.</p>
            <div className="flex gap-4">
                <Button variant="default">Initialize Analysis</Button>
                <Button variant="secondary">View Documentation</Button>
            </div>
        </main>
    );
}
