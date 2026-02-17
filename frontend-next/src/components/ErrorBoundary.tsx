"use client";

import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background">
                    <Card className="max-w-md w-full bg-zinc-900 border-4 border-red-500">
                        <CardHeader className="border-b-4 border-zinc-700 bg-zinc-950">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <CardTitle className="font-pixel text-lg text-white">
                                    SYSTEM_ERROR
                                </CardTitle>
                            </div>
                            <CardDescription className="font-mono text-xs text-zinc-400">
                                An unexpected error occurred
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="bg-zinc-950 border-2 border-zinc-700 p-4 rounded">
                                <p className="font-mono text-xs text-red-400 break-words">
                                    {this.state.error?.message || 'Unknown error'}
                                </p>
                            </div>
                            <Button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    window.location.href = '/';
                                }}
                                className="w-full font-pixel text-xs bg-primary text-black hover:bg-primary/90"
                            >
                                RETURN_TO_BASE
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
