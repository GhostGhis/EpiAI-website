'use client';

import { StreamChat } from 'stream-chat';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { CHAT_CHANNELS } from '@/lib/chat/channels';

interface ChannelDef {
    id: string;
    label: string;
    icon: string;
    description: string;
}

const CHANNEL_UI: ChannelDef[] = [
    { id: 'general', label: 'Général', icon: '💬', description: 'Canal principal' },
    { id: 'ai-discussion', label: 'Intelligence Artificielle', icon: '🧠', description: 'IA & ML' },
    { id: 'web-dev', label: 'Web & Mobile', icon: '🌐', description: 'Dev web et mobile' },
    { id: 'data', label: 'Data Science', icon: '📊', description: 'Data & analyse' },
    { id: 'projets', label: 'Projets', icon: '🚀', description: 'Projets asso' },
    { id: 'annonces', label: 'Annonces', icon: '📢', description: 'Annonces officielles' },
];

interface ChannelSidebarProps {
    client: StreamChat;
    userId: string;
    activeChannelId: string;
    onChannelSelect: (id: string) => void;
    className?: string;
}

export function ChannelSidebar({ client, userId, activeChannelId, onChannelSelect, className }: ChannelSidebarProps) {
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        // Watch all channels to track unread counts
        async function watchChannels() {
            try {
                const channels = await client.queryChannels({
                    type: 'messaging',
                    id: { $in: CHAT_CHANNELS.map((c) => c.id) },
                    members: { $in: [userId] },
                });

                const counts: Record<string, number> = {};
                channels.forEach((ch) => {
                    counts[ch.id!] = ch.countUnread();
                });
                setUnreadCounts(counts);

                // Real-time update
                const handleEvent = () => {
                    const newCounts: Record<string, number> = {};
                    channels.forEach((ch) => {
                        newCounts[ch.id!] = ch.countUnread();
                    });
                    setUnreadCounts({ ...newCounts });
                };

                client.on('message.new', handleEvent);
                return () => {
                    client.off('message.new', handleEvent);
                };
            } catch (e) {
                // Channels may not exist yet
            }
        }

        watchChannels();
    }, [client, userId]);

    return (
        <div className={cn('w-64 max-w-[85vw] shrink-0 border-r border-white/10 bg-zinc-900 lg:bg-black/30 flex flex-col h-full', className)}>
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <h2 className="text-white font-semibold text-sm uppercase tracking-wider opacity-60">
                    Canaux
                </h2>
            </div>

            {/* Channel list */}
            <div className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
                {CHANNEL_UI.map((ch) => {
                    const isActive = activeChannelId === ch.id;
                    const unread = unreadCounts[ch.id] || 0;

                    return (
                        <button
                            key={ch.id}
                            onClick={() => onChannelSelect(ch.id)}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group',
                                isActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                            )}
                        >
                            <span className="text-lg shrink-0">{ch.icon}</span>
                            <div className="flex-1 min-w-0">
                                <p className={cn('text-sm font-medium truncate', isActive ? 'text-white' : '')}>
                                    {ch.label}
                                </p>
                            </div>
                            {unread > 0 && !isActive && (
                                <span className="shrink-0 min-w-[20px] h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center px-1.5 font-medium">
                                    {unread > 9 ? '9+' : unread}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/10">
                <p className="text-white/20 text-xs text-center">Epi'AI Chat • Temps réel</p>
            </div>
        </div>
    );
}
