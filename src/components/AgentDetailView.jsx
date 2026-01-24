import { Breadcrumb } from './Breadcrumb';
import { SystemPromptDisplay } from './SystemPromptDisplay';
import { QuickStats } from './QuickStats';
import { AgentHistoryList } from './AgentHistoryList';

export function AgentDetailView({
  agent,
  history,
  onExecute,
  onBack,
  onEdit,
  onRerun,
  onDeleteHistory
}) {
  const agentHistory = history.filter(item => item.agentId === agent.id);
  const runCount = agentHistory.length;
  const lastUsed = agentHistory.length > 0 ? agentHistory[0].timestamp : null;

  const breadcrumbItems = [
    { label: 'Agents', onClick: onBack },
    { label: agent.category, onClick: onBack },
    { label: agent.name }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb items={breadcrumbItems} />

      {/* Agent Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{agent.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                {agent.category}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{agent.description}</p>
            <div className="flex gap-3">
              <button
                onClick={onExecute}
                className="bg-blue-600 text-white py-2.5 px-5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Execute Agent
              </button>
              {agent.isCustom && (
                <button
                  onClick={() => onEdit?.(agent)}
                  className="bg-gray-100 text-gray-700 py-2.5 px-5 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mb-6">
        <QuickStats runCount={runCount} lastUsed={lastUsed} />
      </div>

      {/* System Prompt */}
      <div className="mb-6">
        <SystemPromptDisplay prompt={agent.systemPrompt} />
      </div>

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          History {agentHistory.length > 0 && `(${agentHistory.length})`}
        </h3>
        <AgentHistoryList
          history={agentHistory}
          onRerun={onRerun}
          onDelete={onDeleteHistory}
          limit={5}
        />
      </div>
    </div>
  );
}
