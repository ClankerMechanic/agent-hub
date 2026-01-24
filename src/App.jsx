import { useState, useEffect, useMemo } from 'react';
import { Settings } from './components/Settings';
import { ExecutionView } from './components/ExecutionView';
import { Navigation } from './components/Navigation';
import { CreateAgentModal } from './components/CreateAgentModal';
import { HistoryView } from './components/HistoryView';
import { CategoryTabs } from './components/CategoryTabs';
import { AgentDetailView } from './components/AgentDetailView';
import { SortableAgentGrid } from './components/SortableAgentGrid';
import { SortOptions } from './components/SortOptions';
import { useAgentSorting } from './hooks/useAgentSorting';
import { agents as builtInAgents, categories } from './config/agents';

const API_KEY_STORAGE_KEY = 'agent-hub-api-key';
const CUSTOM_AGENTS_KEY = 'agent-hub-custom-agents';
const HISTORY_KEY = 'agent-hub-history';
const PREFERENCES_KEY = 'agent-hub-preferences';

const DEFAULT_PREFERENCES = {
  pinnedAgentIds: [],
  agentOrder: {},
  sortPreference: 'manual'
};

function App() {
  // Use lazy initialization to read from localStorage
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE_KEY) || '');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [view, setView] = useState(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    return storedKey ? 'home' : 'settings';
  });
  const [activeTab, setActiveTab] = useState('agents');
  const [customAgents, setCustomAgents] = useState(() => {
    const stored = localStorage.getItem(CUSTOM_AGENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [initialInput, setInitialInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [preferences, setPreferences] = useState(() => {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
  });

  // Save custom agents to localStorage
  useEffect(() => {
    localStorage.setItem(CUSTOM_AGENTS_KEY, JSON.stringify(customAgents));
  }, [customAgents]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const allAgents = useMemo(() => [...builtInAgents, ...customAgents], [customAgents]);

  const agentCounts = useMemo(() => {
    return allAgents.reduce((counts, agent) => {
      const cat = agent.isCustom ? 'Custom' : agent.category;
      counts[cat] = (counts[cat] || 0) + 1;
      return counts;
    }, {});
  }, [allAgents]);

  const categoryFilteredAgents = useMemo(() => {
    if (activeCategory === 'all') return allAgents;
    if (activeCategory === 'Custom') {
      return allAgents.filter(a => a.isCustom);
    }
    return allAgents.filter(a => !a.isCustom && a.category === activeCategory);
  }, [allAgents, activeCategory]);

  const sortedAgents = useAgentSorting(categoryFilteredAgents, preferences, history);

  const handleSaveApiKey = (key) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKey(key);
    setView('home');
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setInitialInput('');
    setView('agent-detail');
  };

  const handleExecuteFromDetail = () => {
    setView('execution');
  };

  const handleBackToHome = () => {
    setSelectedAgent(null);
    setInitialInput('');
    setView('home');
  };

  const handleBackToDetail = () => {
    setInitialInput('');
    setView('agent-detail');
  };

  const handleOpenSettings = () => {
    setView('settings');
  };

  const handleSaveCustomAgent = (agent) => {
    if (editingAgent) {
      setCustomAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
    } else {
      setCustomAgents(prev => [...prev, agent]);
    }
    setEditingAgent(null);
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setShowCreateModal(true);
  };

  const handleDeleteAgent = (agentId) => {
    setCustomAgents(prev => prev.filter(a => a.id !== agentId));
  };

  const handleSaveHistory = (entry) => {
    setHistory(prev => [entry, ...prev]);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all history?')) {
      setHistory([]);
    }
  };

  const handleDeleteHistoryItem = (historyId) => {
    setHistory(prev => prev.filter(item => item.id !== historyId));
  };

  const handleTogglePin = (agentId) => {
    setPreferences(prev => {
      const isPinned = prev.pinnedAgentIds.includes(agentId);
      return {
        ...prev,
        pinnedAgentIds: isPinned
          ? prev.pinnedAgentIds.filter(id => id !== agentId)
          : [...prev.pinnedAgentIds, agentId]
      };
    });
  };

  const handleReorder = (oldIndex, newIndex) => {
    const agents = sortedAgents;
    const movedAgent = agents[oldIndex];
    const category = movedAgent.isCustom ? 'Custom' : movedAgent.category;

    // Get current category agents in order
    const categoryAgents = agents.filter(a =>
      a.isCustom ? category === 'Custom' : a.category === category
    );
    const ids = categoryAgents.map(a => a.id);

    // Reorder
    const [removed] = ids.splice(oldIndex, 1);
    ids.splice(newIndex, 0, removed);

    setPreferences(prev => ({
      ...prev,
      agentOrder: {
        ...prev.agentOrder,
        [category]: ids
      }
    }));
  };

  const handleSortPreferenceChange = (newPreference) => {
    setPreferences(prev => ({
      ...prev,
      sortPreference: newPreference
    }));
  };

  const handleRerun = (historyItem) => {
    const agent = allAgents.find(a => a.id === historyItem.agentId);
    if (agent) {
      setSelectedAgent(agent);
      setInitialInput(historyItem.input);
      setView('execution');
      setActiveTab('agents');
    }
  };

  // Loading state
  if (view === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Settings view
  if (view === 'settings') {
    return <Settings onSave={handleSaveApiKey} initialApiKey={apiKey} />;
  }

  // Agent detail view
  if (view === 'agent-detail' && selectedAgent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            handleBackToHome();
          }}
          onSettingsClick={handleOpenSettings}
        />
        <div className="p-4">
          <AgentDetailView
            agent={selectedAgent}
            history={history}
            onExecute={handleExecuteFromDetail}
            onBack={handleBackToHome}
            onEdit={handleEditAgent}
            onRerun={handleRerun}
            onDeleteHistory={handleDeleteHistoryItem}
          />
        </div>
        <CreateAgentModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAgent(null);
          }}
          onSave={handleSaveCustomAgent}
          editAgent={editingAgent}
        />
      </div>
    );
  }

  // Execution view
  if (view === 'execution' && selectedAgent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            handleBackToHome();
          }}
          onSettingsClick={handleOpenSettings}
        />
        <div className="p-4">
          <ExecutionView
            agent={selectedAgent}
            apiKey={apiKey}
            onBack={handleBackToDetail}
            onSaveHistory={handleSaveHistory}
            initialInput={initialInput}
          />
        </div>
      </div>
    );
  }

  // Main view with tabs
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSettingsClick={handleOpenSettings}
      />

      <div className="p-4">
        {activeTab === 'agents' ? (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">Select an AI agent to get started</p>
              <SortOptions
                value={preferences.sortPreference}
                onChange={handleSortPreferenceChange}
              />
            </div>

            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              agentCounts={agentCounts}
            />

            <SortableAgentGrid
              agents={sortedAgents}
              onSelectAgent={handleSelectAgent}
              onEditAgent={handleEditAgent}
              onDeleteAgent={handleDeleteAgent}
              pinnedAgentIds={preferences.pinnedAgentIds}
              onTogglePin={handleTogglePin}
              onReorder={handleReorder}
              isManualSort={preferences.sortPreference === 'manual'}
              onCreateAgent={() => {
                setEditingAgent(null);
                setShowCreateModal(true);
              }}
            />
          </div>
        ) : (
          <HistoryView
            history={history}
            onRerun={handleRerun}
            onClearHistory={handleClearHistory}
          />
        )}
      </div>

      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAgent(null);
        }}
        onSave={handleSaveCustomAgent}
        editAgent={editingAgent}
      />
    </div>
  );
}

export default App;
