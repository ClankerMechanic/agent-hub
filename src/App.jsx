import { useState, useEffect, useMemo } from 'react';
import { Settings } from './components/Settings';
import { CreateAgentModal } from './components/CreateAgentModal';
import { AppLayout } from './components/layout/AppLayout';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { MainContent } from './components/layout/MainContent';
import { executeAgent } from './services/claudeApi';
import { agents as builtInAgents } from './config/agents';

const API_KEY_STORAGE_KEY = 'agent-hub-api-key';
const CUSTOM_AGENTS_KEY = 'agent-hub-custom-agents';
const CHAT_SESSIONS_KEY = 'agent-hub-sessions';
const MODEL_KEY = 'agent-hub-model';

function App() {
  // Core state
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE_KEY) || '');
  const [showSettings, setShowSettings] = useState(() => !localStorage.getItem(API_KEY_STORAGE_KEY));

  // Agent state
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [customAgents, setCustomAgents] = useState(() => {
    const stored = localStorage.getItem(CUSTOM_AGENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Chat state
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatSessions, setChatSessions] = useState(() => {
    const stored = localStorage.getItem(CHAT_SESSIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  });
  const [currentMessages, setCurrentMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // UI state
  const [selectedModel, setSelectedModel] = useState(() =>
    localStorage.getItem(MODEL_KEY) || 'claude-sonnet-4-20250514'
  );
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  // Combine built-in and custom agents
  const allAgents = useMemo(() => [...builtInAgents, ...customAgents], [customAgents]);

  // Get selected agent object
  const selectedAgent = useMemo(() =>
    allAgents.find(a => a.id === selectedAgentId) || null,
    [allAgents, selectedAgentId]
  );

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(CUSTOM_AGENTS_KEY, JSON.stringify(customAgents));
  }, [customAgents]);

  useEffect(() => {
    localStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem(MODEL_KEY, selectedModel);
  }, [selectedModel]);

  // Load messages when chat session changes
  useEffect(() => {
    if (activeChatId && chatSessions[activeChatId]) {
      setCurrentMessages(chatSessions[activeChatId].messages || []);
    } else {
      setCurrentMessages([]);
    }
  }, [activeChatId, chatSessions]);

  // Handlers
  const handleSaveApiKey = (key) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKey(key);
    setShowSettings(false);
  };

  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId);
    setActiveChatId(null);
    setCurrentMessages([]);
    setPromptExpanded(false);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setCurrentMessages([]);
  };

  const handleSelectChat = (chatId) => {
    const session = chatSessions[chatId];
    if (session) {
      setActiveChatId(chatId);
      setSelectedAgentId(session.agentId);
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedAgent || !content.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };

    // Add user message to current messages
    const newMessages = [...currentMessages, userMessage];
    setCurrentMessages(newMessages);
    setIsLoading(true);

    try {
      // Call API
      const result = await executeAgent(selectedAgent.systemPrompt, content, apiKey, selectedModel);

      if (result.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.content,
          timestamp: Date.now()
        };

        const updatedMessages = [...newMessages, assistantMessage];
        setCurrentMessages(updatedMessages);

        // Create or update chat session
        const chatId = activeChatId || `chat-${Date.now()}`;
        setChatSessions(prev => ({
          ...prev,
          [chatId]: {
            id: chatId,
            agentId: selectedAgentId,
            createdAt: prev[chatId]?.createdAt || Date.now(),
            messages: updatedMessages
          }
        }));

        if (!activeChatId) {
          setActiveChatId(chatId);
        }
      } else {
        // Show error as assistant message
        const errorMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `Error: ${result.error}`,
          timestamp: Date.now()
        };
        setCurrentMessages([...newMessages, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: Date.now()
      };
      setCurrentMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCustomAgent = (agent) => {
    if (editingAgent) {
      setCustomAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
    } else {
      setCustomAgents(prev => [...prev, agent]);
    }
    setEditingAgent(null);
    setShowCreateModal(false);
  };

  const handleUpdatePrompt = (newPrompt) => {
    if (!selectedAgent?.isCustom) return;
    setCustomAgents(prev =>
      prev.map(a => a.id === selectedAgentId ? { ...a, systemPrompt: newPrompt } : a)
    );
  };

  // Show settings if no API key
  if (showSettings) {
    return <Settings onSave={handleSaveApiKey} initialApiKey={apiKey} />;
  }

  return (
    <>
      <AppLayout
        leftSidebar={
          <LeftSidebar
            onNewChat={handleNewChat}
            onSettingsClick={() => setShowSettings(true)}
            chatSessions={chatSessions}
            selectedAgentId={selectedAgentId}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            agents={allAgents}
          />
        }
        mainContent={
          <MainContent
            agent={selectedAgent}
            messages={currentMessages}
            isLoading={isLoading}
            promptExpanded={promptExpanded}
            onTogglePrompt={() => setPromptExpanded(!promptExpanded)}
            onSendMessage={handleSendMessage}
            onUpdatePrompt={handleUpdatePrompt}
          />
        }
        rightSidebar={
          <RightSidebar
            agents={allAgents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgent}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onCreateAgent={() => {
              setEditingAgent(null);
              setShowCreateModal(true);
            }}
          />
        }
      />

      <CreateAgentModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingAgent(null);
        }}
        onSave={handleSaveCustomAgent}
        editAgent={editingAgent}
      />
    </>
  );
}

export default App;
