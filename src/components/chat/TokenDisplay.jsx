// Token display badge for showing usage info on messages

export function TokenDisplay({ usage, darkMode }) {
  if (!usage) return null;

  const { inputTokens, outputTokens, cost } = usage;
  const totalTokens = (inputTokens || 0) + (outputTokens || 0);

  // Format cost
  const formattedCost = cost >= 0.01
    ? `$${cost.toFixed(2)}`
    : cost >= 0.001
      ? `$${cost.toFixed(3)}`
      : cost > 0
        ? `<$0.001`
        : '';

  return (
    <div className={`flex items-center gap-2 text-xs mt-2 pt-2 border-t ${darkMode ? 'text-gray-400 border-gray-600' : 'text-gray-400 border-gray-100'}`}>
      <span className="flex items-center gap-1">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
        </svg>
        {totalTokens.toLocaleString()} tokens
      </span>
      {formattedCost && (
        <>
          <span className={darkMode ? 'text-gray-600' : 'text-gray-300'}>·</span>
          <span>{formattedCost}</span>
        </>
      )}
    </div>
  );
}
