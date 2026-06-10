import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Sidebar } from './components/layout/Sidebar'

import Dashboard     from './pages/Dashboard'
import Pacientes     from './pages/Pacientes'
import Doctores      from './pages/Doctores'
import Agenda        from './pages/Agenda'
import ListaEspera   from './pages/ListaEspera'
import FichasClinicas from './pages/FichasClinicas'
import Login         from './pages/Login'
import Home          from './pages/Home'
import Register      from './pages/Register'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-rn-50 font-display">
      <Sidebar />
      <main className="ml-56 flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/pacientes"    element={<Pacientes />} />
          <Route path="/doctores"     element={<Doctores />} />
          <Route path="/agenda"       element={<Agenda />} />
          <Route path="/lista-espera" element={<ListaEspera />} />
          <Route path="/fichas"       element={<FichasClinicas />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
