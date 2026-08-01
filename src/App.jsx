import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'

export default function App() {
  const [search, setSearch] = useState('')

  return (
    <div className="app">
      <Navbar search={search} onSearchChange={setSearch} />
      <main className="app__content">
        <Outlet context={{ search }} />
      </main>
      <footer className="app__footer">
        <p>SmartBuy — Stage 1 demo. Mock data, stored locally in your browser.</p>
      </footer>
    </div>
  )
}
