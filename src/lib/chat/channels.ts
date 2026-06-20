export const CHAT_CHANNELS = [
  { id: 'general', name: '💬 Général' },
  { id: 'ai-discussion', name: '🧠 Intelligence Artificielle' },
  { id: 'web-dev', name: '🌐 Web & Mobile' },
  { id: 'data', name: '📊 Data Science' },
  { id: 'projets', name: '🚀 Projets' },
  { id: 'annonces', name: '📢 Annonces' },
] as const;

export const CHAT_CHANNEL_IDS = CHAT_CHANNELS.map((c) => c.id);
