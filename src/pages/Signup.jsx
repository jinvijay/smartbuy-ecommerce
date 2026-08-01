import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signUp } from '../lib/authClient'

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error: signUpError } = await signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
    })
    setSubmitting(false)
    if (signUpError) {
      setError(signUpError.message || 'Could not create account')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="page">
      <div className="auth-form-wrapper">
        <h1>Create Account</h1>
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Creating Account…' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-form-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
