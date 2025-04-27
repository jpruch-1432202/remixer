import { useState } from 'react'

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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Content Remixer</h1>
          <p className="text-gray-600">Transform your text into something creative and engaging</p>
        </div>
        
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Input Text
            </label>
            <textarea
              className="w-full p-4 border border-gray-200 rounded-lg shadow-sm 
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       transition-all duration-200 min-h-[150px]
                       placeholder:text-gray-400"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your text here..."
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleRemix}
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-lg text-white font-medium
                     transition-all duration-200 transform hover:scale-[1.02]
                     ${isLoading 
                       ? 'bg-green-400 cursor-not-allowed' 
                       : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
                     }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Remixing...
              </span>
            ) : 'Remix Text'}
          </button>

          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Remixed Output
            </label>
            <div className={`w-full p-4 rounded-lg min-h-[150px] border border-gray-200
                          ${remixedText ? 'bg-white' : 'bg-gray-50'} whitespace-pre-wrap`}>
              {remixedText || (
                <span className="text-gray-500 italic">
                  Your remixed text will appear here...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 