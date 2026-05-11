import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user_id', String(res.data.user_id))
      localStorage.setItem('display_name', res.data.display_name)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="auth-container">
      <h1>Rewatch</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Sign In</h2>
        {error && <p className="error">{error}</p>}
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
        <button type="submit">Login</button>
        <p>No account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  )
}
