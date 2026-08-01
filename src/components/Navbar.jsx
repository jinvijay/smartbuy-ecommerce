import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useSession, signOut } from '../lib/authClient'

export default function Navbar({ search, onSearchChange }) {
  const { totalCount } = useCart()
  const { data: session } = useSession()
  const navigate = useNavigate()
  const [localSearch, setLocalSearch] = useState(search ?? '')

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  function handleSubmit(e) {
    e.preventDefault()
    navigate('/')
    onSearchChange?.(localSearch)
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          🛍️ SmartBuy
        </Link>
        <form className="navbar__search" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search products..."
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value)
              onSearchChange?.(e.target.value)
            }}
          />
        </form>
        <Link to="/cart" className="navbar__cart">
          🛒 Cart
          {totalCount > 0 && <span className="navbar__cart-badge">{totalCount}</span>}
        </Link>
        {session ? (
          <div className="navbar__account">
            <span className="navbar__account-name">{session.user.name}</span>
            <button className="btn btn--link" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn--secondary navbar__signin">
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
