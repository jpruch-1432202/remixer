import { useState } from 'react'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [remixedText, setRemixedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleRemix = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to remix')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        throw new Error('Failed to remix text')
      }

      const data = await response.json()
      setRemixedText(data.remixedText)
    } catch (err) {
      setError('Failed to remix text. Please try again.')
      console.error('Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Content Remixer</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Input Text
            </label>
            <textarea
              className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="6"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here..."
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleRemix}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg transition-colors ${
              isLoading 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isLoading ? 'Remixing...' : 'Remix Text'}
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remixed Output
            </label>
            <div className="w-full p-3 border rounded-lg bg-white min-h-[150px]">
              {remixedText || 'Your remixed text will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 