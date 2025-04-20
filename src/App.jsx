import { useState } from 'react'
import './App.css'

function App() {
  const [inputText, setInputText] = useState('')
  const [remixedText, setRemixedText] = useState('')

  const handleRemix = async () => {
    // For now, we'll just reverse the text as a placeholder
    // Later we'll integrate with the Claude API
    setRemixedText(inputText.split('').reverse().join(''))
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
            />
          </div>

          <button
            onClick={handleRemix}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Remix Text
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