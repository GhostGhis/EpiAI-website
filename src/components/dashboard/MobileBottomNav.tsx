'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  FolderOpen,
  MessagesSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { UnreadBadge } from '@/components/chat/UnreadBadge';
import { useChatUnreadCount } from '@/hooks/useChatUnreadCount';

const items = [
  { href: '/dashboard', icon: LayoutDashboard, labelFr: 'Accueil', labelEn: 'Home', seg: 'dashboard' },
  { href: '/resources', icon: FolderOpen, labelFr: 'Ressources', labelEn: 'Resources', seg: 'resources' },
  { href: '/forum', icon: MessageSquare, labelFr: 'Forum', labelEn: 'Forum', seg: 'forum' },
  { href: '/chat', icon: MessagesSquare, labelFr: 'Chat', labelEn: 'Chat', seg: 'chat', showChatBadge: true },
  { href: '/events', icon: Calendar, labelFr: 'Events', labelEn: 'Events', seg: 'events' },
];

export default function MobileBottomNav() {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params.locale as string) || 'fr';
  const { total: chatUnread } = useChatUnreadCount(true);

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)]"
      aria-label={locale === 'fr' ? 'Navigation principale' : 'Main navigation'}
    >
      <ul className="flex items-center justify-around py-2">
        {items.map(({ href, icon: Icon, labelFr, labelEn, seg, showChatBadge }) => {
          const active = pathname.includes(`/${seg}`);
          const badge = showChatBadge ? chatUnread : 0;
          return (
            <li key={href}>
              <Link
                href={`/${locale}${href}`}
                className={cn(
                  'relative flex flex-col items-center gap-0.5 px-2 py-2 text-xs font-medium min-w-[56px] min-h-[52px] justify-center',
                  active ? 'text-blue-400' : badge > 0 ? 'text-white/80' : 'text-white/50'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="relative">
                  <Icon className="w-5 h-5" aria-hidden />
                  {badge > 0 && (
                    <UnreadBadge
                      count={badge}
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-4 text-[9px]"
                    />
                  )}
                </span>
                {locale === 'fr' ? labelFr : labelEn}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
