import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">Сканер пар</div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>Мониторинг</NavLink>
        <NavLink to="/history" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>История</NavLink>
        <NavLink to="/devices" className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>Устройства</NavLink>
      </nav>
    </aside>
  )
}
