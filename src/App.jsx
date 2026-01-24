import { useState, useEffect } from 'react';
import { Settings } from './components/Settings';
import { AgentCard, CreateAgentCard } from './components/AgentCard';
import { ExecutionView } from './components/ExecutionView';
import { Navigation } from './components/Navigation';
import { CreateAgentModal } from './components/CreateAgentModal';
import { HistoryView } from './components/HistoryView';
import { agents as builtInAgents } from './config/agents';

const API_KEY_STORAGE_KEY = 'agent-hub-api-key';
const CUSTOM_AGENTS_KEY = 'agent-hub-custom-agents';
const HISTORY_KEY = 'agent-hub-history';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [view, setView] = useState('loading');
  const [activeTab, setActiveTab] = useState('agents');
  const [customAgents, setCustomAgents] = useState([]);
  const [history, setHistory] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [initialInput, setInitialInput] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    const storedCustomAgents = localStorage.getItem(CUSTOM_AGENTS_KEY);
    const storedHistory = localStorage.getItem(HISTORY_KEY);

    if (storedKey) {
      setApiKey(storedKey);
      setView('home');
    } else {
      setView('settings');
    }

    if (storedCustomAgents) {
      setCustomAgents(JSON.parse(storedCustomAgents));
    }

    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Save custom agents to localStorage
  useEffect(() => {
    localStorage.setItem(CUSTOM_AGENTS_KEY, JSON.stringify(customAgents));
  }, [customAgents]);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const allAgents = [...builtInAgents, ...customAgents];

  const handleSaveApiKey = (key) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKey(key);
    setView('home');
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    setInitialInput('');
    setView('execution');
  };

  const handleBackToHome = () => {
    setSelectedAgent(null);
    setInitialInput('');
    setView('home');
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
            onBack={handleBackToHome}
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
            <div className="mb-6">
              <p className="text-gray-600">Select an AI agent to get started</p>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {allAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onClick={() => handleSelectAgent(agent)}
                  onEdit={handleEditAgent}
                  onDelete={handleDeleteAgent}
                />
              ))}
              <CreateAgentCard onClick={() => {
                setEditingAgent(null);
                setShowCreateModal(true);
              }} />
            </div>
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
