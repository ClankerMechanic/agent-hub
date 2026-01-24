import { useState, useEffect } from 'react';
import { executeAgent } from '../services/claudeApi';
import { ExportMenu } from './ExportMenu';

export function ExecutionView({ agent, apiKey, onBack, onSaveHistory, initialInput = '' }) {
  const [input, setInput] = useState(initialInput);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [outputTimestamp, setOutputTimestamp] = useState(null);

  useEffect(() => {
    setInput(initialInput);
  }, [initialInput]);

  const handleExecute = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setError('');
    setOutput('');

    const result = await executeAgent(agent.systemPrompt, input, apiKey);

    setIsLoading(false);

    if (result.success) {
      const timestamp = Date.now();
      setOutput(result.content);
      setOutputTimestamp(timestamp);
      onSaveHistory?.({
        id: Date.now(),
        agentId: agent.id,
        agentName: agent.name,
        agentIcon: agent.icon,
        input: input,
        output: result.content,
        timestamp: Date.now()
      });
    } else {
      setError(result.error);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{agent.icon}</span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{agent.name}</h1>
            <p className="text-sm text-gray-600">{agent.description}</p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Input
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your text here..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
        />
        <button
          onClick={handleExecute}
          disabled={!input.trim() || isLoading}
          className="mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            'Execute'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Output Section */}
      {output && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Result
            </label>
            <ExportMenu
              content={output}
              agentName={agent.name}
              timestamp={outputTimestamp}
              onCopy={handleCopy}
              copied={copied}
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-800">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}
