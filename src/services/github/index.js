// GitHub service - main exports for agent storage and versioning

export {
  validateToken,
  checkRepo,
  listAgents,
  getAgent,
  saveAgent,
  deleteAgent,
  getAgentHistory,
  getAgentAtVersion,
  ensureAgentsDirectory
} from './githubApi';

// Sync status constants
export const SYNC_STATUS = {
  IDLE: 'idle',
  SYNCING: 'syncing',
  SUCCESS: 'success',
  ERROR: 'error',
  OFFLINE: 'offline'
};

// Local storage key for GitHub config
export const GITHUB_CONFIG_KEY = 'agent-hub-github-config';

// Default GitHub config
export const DEFAULT_GITHUB_CONFIG = {
  enabled: false,
  token: '',
  owner: '',
  repo: '',
  branch: 'main',
  agentsPath: 'agents'
};

/**
 * Load GitHub config from localStorage
 */
export function loadGitHubConfig() {
  try {
    const stored = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (stored) {
      return { ...DEFAULT_GITHUB_CONFIG, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load GitHub config:', e);
  }
  return { ...DEFAULT_GITHUB_CONFIG };
}

/**
 * Save GitHub config to localStorage
 */
export function saveGitHubConfig(config) {
  try {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Failed to save GitHub config:', e);
    return false;
  }
}

/**
 * Check if GitHub sync is properly configured
 */
export function isGitHubConfigured(config) {
  return (
    config.enabled &&
    config.token &&
    config.owner &&
    config.repo
  );
}
