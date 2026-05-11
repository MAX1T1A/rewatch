import { useState } from 'react'
import api from '../api/client'

export default function FilmCard({ film, onDeleted, onRatingUpdated }) {
  const myUserId = Number(localStorage.getItem('user_id'))
  const myRating = film.ratings.find((r) => r.user_id === myUserId)
  const [editing, setEditing] = useState(false)
  const [score, setScore] = useState(myRating?.score ?? '')
  const [submitting, setSubmitting] = useState(false)

  async function submitRating() {
    const n = Number(score)
    if (!n || n < 1 || n > 10) return
    setSubmitting(true)
    try {
      const res = await api.post(`/films/${film.id}/ratings`, { score: n })
      onRatingUpdated(film.id, res.data)
      setEditing(false)
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteFilm() {
    if (!window.confirm(`Удалить "${film.title}"?`)) return
    await api.delete(`/films/${film.id}`)
    onDeleted(film.id)
  }

  return (
    <div className="film-card">
      {film.poster_url && <img src={film.poster_url} alt={film.title} loading="lazy" />}
      <div className="film-info">
        <div className="film-info-header">
          <div className="film-info-title">
            <h3>{film.title}</h3>
            <span className="film-meta">{film.type === 'film' ? 'Film' : 'TV'} · {film.year || '—'}</span>
          </div>
          <button
            className={`pencil-btn${editing ? ' pencil-btn--active' : ''}`}
            onClick={() => setEditing((e) => !e)}
            title={editing ? 'Закрыть' : 'Редактировать'}
          >
            {editing ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            )}
          </button>
        </div>

        <div className="ratings">
          {film.ratings.map((r) => (
            <div key={r.user_id} className="rating-row">
              <strong>{r.display_name}</strong> — {r.score}/10
              {r.review && <span className="review"> · {r.review}</span>}
            </div>
          ))}
          {film.ratings.length === 0 && (
            <span className="no-ratings">нет оценок</span>
          )}
        </div>

        {editing && (
          <div className="edit-panel">
            <div className="own-rating">
              <input
                type="number"
                min="1"
                max="10"
                placeholder="1–10"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                autoFocus
              />
              <button
                className="icon-btn icon-btn--confirm"
                onClick={submitRating}
                disabled={submitting}
                title="Сохранить"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </button>
            </div>
            {film.added_by_user_id === myUserId && (
              <button className="icon-btn icon-btn--delete" onClick={deleteFilm} title="Удалить фильм">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
