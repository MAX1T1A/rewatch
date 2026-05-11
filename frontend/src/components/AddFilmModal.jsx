import { useState, useEffect, useRef } from 'react'
import api from '../api/client'

export default function AddFilmModal({ onClose, onAdded }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get(`/tmdb/search?q=${encodeURIComponent(query)}`)
        setResults(res.data)
      } catch {
        setError('Search failed')
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  async function addFilm(item) {
    try {
      const res = await api.post('/films', {
        tmdb_id: item.tmdb_id,
        title: item.title,
        type: item.type,
        year: item.year ?? null,
        poster_url: item.poster_url ?? null,
      })
      onAdded(res.data)
    } catch (err) {
      const detail = err.response?.data?.detail
      alert(detail === 'Film already added' ? 'This film is already in the list.' : 'Failed to add film.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Film or TV Show</h2>
        <input
          autoFocus
          placeholder="Search TMDB..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && <p style={{ color: '#888', fontSize: '0.875rem' }}>Searching...</p>}
        {error && <p className="error">{error}</p>}
        <div className="tmdb-results">
          {results.map((item) => (
            <div
              key={item.tmdb_id}
              className="tmdb-result-row"
              onClick={() => addFilm(item)}
            >
              {item.poster_url && (
                <img src={item.poster_url} alt={item.title} width={40} height={60} />
              )}
              <div>
                <strong>{item.title}</strong>
                <span>
                  {' '}({item.type === 'film' ? 'Film' : 'TV'}
                  {item.year ? `, ${item.year}` : ''})
                </span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
