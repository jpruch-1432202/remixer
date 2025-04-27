import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [inputText, setInputText] = useState('')
  const [remixedText, setRemixedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedTweets, setSavedTweets] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  // Fetch saved tweets from Supabase
  const fetchSavedTweets = async () => {
    const { data, error } = await supabase
      .from('saved_tweets')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setSavedTweets(data)
  }

  useEffect(() => {
    fetchSavedTweets()
  }, [])

  // Save a tweet to Supabase
  const handleSaveTweet = async (tweet) => {
    const { error } = await supabase
      .from('saved_tweets')
      .insert([{ text: tweet.trim() }])
    if (!error) fetchSavedTweets()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-8 flex">
      <div className="max-w-3xl mx-auto flex-1">
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
            <div className="space-y-4">
              {remixedText ? (
                remixedText.split('---TWEET_SEPARATOR---').map((tweet, index) => (
                  <div 
                    key={index}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2"
                  >
                    <p className="text-gray-800 whitespace-pre-wrap">{tweet.trim()}</p>
                    <div className="flex gap-2 justify-end">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        onClick={() => {
                          const tweetText = encodeURIComponent(tweet.trim());
                          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
                        }}
                      >
                        Tweet
                      </button>
                      <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        onClick={() => handleSaveTweet(tweet)}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="text-gray-500 italic">
                    Your remixed text will appear here...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar for saved tweets */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg border-l border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 z-50`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Saved Tweets</h2>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-800">&times;</button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-56px)] p-4 space-y-4">
          {savedTweets.length === 0 ? (
            <div className="text-gray-500 italic">No saved tweets yet.</div>
          ) : (
            savedTweets.map(tweet => (
              <div key={tweet.id} className="bg-gray-50 p-3 rounded border">
                <p className="text-gray-800 whitespace-pre-wrap">{tweet.text}</p>
                <div className="text-xs text-gray-400 mt-1">{new Date(tweet.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Button to open sidebar */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-1/2 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg hover:bg-green-700 transition"
        style={{ transform: 'translateY(-50%)' }}
      >
        Saved Tweets
      </button>
    </div>
  )
}

export default App 