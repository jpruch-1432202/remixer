import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [inputText, setInputText] = useState('')
  const [remixedText, setRemixedText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedTweets, setSavedTweets] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTweet, setEditedTweet] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [remixedTweets, setRemixedTweets] = useState([]);

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

  useEffect(() => {
    if (remixedText) {
      setRemixedTweets(remixedText.split('---TWEET_SEPARATOR---').map(t => t.trim()));
    } else {
      setRemixedTweets([]);
    }
  }, [remixedText]);

  // Save a tweet to Supabase
  const handleSaveTweet = async (tweet) => {
    const { error } = await supabase
      .from('saved_tweets')
      .insert([{ text: tweet.trim() }])
    if (!error) {
      fetchSavedTweets();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  }

  // Delete a tweet from Supabase
  const handleDeleteTweet = async (id) => {
    const { error } = await supabase
      .from('saved_tweets')
      .delete()
      .eq('id', id)
    if (!error) fetchSavedTweets()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-8 flex">
      {/* Success banner */}
      {saveSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg z-50 transition-all">
          Tweet saved!
        </div>
      )}
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
              {remixedTweets.length > 0 ? (
                remixedTweets.map((tweet, index) => (
                  <div 
                    key={index}
                    className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2"
                  >
                    {editingIndex === index ? (
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded"
                        value={editedTweet}
                        onChange={e => setEditedTweet(e.target.value)}
                      />
                    ) : (
                      <p className="text-gray-800 whitespace-pre-wrap">{tweet}</p>
                    )}
                    <div className="flex gap-2 justify-end">
                      {/* Tweet button: blue bird on white background */}
                      <button
                        className="p-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition text-sm relative group flex items-center justify-center"
                        onClick={() => {
                          const tweetText = encodeURIComponent((editingIndex === index ? editedTweet : tweet).trim());
                          window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
                        }}
                      >
                        {/* Minimal Twitter bird SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path d="M22.46 5.924c-.793.352-1.646.59-2.542.698a4.48 4.48 0 0 0 1.963-2.475 8.94 8.94 0 0 1-2.828 1.082A4.48 4.48 0 0 0 16.11 4c-2.485 0-4.5 2.014-4.5 4.5 0 .353.04.697.116 1.027C7.728 9.37 4.1 7.575 1.67 4.95a4.48 4.48 0 0 0-.61 2.263c0 1.563.796 2.942 2.008 3.75a4.48 4.48 0 0 1-2.037-.563v.057c0 2.183 1.553 4.004 3.617 4.42a4.52 4.52 0 0 1-2.03.077c.573 1.788 2.24 3.09 4.215 3.124A9.01 9.01 0 0 1 2 19.54a12.73 12.73 0 0 0 6.88 2.017c8.26 0 12.78-6.84 12.78-12.78 0-.195-.004-.39-.013-.583A9.14 9.14 0 0 0 24 4.59a8.98 8.98 0 0 1-2.54.697z" />
                        </svg>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Tweet</span>
                      </button>
                      {/* Edit/Done button: pencil or green checkmark */}
                      {editingIndex === index ? (
                        <button
                          className="p-2 bg-white text-green-600 rounded hover:bg-green-50 transition text-sm relative group flex items-center justify-center"
                          onClick={() => {
                            // Update the remixedTweets array with the edited tweet
                            const updatedTweets = [...remixedTweets];
                            updatedTweets[index] = editedTweet;
                            setRemixedTweets(updatedTweets);
                            setEditingIndex(null);
                          }}
                        >
                          {/* Green checkmark in a circle for Done */}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" fill="none" />
                            <path d="M8 12.5l2.5 2.5 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Done</span>
                        </button>
                      ) : (
                        <button
                          className="p-2 bg-white text-gray-500 rounded hover:bg-gray-100 transition text-sm relative group flex items-center justify-center"
                          onClick={() => {
                            setEditingIndex(index);
                            setEditedTweet(tweet);
                          }}
                        >
                          {/* Minimal pencil SVG */}
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 5.487a2.25 2.25 0 1 1 3.182 3.182L7.5 21H3v-4.5l13.862-13.013z" />
                          </svg>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Edit</span>
                        </button>
                      )}
                      {/* Save button: green checkmark, no circle */}
                      <button
                        className="p-2 bg-white text-green-600 rounded hover:bg-green-50 transition text-sm relative group flex items-center justify-center"
                        onClick={() => handleSaveTweet(editingIndex === index ? editedTweet : tweet)}
                      >
                        {/* Minimal green checkmark SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Save</span>
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
              <div key={tweet.id} className="bg-gray-50 p-3 rounded border flex flex-col gap-2">
                <p className="text-gray-800 whitespace-pre-wrap">{tweet.text}</p>
                <div className="flex gap-2 justify-end">
                  {/* Tweet button: blue bird on white background */}
                  <button
                    className="p-2 bg-white text-blue-500 rounded hover:bg-blue-50 transition text-sm relative group flex items-center justify-center"
                    onClick={() => {
                      const tweetText = encodeURIComponent(tweet.text.trim());
                      window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
                    }}
                  >
                    {/* Minimal Twitter bird SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M22.46 5.924c-.793.352-1.646.59-2.542.698a4.48 4.48 0 0 0 1.963-2.475 8.94 8.94 0 0 1-2.828 1.082A4.48 4.48 0 0 0 16.11 4c-2.485 0-4.5 2.014-4.5 4.5 0 .353.04.697.116 1.027C7.728 9.37 4.1 7.575 1.67 4.95a4.48 4.48 0 0 0-.61 2.263c0 1.563.796 2.942 2.008 3.75a4.48 4.48 0 0 1-2.037-.563v.057c0 2.183 1.553 4.004 3.617 4.42a4.52 4.52 0 0 1-2.03.077c.573 1.788 2.24 3.09 4.215 3.124A9.01 9.01 0 0 1 2 19.54a12.73 12.73 0 0 0 6.88 2.017c8.26 0 12.78-6.84 12.78-12.78 0-.195-.004-.39-.013-.583A9.14 9.14 0 0 0 24 4.59a8.98 8.98 0 0 1-2.54.697z" />
                    </svg>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Tweet</span>
                  </button>
                  {/* Delete button: minimal red X, no circle */}
                  <button
                    className="p-2 bg-white text-red-500 rounded hover:bg-red-50 transition text-sm relative group flex items-center justify-center"
                    onClick={() => handleDeleteTweet(tweet.id)}
                  >
                    {/* Minimal red X SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">Delete</span>
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">{new Date(tweet.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Button to open sidebar */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-1/2 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow-lg hover:bg-green-700 transition"
          style={{ transform: 'translateY(-50%)' }}
        >
          Saved Tweets
        </button>
      )}
    </div>
  )
}

export default App 