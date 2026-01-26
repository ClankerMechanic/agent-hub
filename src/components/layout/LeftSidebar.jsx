import { OptionsPanel } from '../sidebar/OptionsPanel';
import { HistoryList } from '../sidebar/HistoryList';

export function LeftSidebar({
  onNewChat,
  onSettingsClick,
  chatSessions,
  selectedAgentId,
  activeChatId,
  onSelectChat,
  agents
}) {
  // Show all sessions, sorted by most recent
  const allSessions = Object.values(chatSessions);
  const sortedSessions = [...allSessions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="flex flex-col h-full">
      <OptionsPanel
        onNewChat={onNewChat}
        onSettingsClick={onSettingsClick}
      />
      <HistoryList
        sessions={sortedSessions}
        activeChatId={activeChatId}
        onSelectChat={onSelectChat}
        agents={agents}
      />
    </div>
  );
}
