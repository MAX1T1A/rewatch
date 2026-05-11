import { useState, useEffect, useRef, useMemo } from 'react'
import api from '../api/client'
import FilmCard from '../components/FilmCard'
import AddFilmModal from '../components/AddFilmModal'

export default function Home() {
  const [films, setFilms] = useState([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [whoFilter, setWhoFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState(null) // null = all
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const filterRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      const inBtn = filterRef.current?.contains(e.target)
      const inPanel = panelRef.current?.contains(e.target)
      if (!inBtn && !inPanel) setShowFilters(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const myUserId = Number(localStorage.getItem('user_id'))

  useEffect(() => {
    api.get('/films').then((r) => setFilms(r.data))
  }, [])

  const allUsers = useMemo(() => {
    const map = new Map()
    films.forEach((f) => {
      if (f.added_by_user_id && f.added_by_display_name) {
        map.set(f.added_by_user_id, f.added_by_display_name)
      }
      f.ratings.forEach((r) => {
        if (!map.has(r.user_id)) map.set(r.user_id, r.display_name)
      })
    })
    return map
  }, [films])

  function toggleUser(userId) {
    setSelectedUsers((prev) => {
      const base = prev ?? new Set(allUsers.keys())
      const next = new Set(base)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next.size === allUsers.size ? null : next
    })
  }

  const filtered = films
    .filter((f) => typeFilter === 'all' || f.type === typeFilter)
    .filter((f) => {
      if (whoFilter === 'mine') return f.added_by_user_id === myUserId
      if (whoFilter === 'rated') return f.ratings.some((r) => r.user_id === myUserId)
      return true
    })
    .filter((f) => {
      if (selectedUsers === null) return true
      return selectedUsers.has(f.added_by_user_id) || f.ratings.some((r) => selectedUsers.has(r.user_id))
    })
    .filter((f) => f.title.toLowerCase().includes(search.toLowerCase()))

  function handleAdded(newFilm) {
    setFilms((prev) => [newFilm, ...prev])
    setShowModal(false)
  }

  function handleDeleted(id) {
    setFilms((prev) => prev.filter((f) => f.id !== id))
  }

  function handleRatingUpdated(filmId, updatedRating) {
    setFilms((prev) =>
      prev.map((f) => {
        if (f.id !== filmId) return f
        const others = f.ratings.filter((r) => r.user_id !== updatedRating.user_id)
        return { ...f, ratings: [...others, updatedRating] }
      })
    )
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('display_name')
    window.location.href = '/login'
  }

  return (
    <div className="home">
      <header className="home-header">
        <h1>Rewatch</h1>
        <div className="controls">
          <input
            placeholder="Search titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="filter-wrap" ref={filterRef}>
            <button
              className={`filter-btn${typeFilter !== 'all' || whoFilter !== 'all' || selectedUsers !== null ? ' filter-btn--active' : ''}`}
              onClick={() => setShowFilters((v) => !v)}
              title="Фильтры"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
            </button>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)} title="Добавить фильм">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
        <button className="logout-btn" onClick={logout} title="Выйти">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </header>

      {showFilters && (
        <div className="filter-panel" ref={panelRef}>
          <div className="filter-section">
            <span className="filter-section-title">Тип</span>
            <div className="filter-btn-group">
              {[['all','Все'],['film','Фильмы'],['tv','Сериалы']].map(([val, label]) => (
                <button
                  key={val}
                  className={`filter-option${typeFilter === val ? ' filter-option--active' : ''}`}
                  onClick={() => setTypeFilter(val)}
                >{label}</button>
              ))}
            </div>
          </div>
          <div className="filter-section">
            <span className="filter-section-title">Автор</span>
            <div className="filter-btn-group">
              {[['all','Все'],['mine','Мои'],['rated','Я оценил']].map(([val, label]) => (
                <button
                  key={val}
                  className={`filter-option${whoFilter === val ? ' filter-option--active' : ''}`}
                  onClick={() => setWhoFilter(val)}
                >{label}</button>
              ))}
            </div>
          </div>
          {allUsers.size > 0 && (
            <div className="filter-section">
              <span className="filter-section-title">Пользователи</span>
              <div className="user-list">
                {[...allUsers.entries()].map(([uid, name]) => (
                  <label key={uid} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedUsers === null || selectedUsers.has(uid)}
                      onChange={() => toggleUser(uid)}
                    />
                    {name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="film-grid">
        {filtered.map((film) => (
          <FilmCard
            key={film.id}
            film={film}
            onDeleted={handleDeleted}
            onRatingUpdated={handleRatingUpdated}
          />
        ))}
      </div>

      {showModal && (
        <AddFilmModal onClose={() => setShowModal(false)} onAdded={handleAdded} />
      )}
    </div>
  )
}
