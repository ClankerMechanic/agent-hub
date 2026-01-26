import { OptionsPanel } from '../sidebar/OptionsPanel';
import { HistoryList } from '../sidebar/HistoryList';

export function LeftSidebar({
  onNewChat,
  onSettingsClick,
  chatSessions,
  selectedAgentId,
  activeChatId,
  onSelectChat,
  agents,
  onGitHubClick,
  githubEnabled,
  syncStatus
}) {
  // Show all sessions, sorted by most recent
  const allSessions = Object.values(chatSessions);
  const sortedSessions = [...allSessions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="flex flex-col h-full">
      <OptionsPanel
        onNewChat={onNewChat}
        onSettingsClick={onSettingsClick}
        onGitHubClick={onGitHubClick}
        githubEnabled={githubEnabled}
        syncStatus={syncStatus}
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
