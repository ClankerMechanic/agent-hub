export function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-blue-600 transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
