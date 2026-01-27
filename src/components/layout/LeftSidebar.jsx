import { useState } from 'react';
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
  syncStatus,
  projects = [],
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject
}) {
  const [projectsExpanded, setProjectsExpanded] = useState(true);

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

      {/* Projects Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setProjectsExpanded(!projectsExpanded)}
          className="w-full px-4 py-2 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Projects
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${projectsExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {projectsExpanded && (
          <div className="px-2 pb-2">
            {projects.length === 0 ? (
              <p className="px-2 py-2 text-xs text-gray-500">No projects yet</p>
            ) : (
              <div className="space-y-1">
                {projects.map(project => {
                  const agent = project.agentId ? agents.find(a => a.id === project.agentId) : null;
                  return (
                    <div
                      key={project.id}
                      onClick={() => onSelectProject(project.id)}
                      className={`group px-3 py-2 rounded-lg cursor-pointer flex items-center justify-between ${
                        activeProjectId === project.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-sm">{agent?.icon || '📁'}</span>
                        <span className="text-sm text-gray-900 truncate">{project.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                        title="Delete project"
                      >
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <button
              onClick={onCreateProject}
              className="mt-2 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>
        )}
      </div>

      <HistoryList
        sessions={sortedSessions}
        activeChatId={activeChatId}
        onSelectChat={onSelectChat}
        agents={agents}
      />
    </div>
  );
}
