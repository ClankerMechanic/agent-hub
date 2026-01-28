import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CA</span>
            </div>
            <span className="font-semibold text-gray-900">Core Agents</span>
          </div>
          <Link
            to="/app"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            Beta - Looking for early testers
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The prompt library you keep meaning to build.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stop copy-pasting prompts from random docs. Save your best AI workflows,
            use any model, and get consistent results every time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-blue-600/25"
            >
              Try It Free
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-lg transition-colors"
            >
              See How It Works
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">Works with Claude, GPT-4, and Gemini</p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Sound familiar?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="font-semibold text-gray-900 mb-2">Prompts everywhere</h3>
              <p className="text-gray-600">
                Your best prompts are scattered across Notion, Google Docs, Slack messages,
                and "that one email to yourself"
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="font-semibold text-gray-900 mb-2">Copy-paste chaos</h3>
              <p className="text-gray-600">
                Every time you need to summarize a meeting or rewrite an email,
                you're hunting for that prompt you wrote 3 months ago
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="text-3xl mb-4">🎲</div>
              <h3 className="font-semibold text-gray-900 mb-2">Inconsistent results</h3>
              <p className="text-gray-600">
                You keep tweaking prompts from scratch, getting different quality
                outputs each time instead of refining what works
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            How Core Agents works
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Think of it as a library of AI assistants, each fine-tuned for a specific task.
            Pick one, paste your content, get results.
          </p>

          <div className="space-y-16">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="text-sm font-semibold text-blue-600 mb-2">Step 1</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Pick an agent</h3>
                <p className="text-gray-600">
                  Each agent has a carefully crafted prompt for a specific workflow.
                  Meeting summaries, status updates, proofreading, message rewriting -
                  choose what you need.
                </p>
              </div>
              <div className="flex-1 bg-gray-100 rounded-xl p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-2xl">📝</span>
                    <div>
                      <div className="font-medium">Meeting Summarizer</div>
                      <div className="text-sm text-gray-500">Notes → Action items</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <span className="text-2xl">📊</span>
                    <div>
                      <div className="font-medium text-blue-700">Status Update Generator</div>
                      <div className="text-sm text-blue-600">Messy notes → Polished report</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                    <span className="text-2xl">✏️</span>
                    <div>
                      <div className="font-medium">Proofreader</div>
                      <div className="text-sm text-gray-500">Fix grammar & clarity</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-8">
              <div className="flex-1">
                <div className="text-sm font-semibold text-blue-600 mb-2">Step 2</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Choose your model</h3>
                <p className="text-gray-600">
                  Use Claude for nuanced writing, GPT-4 for coding help, or Gemini for speed.
                  Same prompt, any model. Bring your own API keys.
                </p>
              </div>
              <div className="flex-1 bg-gray-100 rounded-xl p-6">
                <div className="flex items-center gap-4 justify-center">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-3xl mb-2">🟤</div>
                    <div className="font-medium">Claude</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-3xl mb-2">🟢</div>
                    <div className="font-medium">GPT-4</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <div className="text-3xl mb-2">🔵</div>
                    <div className="font-medium">Gemini</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="text-sm font-semibold text-blue-600 mb-2">Step 3</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Get consistent results</h3>
                <p className="text-gray-600">
                  Same high-quality output every time. No more "let me try rephrasing this prompt."
                  When you find what works, it stays working.
                </p>
              </div>
              <div className="flex-1 bg-gray-100 rounded-xl p-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">Output</div>
                  <div className="text-gray-900">
                    <p className="font-medium mb-2">## Status Update - Week of Jan 27</p>
                    <p className="text-sm"><strong>Completed:</strong></p>
                    <p className="text-sm text-gray-600">- Shipped new auth flow</p>
                    <p className="text-sm text-gray-600">- Fixed 3 critical bugs</p>
                    <p className="text-sm mt-2"><strong>In Progress:</strong></p>
                    <p className="text-sm text-gray-600">- Landing page (80%)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Built for power users
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create custom agents</h3>
              <p className="text-gray-600">
                Build your own agents with custom prompts. Perfect for team-specific workflows.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">GitHub sync</h3>
              <p className="text-gray-600">
                Version control your prompts. See history, revert changes, share with your team.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Token tracking</h3>
              <p className="text-gray-600">
                See exactly what each conversation costs. No surprise API bills.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Export anywhere</h3>
              <p className="text-gray-600">
                Copy, download as text, markdown, or Word. Your output, your way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to organize your AI workflows?
          </h2>
          <p className="text-gray-600 mb-8">
            Join the beta and help shape the future of Core Agents.
            Free while in beta - just bring your own API keys.
          </p>
          <Link
            to="/app"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-blue-600/25"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <div>Core Agents Beta</div>
          <div>Built with Claude</div>
        </div>
      </footer>
    </div>
  )
}
