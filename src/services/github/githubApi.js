// GitHub REST API wrapper for agent storage and versioning

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Make authenticated request to GitHub API
 */
async function githubFetch(endpoint, token, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Validate GitHub token by fetching user info
 */
export async function validateToken(token) {
  try {
    const user = await githubFetch('/user', token);
    return { valid: true, user: user.login };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Check if repo exists and is accessible
 */
export async function checkRepo(token, owner, repo) {
  try {
    const repoData = await githubFetch(`/repos/${owner}/${repo}`, token);
    return {
      exists: true,
      permissions: repoData.permissions,
      defaultBranch: repoData.default_branch
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

/**
 * List all agent files in the repo
 */
export async function listAgents(token, owner, repo, path = 'agents') {
  try {
    const contents = await githubFetch(`/repos/${owner}/${repo}/contents/${path}`, token);

    // Filter for JSON files only
    const agents = contents
      .filter(file => file.type === 'file' && file.name.endsWith('.json'))
      .map(file => ({
        id: file.name.replace('.json', ''),
        name: file.name,
        path: file.path,
        sha: file.sha,
        url: file.html_url
      }));

    return { success: true, agents };
  } catch (error) {
    // If directory doesn't exist, return empty list
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return { success: true, agents: [] };
    }
    return { success: false, error: error.message };
  }
}

/**
 * Get a single agent file content
 */
export async function getAgent(token, owner, repo, agentId, path = 'agents') {
  try {
    const filePath = `${path}/${agentId}.json`;
    const file = await githubFetch(`/repos/${owner}/${repo}/contents/${filePath}`, token);

    // Decode base64 content
    const content = JSON.parse(atob(file.content));

    return {
      success: true,
      agent: content,
      sha: file.sha,
      url: file.html_url
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Save/update an agent file (creates commit)
 */
export async function saveAgent(token, owner, repo, agent, message, path = 'agents') {
  try {
    const filePath = `${path}/${agent.id}.json`;

    // Check if file exists to get its SHA (needed for updates)
    let existingSha = null;
    try {
      const existing = await githubFetch(`/repos/${owner}/${repo}/contents/${filePath}`, token);
      existingSha = existing.sha;
    } catch {
      // File doesn't exist, that's fine for new agents
    }

    // Prepare content (exclude isCustom flag for storage)
    const { isCustom, ...agentData } = agent;
    const content = btoa(JSON.stringify(agentData, null, 2));

    const body = {
      message: message || `Update ${agent.name}`,
      content
      // Don't specify branch - GitHub uses default, works with empty repos
    };

    if (existingSha) {
      body.sha = existingSha;
    }

    const result = await githubFetch(
      `/repos/${owner}/${repo}/contents/${filePath}`,
      token,
      { method: 'PUT', body: JSON.stringify(body) }
    );

    return {
      success: true,
      sha: result.content.sha,
      commitSha: result.commit.sha,
      commitUrl: result.commit.html_url
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete an agent file
 */
export async function deleteAgent(token, owner, repo, agentId, path = 'agents') {
  try {
    const filePath = `${path}/${agentId}.json`;

    // Get current SHA
    const existing = await githubFetch(`/repos/${owner}/${repo}/contents/${filePath}`, token);

    await githubFetch(
      `/repos/${owner}/${repo}/contents/${filePath}`,
      token,
      {
        method: 'DELETE',
        body: JSON.stringify({
          message: `Delete agent ${agentId}`,
          sha: existing.sha
        })
      }
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get commit history for an agent file
 */
export async function getAgentHistory(token, owner, repo, agentId, path = 'agents', limit = 20) {
  try {
    const filePath = `${path}/${agentId}.json`;
    const commits = await githubFetch(
      `/repos/${owner}/${repo}/commits?path=${filePath}&per_page=${limit}`,
      token
    );

    const history = commits.map(commit => ({
      sha: commit.sha,
      shortSha: commit.sha.substring(0, 7),
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url
    }));

    return { success: true, history };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get agent content at a specific version (commit)
 */
export async function getAgentAtVersion(token, owner, repo, agentId, commitSha, path = 'agents') {
  try {
    const filePath = `${path}/${agentId}.json`;

    // Get the file content at that specific commit
    const file = await githubFetch(
      `/repos/${owner}/${repo}/contents/${filePath}?ref=${commitSha}`,
      token
    );

    const content = JSON.parse(atob(file.content));

    return { success: true, agent: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Ensure the agents directory exists (create with README if not)
 */
export async function ensureAgentsDirectory(token, owner, repo, path = 'agents') {
  try {
    await githubFetch(`/repos/${owner}/${repo}/contents/${path}`, token);
    return { success: true, created: false };
  } catch (error) {
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      // Create directory with a README
      const readme = `# Agent Hub Prompts\n\nThis directory contains agent prompts managed by Agent Hub.\n`;

      await githubFetch(
        `/repos/${owner}/${repo}/contents/${path}/README.md`,
        token,
        {
          method: 'PUT',
          body: JSON.stringify({
            message: 'Initialize agents directory',
            content: btoa(readme)
            // Don't specify branch - GitHub creates default branch for empty repos
          })
        }
      );

      return { success: true, created: true };
    }
    return { success: false, error: error.message };
  }
}
