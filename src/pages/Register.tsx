import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Card } from '../components/ui'
import { authApi } from '../api'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', password: '',
    primerNombre: '', segundoNombre: '',
    apellidoPaterno: '', apellidoMaterno: '',
    fechaNacimiento: '',
    email: '', telefono: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.register(form)
      await login(form.username, form.password)
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Error al registrar'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-rn-100 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-rn-800 tracking-tight">RedNorte</div>
          <p className="text-sm text-rn-500 mt-1">Crear cuenta de paciente</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-base font-semibold text-rn-800 text-center">Registro</h2>

            <Input label="RUT (ej: 12345678-5)" placeholder="12345678-5"
              value={form.username} onChange={e => set('username', e.target.value)} />

            <Input label="Contraseña" type="password" placeholder="••••••"
              value={form.password} onChange={e => set('password', e.target.value)} />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Primer nombre" value={form.primerNombre}
                onChange={e => set('primerNombre', e.target.value)} />
              <Input label="Segundo nombre" value={form.segundoNombre ?? ''}
                onChange={e => set('segundoNombre', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Apellido paterno" value={form.apellidoPaterno}
                onChange={e => set('apellidoPaterno', e.target.value)} />
              <Input label="Apellido materno" value={form.apellidoMaterno}
                onChange={e => set('apellidoMaterno', e.target.value)} />
            </div>

            <Input label="Fecha de nacimiento" type="date" value={form.fechaNacimiento}
              onChange={e => set('fechaNacimiento', e.target.value)} />

            <Input label="Email (opcional)" type="email" placeholder="ejemplo@correo.com"
              value={form.email ?? ''} onChange={e => set('email', e.target.value)} />

            <Input label="Teléfono (opcional)" placeholder="+56912345678"
              value={form.telefono ?? ''} onChange={e => set('telefono', e.target.value)} />

            {error && <p className="text-sm text-rn-danger text-center">{error}</p>}

            <Button type="submit" loading={loading} className="w-full justify-center">
              Crear cuenta
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-rn-500 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-rn-accent hover:underline font-semibold">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}
