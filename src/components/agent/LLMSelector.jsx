const MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Fast & capable' },
  { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Most powerful' },
  { id: 'claude-haiku-3-20240307', name: 'Claude Haiku 3', description: 'Quick responses' },
];

export function LLMSelector({ value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        Model
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
      >
        {MODELS.map(model => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
}
