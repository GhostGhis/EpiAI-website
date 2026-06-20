'use client';

import { useEffect, useState } from 'react';
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageInput,
    MessageList,
    Thread,
    Window,
    useCreateChatClient,
} from 'stream-chat-react';
import type { Channel as StreamChannel } from 'stream-chat';
import { ChannelSidebar } from './ChannelSidebar';
import { CHAT_CHANNEL_IDS } from '@/lib/chat/channels';
import { Loader2, Menu } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import 'stream-chat-react/dist/css/v2/index.css';
import '@/styles/stream-chat-custom.css';

interface TokenData {
    token: string;
    userId: string;
    name: string;
    imageUrl?: string;
    apiKey: string;
}

function ChatClient({ tokenData }: { tokenData: TokenData }) {
    const [activeChannelId, setActiveChannelId] = useState<string>('general');
    const [activeChannel, setActiveChannel] = useState<StreamChannel | undefined>();
    const [connected, setConnected] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [channelError, setChannelError] = useState<string | null>(null);
    const [channelLoading, setChannelLoading] = useState(false);
    const [channelRetry, setChannelRetry] = useState(0);

    const client = useCreateChatClient({
        apiKey: tokenData.apiKey,
        tokenOrProvider: tokenData.token,
        userData: {
            id: tokenData.userId,
            name: tokenData.name,
            image: tokenData.imageUrl,
        },
    });

    useEffect(() => {
        if (!client) return;

        const checkConnected = () => {
            if ((client as any).wsConnection?.isConnected?.() || client.userID) {
                setConnected(true);
            }
        };

        checkConnected();

        const handler = client.on('connection.changed', (event: any) => {
            if (event.online) setConnected(true);
        });

        const userHandler = client.on('health.check', () => {
            setConnected(true);
        });

        return () => {
            handler.unsubscribe?.();
            userHandler.unsubscribe?.();
        };
    }, [client]);

    useEffect(() => {
        if (!client || !connected) return;

        let cancelled = false;
        setChannelLoading(true);
        setChannelError(null);
        setActiveChannel(undefined);

        const ch = client.channel('messaging', activeChannelId);

        ch.watch()
            .then(() => {
                if (!cancelled) {
                    setActiveChannel(ch);
                    setChannelLoading(false);
                    void ch.markRead().catch(() => {});
                    window.dispatchEvent(new CustomEvent('chat-unread-changed'));
                }
            })
            .catch((err: Error) => {
                console.error('[ChatClient] channel.watch error:', err.message);
                if (!cancelled) {
                    setChannelError(
                        err.message.includes('not found')
                            ? 'Canal introuvable. Recharge la page dans quelques secondes.'
                            : 'Impossible de rejoindre le canal. Recharge la page.'
                    );
                    setChannelLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [client, connected, activeChannelId, channelRetry]);

    const handleChannelSelect = (id: string) => {
        setActiveChannelId(id);
        setSidebarOpen(false);
    };

    if (!client || !connected) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                    <p className="text-white/30 text-xs">Connexion WebSocket...</p>
                </div>
            </div>
        );
    }

    return (
        <Chat client={client} theme="str-chat__theme-dark">
            <div className="flex h-full relative min-w-0">
                {sidebarOpen && (
                    <button
                        type="button"
                        className="lg:hidden fixed inset-0 bg-black/60 z-30"
                        aria-label="Fermer les canaux"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <ChannelSidebar
                    client={client}
                    userId={tokenData.userId}
                    activeChannelId={activeChannelId}
                    onChannelSelect={handleChannelSelect}
                    className={cn(
                        'z-40 transition-transform duration-300 ease-out',
                        'fixed inset-y-0 left-0 lg:relative lg:translate-x-0',
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    )}
                />

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <div className="lg:hidden shrink-0 flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-black/40">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/15 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Ouvrir les canaux"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-white/80 truncate">
                            {CHAT_CHANNEL_IDS.includes(activeChannelId as typeof CHAT_CHANNEL_IDS[number])
                                ? activeChannelId.replace(/-/g, ' ')
                                : activeChannelId}
                        </span>
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden">
                        {channelLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                            </div>
                        ) : channelError || !activeChannel ? (
                            <div className="flex flex-col items-center justify-center h-full px-4 text-center gap-3">
                                <p className="text-white/60 text-sm">{channelError ?? 'Connexion au canal...'}</p>
                                <button
                                    type="button"
                                    onClick={() => setChannelRetry((n) => n + 1)}
                                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15"
                                >
                                    Réessayer
                                </button>
                            </div>
                        ) : (
                        <Channel channel={activeChannel}>
                            <Window>
                                <ChannelHeader />
                                <MessageList />
                                <MessageInput focus />
                            </Window>
                            <Thread />
                        </Channel>
                        )}
                    </div>
                </div>
            </div>
        </Chat>
    );
}

export function ChatPage() {
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchToken() {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 12000);

                const res = await fetch('/api/chat/token', { signal: controller.signal });
                clearTimeout(timeout);

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to get chat token');
                }

                const data: TokenData = await res.json();

                if (!data.userId) {
                    throw new Error('Invalid token response: missing userId');
                }

                if (!cancelled) setTokenData(data);
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.name === 'AbortError'
                        ? 'Serveur trop lent. Réessaie dans quelques secondes.'
                        : err.message
                    );
                }
            }
        }

        fetchToken();
        return () => { cancelled = true; };
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50dvh] text-center px-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                    <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Chat non disponible</h2>
                <p className="text-white/60 max-w-md text-sm mb-4">{error}</p>
                <button
                    onClick={() => { setError(null); setTokenData(null); }}
                    className="px-4 py-3 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors min-h-[44px]"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!tokenData) {
        return (
            <div className="flex items-center justify-center min-h-[50dvh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                    <p className="text-white/40 text-sm">Connexion au chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-wrapper h-[calc(100dvh-11rem)] lg:h-[calc(100vh-140px)] min-h-[320px] rounded-2xl overflow-hidden border border-white/10">
            <ChatClient tokenData={tokenData} />
        </div>
    );
}
