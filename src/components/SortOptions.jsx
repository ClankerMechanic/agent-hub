export function SortOptions({ value, onChange }) {
  const options = [
    { value: 'manual', label: 'Manual Order' },
    { value: 'mostUsed', label: 'Most Used' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'recentlyAdded', label: 'Recently Added' }
  ];

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-500">Sort:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
