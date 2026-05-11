import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      await api.post('/auth/register', {
        email,
        password,
        display_name: displayName,
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="auth-container">
      <h1>Rewatch</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Create Account</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        <p>Have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  )
}
