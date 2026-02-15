import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Edit2, Save, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { audioController } from "@/lib/audio";

interface TranscriptProps {
    text?: string;
    isLoading?: boolean;
    onSave?: (newText: string) => void;
}

export function Transcript({ text, isLoading, onSave }: TranscriptProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(text || "");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (text) {
            setEditedText(text);
        }
    }, [text]);

    const handleEditToggle = () => {
        audioController.playClick();
        if (!isEditing) {
            setEditedText(text || "");
        }
        setIsEditing(!isEditing);
    };

    const handleSave = () => {
        audioController.playSuccess();
        if (onSave) {
            onSave(editedText);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        audioController.playError();
        setIsEditing(false);
        setEditedText(text || "");
    };

    return (
        <Card className="h-full flex flex-col bg-zinc-950 border-4 border-zinc-700 shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
            <CardHeader className="py-2 px-4 border-b-4 border-zinc-700 bg-zinc-900 flex flex-row items-center justify-between space-y-0 h-14">
                <CardTitle className="text-xs font-pixel text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                    <Terminal className="h-3 w-3 text-green-500" />
                    COMM_LOGS
                </CardTitle>
                <div className="flex gap-2">
                    {!isLoading && text && (
                        isEditing ? (
                            <>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancel}
                                    className="h-6 w-6 p-0 hover:bg-red-900/50 hover:text-red-400"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleSave}
                                    className="h-6 w-6 p-0 hover:bg-green-900/50 hover:text-green-400"
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleEditToggle}
                                className="h-6 w-6 p-0 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                            >
                                <Edit2 className="h-3 w-3" />
                            </Button>
                        )
                    )}
                    <div className="flex gap-1 items-center">
                        <div className="w-2 h-2 bg-zinc-600 rounded-sm"></div>
                        <div className="w-2 h-2 bg-zinc-600 rounded-sm"></div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative min-h-[200px] bg-black/50">
                <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
                <ScrollArea className="h-full w-full absolute inset-0">
                    <div className="p-4 text-sm font-mono leading-relaxed text-green-400/90 whitespace-pre-wrap h-full">
                        {isLoading ? (
                            <div className="space-y-2 animate-pulse">
                                <span className="inline-block w-20 h-4 bg-green-500/20 mr-2"></span>
                                <span className="inline-block w-40 h-4 bg-green-500/20"></span>
                                <div className="h-4 w-3/4 bg-green-500/10 rounded"></div>
                            </div>
                        ) : isEditing ? (
                            <textarea
                                ref={textareaRef}
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                className="w-full h-full min-h-[300px] bg-transparent border-none focus:ring-0 resize-none outline-none text-green-400 font-mono p-0"
                                spellCheck={false}
                                autoFocus
                            />
                        ) : text ? (
                            <>
                                <span className="text-zinc-500 mr-2 select-none">$</span>
                                {text}
                                <span className="animate-blink inline-block w-2 h-4 bg-green-500 ml-1 align-middle"></span>
                            </>
                        ) : (
                            <span className="italic opacity-50 text-zinc-500">
                                <span className="text-zinc-500 mr-2 select-none">$</span>
                                NO_DATA_RECEIVED...
                            </span>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
