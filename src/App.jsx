import { useState, useEffect, useMemo } from 'react';
import { Settings } from './components/Settings';
import { CreateAgentModal } from './components/CreateAgentModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { ProjectView } from './components/ProjectView';
import { GitHubSettings } from './components/GitHubSettings';
import { VersionHistory } from './components/VersionHistory';
import { AppLayout } from './components/layout/AppLayout';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { RightSidebar } from './components/layout/RightSidebar';
import { MainContent } from './components/layout/MainContent';
import { LoginModal } from './components/LoginModal';
import { useAuth } from './components/Auth';
import { sendMessage } from './services/llm';
import { getModelConfig, getProviderForModel } from './config/models';
import { agents as builtInAgents } from './config/agents';
import {
  loadGitHubConfig,
  saveGitHubConfig,
  isGitHubConfigured,
  listAgents as listGitHubAgents,
  saveAgent as saveAgentToGitHub,
  SYNC_STATUS
} from './services/github';

const API_KEYS_STORAGE_KEY = 'agent-hub-api-keys';
const CUSTOM_AGENTS_KEY = 'agent-hub-custom-agents';
const CHAT_SESSIONS_KEY = 'agent-hub-sessions';
const MODEL_KEY = 'agent-hub-model';
const LLM_SETTINGS_KEY = 'agent-hub-llm-settings';
const PROJECTS_KEY = 'agent-hub-projects';
const PROJECT_PROMPTS_KEY = 'agent-hub-project-prompts';

// General chat pseudo-agent (no system prompt)
const GENERAL_CHAT_AGENT = {
  id: 'general-chat',
  name: 'General Chat',
  description: 'Chat directly with the LLM without a system prompt',
  icon: '💬',
  category: 'General',
  systemPrompt: '',
  isGeneralChat: true
};

function App() {
  // Auth state
  const { user, signOut } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

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

  // GitHub sync state
  const [githubConfig, setGithubConfig] = useState(() => loadGitHubConfig());
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [syncStatus, setSyncStatus] = useState(SYNC_STATUS.IDLE);
  const [pendingSync, setPendingSync] = useState([]); // Queue for offline changes

  // Projects state
  const [projects, setProjects] = useState(() => {
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projectPromptOverrides, setProjectPromptOverrides] = useState(() => {
    const stored = localStorage.getItem(PROJECT_PROMPTS_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  // Combine built-in and custom agents
  const allAgents = useMemo(() => [...builtInAgents, ...customAgents], [customAgents]);

  // Get selected agent object (including generic chat and prompt overrides)
  const selectedAgent = useMemo(() => {
    if (selectedAgentId === 'general-chat') return GENERAL_CHAT_AGENT;
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

  useEffect(() => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(PROJECT_PROMPTS_KEY, JSON.stringify(projectPromptOverrides));
  }, [projectPromptOverrides]);

  // Load messages when chat session changes
  useEffect(() => {
    if (activeChatId && chatSessions[activeChatId]) {
      setCurrentMessages(chatSessions[activeChatId].messages || []);
    } else {
      setCurrentMessages([]);
    }
  }, [activeChatId, chatSessions]);

  // GitHub: Sync agents from GitHub on load
  useEffect(() => {
    const syncFromGitHub = async () => {
      if (!isGitHubConfigured(githubConfig)) return;

      setSyncStatus(SYNC_STATUS.SYNCING);
      try {
        const result = await listGitHubAgents(
          githubConfig.token,
          githubConfig.owner,
          githubConfig.repo,
          githubConfig.agentsPath
        );

        if (result.success && result.agents.length > 0) {
          // Merge with local custom agents (GitHub is source of truth)
          const githubAgentIds = new Set(result.agents.map(a => a.id));
          const localOnlyAgents = customAgents.filter(a => !githubAgentIds.has(a.id));

          // Mark GitHub agents with sync metadata
          const syncedAgents = result.agents.map(a => ({
            ...a,
            isCustom: true,
            syncedFromGitHub: true,
            lastSynced: Date.now()
          }));

          setCustomAgents([...syncedAgents, ...localOnlyAgents]);
          setSyncStatus(SYNC_STATUS.SUCCESS);
        } else {
          setSyncStatus(SYNC_STATUS.SUCCESS);
        }
      } catch (error) {
        console.error('GitHub sync failed:', error);
        setSyncStatus(SYNC_STATUS.ERROR);
      }
    };

    syncFromGitHub();
  }, [githubConfig.enabled, githubConfig.token, githubConfig.owner, githubConfig.repo]);

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
      setSelectedAgentId('general-chat');
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

    // Require auth to send messages
    if (!user) {
      setShowLoginModal(true)
      return
    }

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

      // Get system prompt (check for project-specific override)
      let systemPrompt = selectedAgent.systemPrompt;
      if (activeProjectId && selectedAgentId) {
        const overrideKey = `${activeProjectId}:${selectedAgentId}`;
        if (projectPromptOverrides[overrideKey]) {
          systemPrompt = projectPromptOverrides[overrideKey];
        }
      }

      // Call API
      const result = await sendMessage(
        apiMessages,
        systemPrompt,
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
              projectId: existingSession?.projectId || activeProjectId || null,
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

  const handleSaveCustomAgent = async (agent) => {
    // Save locally first
    if (editingAgent) {
      setCustomAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
    } else {
      setCustomAgents(prev => [...prev, agent]);
    }
    setEditingAgent(null);
    setShowCreateModal(false);

    // Sync to GitHub if configured
    if (isGitHubConfigured(githubConfig)) {
      try {
        setSyncStatus(SYNC_STATUS.SYNCING);
        const message = editingAgent
          ? `Update agent: ${agent.name}`
          : `Create agent: ${agent.name}`;

        await saveAgentToGitHub(
          githubConfig.token,
          githubConfig.owner,
          githubConfig.repo,
          agent,
          message,
          githubConfig.agentsPath
        );
        setSyncStatus(SYNC_STATUS.SUCCESS);
      } catch (error) {
        console.error('Failed to sync to GitHub:', error);
        setSyncStatus(SYNC_STATUS.ERROR);
        // Queue for later sync
        setPendingSync(prev => [...prev, { type: 'save', agent }]);
      }
    }
  };

  const handleGitHubConfigChange = (config) => {
    setGithubConfig(config);
    saveGitHubConfig(config);
  };

  const handleUpdatePrompt = async (newPrompt) => {
    if (selectedAgent?.isCustom) {
      // Persist changes for custom agents
      const updatedAgent = { ...selectedAgent, systemPrompt: newPrompt };
      setCustomAgents(prev =>
        prev.map(a => a.id === selectedAgentId ? updatedAgent : a)
      );

      // Sync to GitHub if configured
      if (isGitHubConfigured(githubConfig)) {
        try {
          setSyncStatus(SYNC_STATUS.SYNCING);
          await saveAgentToGitHub(
            githubConfig.token,
            githubConfig.owner,
            githubConfig.repo,
            updatedAgent,
            `Update prompt for ${updatedAgent.name}`,
            githubConfig.agentsPath
          );
          setSyncStatus(SYNC_STATUS.SUCCESS);
        } catch (error) {
          console.error('Failed to sync to GitHub:', error);
          setSyncStatus(SYNC_STATUS.ERROR);
        }
      }
    } else {
      // Fork built-in agent as a custom agent
      const forkedAgent = {
        ...selectedAgent,
        id: `${selectedAgent.id}-custom-${Date.now()}`,
        name: `${selectedAgent.name} (Custom)`,
        systemPrompt: newPrompt,
        isCustom: true,
        forkedFrom: selectedAgent.id,
        originalPrompt: selectedAgent.systemPrompt
      };

      // Add to custom agents
      setCustomAgents(prev => [...prev, forkedAgent]);

      // Switch to the forked agent
      setSelectedAgentId(forkedAgent.id);

      // Clear any prompt overrides for the original
      setPromptOverrides(prev => {
        const { [selectedAgentId]: _, ...rest } = prev;
        return rest;
      });

      // Sync to GitHub if configured
      if (isGitHubConfigured(githubConfig)) {
        try {
          setSyncStatus(SYNC_STATUS.SYNCING);
          await saveAgentToGitHub(
            githubConfig.token,
            githubConfig.owner,
            githubConfig.repo,
            forkedAgent,
            `Fork ${selectedAgent.name} as custom agent`,
            githubConfig.agentsPath
          );
          setSyncStatus(SYNC_STATUS.SUCCESS);
        } catch (error) {
          console.error('Failed to sync to GitHub:', error);
          setSyncStatus(SYNC_STATUS.ERROR);
        }
      }
    }
  };

  const handleRevertVersion = async (versionContent) => {
    if (!selectedAgent) return;

    // Create updated agent from version content
    const updatedAgent = {
      ...selectedAgent,
      ...versionContent,
      id: selectedAgent.id // Keep the same ID
    };

    setCustomAgents(prev =>
      prev.map(a => a.id === selectedAgent.id ? updatedAgent : a)
    );

    // Sync to GitHub
    if (isGitHubConfigured(githubConfig)) {
      try {
        setSyncStatus(SYNC_STATUS.SYNCING);
        await saveAgentToGitHub(
          githubConfig.token,
          githubConfig.owner,
          githubConfig.repo,
          updatedAgent,
          `Revert ${updatedAgent.name} to previous version`,
          githubConfig.agentsPath
        );
        setSyncStatus(SYNC_STATUS.SUCCESS);
      } catch (error) {
        console.error('Failed to sync revert to GitHub:', error);
        setSyncStatus(SYNC_STATUS.ERROR);
      }
    }
  };

  const handleForkVersion = (versionContent) => {
    // Create a new agent based on the old version
    const newAgent = {
      ...versionContent,
      id: `custom-${Date.now()}`,
      name: `${versionContent.name} (Fork)`,
      isCustom: true
    };

    setEditingAgent(null);
    setShowCreateModal(true);
    // Pre-populate the modal with the forked content
    setEditingAgent(newAgent);
  };

  // Project handlers
  const handleCreateProject = (project) => {
    setProjects(prev => [...prev, project]);
  };

  const handleSelectProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProjectId(projectId);
      setSelectedAgentId(null); // Don't select an agent yet, show project view
      setActiveChatId(null);
      setCurrentMessages([]);
    }
  };

  const handleDeleteProject = (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  };

  const handleStartProjectChat = (agentId, initialMessage, projectId) => {
    // Check auth first before changing any state
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    // Set the agent and project context
    setSelectedAgentId(agentId);
    // activeProjectId is already set, but make sure it stays set
    setActiveProjectId(projectId);
    // Send the message after state updates
    setTimeout(() => handleSendMessage(initialMessage), 0);
  };

  const handleBackFromProject = () => {
    setActiveProjectId(null);
    setSelectedAgentId(null);
    setActiveChatId(null);
    setCurrentMessages([]);
  };

  const handleAddAgentToProject = (projectId, agentId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const currentAgentIds = p.agentIds || (p.agentId ? [p.agentId] : []);
      if (currentAgentIds.includes(agentId)) return p;
      return {
        ...p,
        agentIds: [...currentAgentIds, agentId],
        updatedAt: Date.now()
      };
    }));
  };

  const handleUpdateProjectPrompt = (projectId, agentId, prompt) => {
    const key = `${projectId}:${agentId}`;
    setProjectPromptOverrides(prev => {
      if (prompt === null) {
        // Remove override
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: prompt };
    });
  };

  // Get active project
  const activeProject = activeProjectId ? projects.find(p => p.id === activeProjectId) : null;

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
        user={user}
        onSignOut={signOut}
        onSignIn={() => setShowLoginModal(true)}
        leftSidebar={
          <LeftSidebar
            onNewChat={handleNewChat}
            onSettingsClick={() => setShowSettings(true)}
            chatSessions={chatSessions}
            selectedAgentId={selectedAgentId}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            agents={allAgents}
            onGitHubClick={() => setShowGitHubSettings(true)}
            githubEnabled={isGitHubConfigured(githubConfig)}
            syncStatus={syncStatus}
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={handleSelectProject}
            onCreateProject={() => setShowCreateProject(true)}
            onDeleteProject={handleDeleteProject}
          />
        }
        mainContent={
          activeProject && !selectedAgent ? (
            <ProjectView
              project={activeProject}
              agents={[GENERAL_CHAT_AGENT, ...allAgents]}
              allAgents={allAgents}
              chatSessions={chatSessions}
              onStartChat={handleStartProjectChat}
              onSelectChat={handleSelectChat}
              onBack={handleBackFromProject}
              onAddAgentToProject={handleAddAgentToProject}
              onUpdateProjectPrompt={handleUpdateProjectPrompt}
              projectPromptOverrides={projectPromptOverrides}
            />
          ) : (
            <MainContent
              agent={selectedAgent}
              messages={currentMessages}
              isLoading={isLoading}
              promptExpanded={promptExpanded}
              onTogglePrompt={() => setPromptExpanded(!promptExpanded)}
              onSendMessage={handleSendMessage}
              onUpdatePrompt={handleUpdatePrompt}
              onStartGeneralChat={(initialMessage) => {
                setSelectedAgentId('general-chat');
                // If there's an initial message, send it after switching
                if (initialMessage) {
                  setTimeout(() => handleSendMessage(initialMessage), 0);
                }
              }}
              sessionUsage={activeChatId ? chatSessions[activeChatId]?.totalUsage : null}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              apiKeys={apiKeys}
              githubEnabled={isGitHubConfigured(githubConfig)}
              onShowVersionHistory={() => setShowVersionHistory(true)}
              onClose={() => {
                setSelectedAgentId(null);
                setActiveChatId(null);
                setCurrentMessages([]);
                setActiveProjectId(null);
              }}
              activeProject={activeProject}
            />
          )
        }
        rightSidebar={
          <RightSidebar
            agents={allAgents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={handleSelectAgent}
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
        apiKeys={apiKeys}
        selectedModel={selectedModel}
      />

      <GitHubSettings
        config={githubConfig}
        onConfigChange={handleGitHubConfigChange}
        onClose={() => setShowGitHubSettings(false)}
        isOpen={showGitHubSettings}
      />

      <VersionHistory
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        agent={selectedAgent}
        githubConfig={githubConfig}
        onRevert={handleRevertVersion}
        onFork={handleForkVersion}
      />

      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onSave={handleCreateProject}
        agents={allAgents}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}

export default App;
