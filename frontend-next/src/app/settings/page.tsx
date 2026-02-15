import { Button } from "@/components/ui/button";
import { Settings, Save, Volume2, Monitor } from "lucide-react";

export default function SettingsPage() {
    return (
        <main className="flex min-h-screen flex-col items-center p-8 md:p-24 w-full max-w-4xl mx-auto">

            {/* Header */}
            <div className="w-full flex items-center gap-4 mb-12 border-b-4 border-primary pb-4">
                <Settings className="w-8 h-8 text-primary animate-spin-slow" />
                <h1 className="text-3xl md:text-4xl font-pixel text-white">SYSTEM_CONFIG</h1>
            </div>

            {/* Settings Grid */}
            <div className="grid gap-8 w-full">

                {/* Audio Settings */}
                <div className="bg-zinc-900 border-4 border-zinc-700 p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3 mb-6">
                        <Volume2 className="w-6 h-6 text-secondary" />
                        <h2 className="text-xl font-pixel text-secondary">AUDIO_MODULE</h2>
                    </div>
                    <div className="space-y-4 font-mono text-zinc-400">
                        <div className="flex justify-between items-center p-2 hover:bg-zinc-800 border border-transparent hover:border-zinc-600 cursor-pointer">
                            <span>Input Sensitivity</span>
                            <span className="text-primary">[HIGH]</span>
                        </div>
                        <div className="flex justify-between items-center p-2 hover:bg-zinc-800 border border-transparent hover:border-zinc-600 cursor-pointer">
                            <span>Noise Cancellation</span>
                            <span className="text-primary">[ACTIVE]</span>
                        </div>
                    </div>
                </div>

                {/* Interface Settings */}
                <div className="bg-zinc-900 border-4 border-zinc-700 p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-3 mb-6">
                        <Monitor className="w-6 h-6 text-orange-500" />
                        <h2 className="text-xl font-pixel text-orange-500">VISUAL_INTERFACE</h2>
                    </div>
                    <div className="space-y-4 font-mono text-zinc-400">
                        <div className="flex justify-between items-center p-2 hover:bg-zinc-800 border border-transparent hover:border-zinc-600 cursor-pointer">
                            <span>Theme</span>
                            <span className="text-orange-500">[PIXEL_OS]</span>
                        </div>
                        <div className="flex justify-between items-center p-2 hover:bg-zinc-800 border border-transparent hover:border-zinc-600 cursor-pointer">
                            <span>High Contrast</span>
                            <span className="text-zinc-600">[OFF]</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <Button className="font-pixel text-xs bg-primary text-black hover:bg-primary/90 border-2 border-primary shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                        <Save className="w-4 h-4 mr-2" />
                        SAVE_CONFIG
                    </Button>
                </div>

            </div>
        </main>
    );
}
