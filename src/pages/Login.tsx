import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Card } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch {
      setError('Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-rn-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-rn-800 tracking-tight">RedNorte</div>
          <p className="text-sm text-rn-500 mt-1">Sistema de Gestión Hospitalaria</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-base font-semibold text-rn-800 text-center">Iniciar sesión</h2>

            <Input
              label="Usuario"
              placeholder="admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-rn-danger text-center">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center">
              Ingresar
            </Button>
          </form>
        </Card>

        <div className="mt-6 p-4 bg-white border border-rn-200 rounded-xl text-xs text-rn-500 space-y-1">
          <p className="font-semibold text-rn-700 mb-1">Usuarios de prueba:</p>
          <p><strong>Admin:</strong> admin / admin123</p>
          <p><strong>Doctor:</strong> alejandro.molina / doctor123</p>
          <p><strong>Paciente:</strong> 21611190-7 / paciente123</p>
        </div>

        <p className="text-center text-xs text-rn-500 mt-4">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-rn-accent hover:underline font-semibold">Registrate como paciente</Link>
        </p>
      </div>
    </div>
  )
}
