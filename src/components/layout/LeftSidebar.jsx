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
  // Filter history by agent if one is selected
  const filteredSessions = selectedAgentId
    ? Object.values(chatSessions).filter(s => s.agentId === selectedAgentId)
    : Object.values(chatSessions);

  // Sort by most recent
  const sortedSessions = [...filteredSessions].sort((a, b) => b.createdAt - a.createdAt);

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
        isFiltered={!!selectedAgentId}
      />
    </div>
  );
}
