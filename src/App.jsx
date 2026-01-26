import { useState, useEffect, useMemo } from 'react';
import { Settings } from './components/Settings';
import { CreateAgentModal } from './components/CreateAgentModal';
import { AppLayout } from './components/layout/AppLayout';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { MainContent } from './components/layout/MainContent';
import { sendMessage } from './services/llm';
import { getModelConfig, getProviderForModel } from './config/models';
import { agents as builtInAgents } from './config/agents';

const API_KEYS_STORAGE_KEY = 'agent-hub-api-keys';
const CUSTOM_AGENTS_KEY = 'agent-hub-custom-agents';
const CHAT_SESSIONS_KEY = 'agent-hub-sessions';
const MODEL_KEY = 'agent-hub-model';
const LLM_SETTINGS_KEY = 'agent-hub-llm-settings';

// Generic chat pseudo-agent (no system prompt)
const GENERIC_CHAT_AGENT = {
  id: 'generic-chat',
  name: 'Generic Chat',
  description: 'Chat directly with the LLM without a system prompt',
  icon: '💬',
  category: 'General',
  systemPrompt: '',
  isGenericChat: true
};

function App() {
  // Core state - API keys for multiple providers
  const [apiKeys, setApiKeys] = useState(() => {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Migration: check for old single API key
    const oldKey = localStorage.getItem('agent-hub-api-key');
    if (oldKey) {
      return { claude: oldKey };
    }
    return {};
  });
  const [showSettings, setShowSettings] = useState(() => {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    const oldKey = localStorage.getItem('agent-hub-api-key');
    return !stored && !oldKey;
  });

  // LLM settings
  const [llmSettings, setLlmSettings] = useState(() => {
    const stored = localStorage.getItem(LLM_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {
      temperature: 0.7,
      maxTokens: 4096,
      extendedThinking: false,
      thinkingBudget: 1024
    };
  });

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
  const [promptOverrides, setPromptOverrides] = useState({}); // Temp prompt edits for built-in agents

  // Combine built-in and custom agents
  const allAgents = useMemo(() => [...builtInAgents, ...customAgents], [customAgents]);

  // Get selected agent object (including generic chat and prompt overrides)
  const selectedAgent = useMemo(() => {
    if (selectedAgentId === 'generic-chat') return GENERIC_CHAT_AGENT;
    const agent = allAgents.find(a => a.id === selectedAgentId);
    if (!agent) return null;
    // Apply prompt override if exists
    if (promptOverrides[selectedAgentId]) {
      return { ...agent, systemPrompt: promptOverrides[selectedAgentId] };
    }
    return agent;
  }, [allAgents, selectedAgentId, promptOverrides]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem(LLM_SETTINGS_KEY, JSON.stringify(llmSettings));
  }, [llmSettings]);

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
  const handleSaveApiKeys = (keys) => {
    setApiKeys(keys);
    setShowSettings(false);
  };

  const handleSelectAgent = (agentId) => {
    setSelectedAgentId(agentId);
    setActiveChatId(null);
    setCurrentMessages([]);
    setPromptExpanded(false);
  };

  const handleNewChat = () => {
    if (selectedAgentId) {
      // Keep agent, just clear chat for a new session
      setActiveChatId(null);
      setCurrentMessages([]);
    } else {
      // No agent selected - go to Generic Chat
      setSelectedAgentId('generic-chat');
      setActiveChatId(null);
      setCurrentMessages([]);
    }
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

    // Determine which model to use (agent's preferred or global)
    const modelToUse = selectedAgent.preferredModel || selectedModel;
    const modelConfig = getModelConfig(modelToUse);

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
      // Build messages for API (only user/assistant content)
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Prepare options
      const options = {
        temperature: llmSettings.temperature,
        maxTokens: llmSettings.maxTokens
      };

      // Extended thinking only for supported Claude models
      if (llmSettings.extendedThinking && modelConfig?.supportsExtendedThinking) {
        options.extendedThinking = true;
        options.thinkingBudget = llmSettings.thinkingBudget;
      }

      // Call API
      const result = await sendMessage(
        apiMessages,
        selectedAgent.systemPrompt,
        apiKeys,
        modelToUse,
        options
      );

      if (result.success) {
        // Calculate cost if we have usage data
        let cost = 0;
        if (result.usage && modelConfig) {
          const inputCost = (result.usage.inputTokens / 1_000_000) * modelConfig.inputCost;
          const outputCost = (result.usage.outputTokens / 1_000_000) * modelConfig.outputCost;
          cost = inputCost + outputCost;
        }

        const assistantMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: result.content,
          thinking: result.thinking,
          timestamp: Date.now(),
          model: modelToUse,
          usage: result.usage ? {
            ...result.usage,
            cost
          } : undefined
        };

        const updatedMessages = [...newMessages, assistantMessage];
        setCurrentMessages(updatedMessages);

        // Create or update chat session with usage tracking
        const chatId = activeChatId || `chat-${Date.now()}`;
        setChatSessions(prev => {
          const existingSession = prev[chatId];
          const existingUsage = existingSession?.totalUsage || { inputTokens: 0, outputTokens: 0, totalCost: 0 };

          return {
            ...prev,
            [chatId]: {
              id: chatId,
              agentId: selectedAgentId,
              createdAt: existingSession?.createdAt || Date.now(),
              messages: updatedMessages,
              totalUsage: result.usage ? {
                inputTokens: existingUsage.inputTokens + result.usage.inputTokens,
                outputTokens: existingUsage.outputTokens + result.usage.outputTokens,
                totalCost: existingUsage.totalCost + cost
              } : existingUsage
            }
          };
        });

        if (!activeChatId) {
          setActiveChatId(chatId);
        }
      } else {
        // Show error as assistant message
        const errorMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: `Error: ${result.error}`,
          timestamp: Date.now(),
          isError: true
        };
        setCurrentMessages([...newMessages, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: Date.now(),
        isError: true
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
    if (selectedAgent?.isCustom) {
      // Persist changes for custom agents
      setCustomAgents(prev =>
        prev.map(a => a.id === selectedAgentId ? { ...a, systemPrompt: newPrompt } : a)
      );
    } else {
      // Store temporary override for built-in agents
      setPromptOverrides(prev => ({
        ...prev,
        [selectedAgentId]: newPrompt
      }));
    }
  };

  // Show settings if no API keys configured
  if (showSettings) {
    return <Settings onSave={handleSaveApiKeys} initialApiKeys={apiKeys} />;
  }

  return (
    <>
      <AppLayout
        onHomeClick={() => {
          setSelectedAgentId(null);
          setActiveChatId(null);
          setCurrentMessages([]);
        }}
        onSettingsClick={() => setShowSettings(true)}
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
            onStartGenericChat={() => setSelectedAgentId('generic-chat')}
            sessionUsage={activeChatId ? chatSessions[activeChatId]?.totalUsage : null}
          />
        }
        rightSidebar={
          <RightSidebar
            agents={allAgents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgent}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            llmSettings={llmSettings}
            onLlmSettingsChange={setLlmSettings}
            apiKeys={apiKeys}
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
