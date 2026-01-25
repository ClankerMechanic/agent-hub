import { ChatHistoryItem } from '../chat/ChatHistoryItem';

export function HistoryList({ sessions, activeChatId, onSelectChat, agents, isFiltered }) {
  const getAgent = (agentId) => agents.find(a => a.id === agentId);

  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-gray-500 text-center">
          {isFiltered ? 'No history for this agent' : 'No chat history yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2">
        <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {isFiltered ? 'Agent History' : 'Recent Chats'}
        </h3>
        <div className="space-y-1 mt-1">
          {sessions.map(session => (
            <ChatHistoryItem
              key={session.id}
              session={session}
              isActive={session.id === activeChatId}
              onClick={() => onSelectChat(session.id)}
              agent={getAgent(session.agentId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
