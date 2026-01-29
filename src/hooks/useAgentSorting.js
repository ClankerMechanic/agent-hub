import { useMemo } from 'react';

export function useAgentSorting(agents, preferences, history) {
  return useMemo(() => {
    const { pinnedAgentIds = [], agentOrder = {}, sortPreference = 'manual' } = preferences;

    // Calculate usage stats from history
    const usageStats = history.reduce((stats, item) => {
      if (!stats[item.agentId]) {
        stats[item.agentId] = { count: 0, lastUsed: 0 };
      }
      stats[item.agentId].count++;
      stats[item.agentId].lastUsed = Math.max(stats[item.agentId].lastUsed, item.timestamp);
      return stats;
    }, {});

    // Separate pinned and unpinned
    const pinned = agents.filter(a => pinnedAgentIds.includes(a.id));
    const unpinned = agents.filter(a => !pinnedAgentIds.includes(a.id));

    // Sort unpinned based on preference
    const sortedUnpinned = [...unpinned].sort((a, b) => {
      switch (sortPreference) {
        case 'mostUsed': {
          const aCount = usageStats[a.id]?.count || 0;
          const bCount = usageStats[b.id]?.count || 0;
          return bCount - aCount;
        }
        case 'alphabetical': {
          return a.name.localeCompare(b.name);
        }
        case 'recentlyAdded': {
          // Custom agents have timestamp in their ID
          const aTime = a.isCustom ? parseInt(a.id.replace('custom-', '')) : 0;
          const bTime = b.isCustom ? parseInt(b.id.replace('custom-', '')) : 0;
          return bTime - aTime;
        }
        case 'manual':
        default: {
          // Use agentOrder for category-based ordering
          const category = a.isCustom ? 'Custom' : a.category;
          const order = agentOrder[category] || [];
          const aIndex = order.indexOf(a.id);
          const bIndex = order.indexOf(b.id);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        }
      }
    });

    // Sort pinned by their order in pinnedAgentIds
    const sortedPinned = [...pinned].sort((a, b) => {
      return pinnedAgentIds.indexOf(a.id) - pinnedAgentIds.indexOf(b.id);
    });

    return [...sortedPinned, ...sortedUnpinned];
  }, [agents, preferences, history]);
}

export function getUsageStats(history) {
  return history.reduce((stats, item) => {
    if (!stats[item.agentId]) {
      stats[item.agentId] = { count: 0, lastUsed: 0 };
    }
    stats[item.agentId].count++;
    stats[item.agentId].lastUsed = Math.max(stats[item.agentId].lastUsed, item.timestamp);
    return stats;
  }, {});
}
