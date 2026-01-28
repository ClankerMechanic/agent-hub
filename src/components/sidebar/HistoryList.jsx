import { ChatHistoryItem } from '../chat/ChatHistoryItem';

export function HistoryList({ sessions, activeChatId, onSelectChat, agents, darkMode }) {
  const getAgent = (agentId) => agents.find(a => a.id === agentId);

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className={`text-sm text-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          No chat history yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2">
        <h3 className={`px-2 py-1 text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Recent Chats
        </h3>
        <div className="space-y-1 mt-1">
          {sessions.map(session => (
            <ChatHistoryItem
              key={session.id}
              session={session}
              isActive={session.id === activeChatId}
              onClick={() => onSelectChat(session.id)}
              agent={getAgent(session.agentId)}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
