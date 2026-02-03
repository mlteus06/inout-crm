import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Leads', to: '/leads' },
  { label: 'Kanban', to: '/kanban' },
  { label: 'Integrações', to: '/integrations' },
  { label: 'API Docs', to: '/api' },
  { label: 'Relatórios', to: '/reports' },
  { label: 'Time', to: '/team' },
  { label: 'Configurações', to: '/settings' },
  { label: 'Billing', to: '/billing' },
]

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="brand__dot" aria-hidden="true" />
        <div>
          <p className="brand__title">Inout CRM</p>
          <p className="brand__subtitle">Painel principal</p>
        </div>
      </div>
      <nav className="sidebar__nav" aria-label="Navegação principal">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar__link ${isActive ? 'is-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
