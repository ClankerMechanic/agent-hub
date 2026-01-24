export function CategoryTabs({ categories, activeCategory, onCategoryChange, agentCounts }) {
  const totalCount = Object.values(agentCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 min-w-max pb-2">
        <button
          onClick={() => onCategoryChange('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          All
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            activeCategory === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {totalCount}
          </span>
        </button>
        {categories.filter(cat => cat !== 'Custom' || agentCounts[cat] > 0).map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {category}
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {agentCounts[category] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
