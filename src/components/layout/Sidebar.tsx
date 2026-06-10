import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { useAuth } from '../../context/AuthContext'

const ALL_NAV = [
  { to: '/',             icon: '▤',  label: 'Inicio',           roles: ['ADMIN','DOCTOR','PACIENTE'] as const },
  { to: '/dashboard',    icon: '📊', label: 'Dashboard',         roles: ['ADMIN'] as const },
  { to: '/pacientes',    icon: '👤', label: 'Pacientes',         roles: ['ADMIN','DOCTOR'] as const },
  { to: '/doctores',     icon: '🩺', label: 'Doctores',          roles: ['ADMIN','DOCTOR'] as const },
  { to: '/agenda',       icon: '📅', label: 'Agenda',            roles: ['ADMIN','DOCTOR','PACIENTE'] as const },
  { to: '/lista-espera', icon: '⏳', label: 'Lista de Espera',   roles: ['ADMIN','DOCTOR'] as const },
  { to: '/fichas',       icon: '📋', label: 'Fichas Clínicas',   roles: ['ADMIN','DOCTOR'] as const },
]

export function Sidebar() {
  const { rol, username, logout } = useAuth()
  const navigate = useNavigate()

  const nav = ALL_NAV.filter(item => rol && (item.roles as readonly string[]).includes(rol))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-rn-sidebar border-r border-rn-700/20 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="text-[10px] font-bold text-rn-accent-light tracking-[0.2em] uppercase mb-1">
          Servicio de Salud
        </div>
        <div className="text-xl font-bold text-white tracking-tight">RedNorte</div>
        <div className="text-[10px] text-rn-sidebar-text mt-0.5">Sistema de Gestión</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {nav.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-rn-sidebar-active/25 text-white'
                : 'text-rn-sidebar-text hover:text-white hover:bg-rn-sidebar-hover'
            )}
          >
            <span className="text-base w-5 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rn-success animate-pulse" />
            <span className="text-[10px] text-rn-sidebar-text opacity-50">● BFF activo</span>
          </div>
        </div>
        {username && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-rn-accent-light truncate max-w-[150px]">
              {username}
              <span className="text-rn-sidebar-text ml-1">({rol})</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-[10px] text-rn-sidebar-text hover:text-rn-danger transition-colors"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
