import { useState, useEffect } from 'react'

const BETA_PASSWORD = import.meta.env.VITE_BETA_PASSWORD || 'coreagents2026'
const STORAGE_KEY = 'agent-hub-beta-access'

export default function PasswordGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if already authenticated
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'granted') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === BETA_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'granted')
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return children
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🤖</div>
          <h1 className="text-2xl font-bold text-white">Core Agents</h1>
          <p className="text-gray-400 mt-2">Beta Access Required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter beta password"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Enter
          </button>
        </form>

        <p className="text-gray-500 text-xs text-center mt-6">
          Contact the admin if you need access
        </p>
      </div>
    </div>
  )
}
