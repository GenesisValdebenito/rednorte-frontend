import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pacientesApi } from '../api'
import { Button, Input, Modal, Card, EmptyState, Spinner } from '../components/ui'
import type { CreatePacienteDto, Paciente } from '../types'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ui/Toast'
import { useAuth } from '../context/AuthContext'

const EMPTY: CreatePacienteDto = {
  numRut: 0, dvRut: '', primerNombre: '', segundoNombre: '',
  apellidoPaterno: '', apellidoMaterno: '', fechaNacimiento: '',
  email: '', telefono: '',
}

function PacienteCard({ p }: { p: Paciente }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-rn-100 rounded-xl border border-rn-200 animate-fade-in">
      <div className="w-11 h-11 rounded-full bg-rn-accent/10 flex items-center justify-center font-bold text-rn-accent text-sm flex-shrink-0">
        {p.primerNombre[0]}{p.apellidoPaterno[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-rn-800 text-sm truncate">
          {p.primerNombre} {p.segundoNombre ?? ''} {p.apellidoPaterno} {p.apellidoMaterno}
        </p>
        <p className="text-xs text-rn-500 font-mono">
          RUT {p.numRut}-{p.dvRut} · {p.fechaNacimiento}
        </p>
        {p.email && <p className="text-xs text-rn-500">{p.email}</p>}
      </div>
      <div className="text-xs text-rn-400 font-mono">ID #{p.id}</div>
    </div>
  )
}

export default function Pacientes() {
  const { toasts, toast } = useToast()
  const { isAdmin, isDoctor, isPaciente } = useAuth()

  if (isPaciente) {
    return <PacienteSelfView />
  }
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreatePacienteDto>(EMPTY)
  const [searchId, setSearchId] = useState('')
  const [searchRut, setSearchRut] = useState('')
  const [foundById, setFoundById] = useState<Paciente | null>(null)
  const [foundByRut, setFoundByRut] = useState<Paciente | null>(null)
  const [searchNombre, setSearchNombre] = useState('')
  const [searchApellido, setSearchApellido] = useState('')
  const [foundByNombre, setFoundByNombre] = useState<Paciente[] | null>(null)
  const [searching, setSearching] = useState(false)

  const { mutate: crear, isPending } = useMutation({
    mutationFn: pacientesApi.crear,
    onSuccess: () => {
      toast.success('Paciente creado correctamente')
      setShowForm(false)
      setForm(EMPTY)
    },
    onError: () => toast.error('Error al crear el paciente'),
  })

  const set = (k: keyof CreatePacienteDto, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const buscarPorId = async () => {
    const id = parseInt(searchId)
    if (isNaN(id)) return
    setSearching(true)
    try {
      const p = await pacientesApi.getById(id)
      setFoundById(p)
    } catch {
      toast.error('Paciente no encontrado')
      setFoundById(null)
    } finally { setSearching(false) }
  }

  const buscarPorRut = async () => {
    const rut = parseInt(searchRut)
    if (isNaN(rut)) return
    setSearching(true)
    try {
      const p = await pacientesApi.getByRut(rut)
      setFoundByRut(p)
    } catch {
      toast.error('Paciente no encontrado')
      setFoundByRut(null)
    } finally { setSearching(false) }
  }

  const buscarPorNombre = async () => {
    const nombre = searchNombre.trim()
    if (!nombre) return
    setSearching(true)
    try {
      const results = await pacientesApi.buscarPorNombre(nombre, searchApellido.trim() || undefined)
      setFoundByNombre(results)
      if (results.length === 0) toast.error('Sin resultados')
    } catch {
      toast.error('Error al buscar')
      setFoundByNombre(null)
    } finally { setSearching(false) }
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rn-800">Pacientes</h1>
          <p className="text-sm text-rn-500 mt-1">Buscar y registrar pacientes</p>
        </div>
        {isAdmin && <Button onClick={() => setShowForm(true)}>+ Nuevo paciente</Button>}
      </div>

      <div className={`grid gap-4 ${isAdmin ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Buscar por ID — solo admin */}
        {isAdmin && (
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-semibold text-rn-500 uppercase tracking-wider">Buscar por ID</h3>
            <div className="flex gap-2">
              <Input placeholder="Ej: 1" value={searchId} onChange={e => setSearchId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscarPorId()} className="flex-1" />
              <Button onClick={buscarPorId} loading={searching} size="md">Buscar</Button>
            </div>
            {foundById && <PacienteCard p={foundById} />}
          </Card>
        )}

        {/* Buscar por RUT */}
        <Card className="p-5 space-y-3">
          <h3 className="text-xs font-semibold text-rn-500 uppercase tracking-wider">Buscar por N° RUT</h3>
          <div className="flex gap-2">
            <Input placeholder="Ej: 12345678 (sin DV)" value={searchRut}
              onChange={e => setSearchRut(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscarPorRut()} className="flex-1" />
            <Button onClick={buscarPorRut} loading={searching} size="md">Buscar</Button>
          </div>
          {foundByRut && <PacienteCard p={foundByRut} />}
        </Card>
      </div>

      {/* Buscar por nombre y apellido */}
      <Card className="p-5 space-y-3">
        <h3 className="text-xs font-semibold text-rn-500 uppercase tracking-wider">Buscar por nombre y apellido</h3>
        <div className="flex gap-2">
          <Input placeholder="Nombre" value={searchNombre}
            onChange={e => setSearchNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscarPorNombre()} className="flex-1" />
          <Input placeholder="Apellido (opcional)" value={searchApellido}
            onChange={e => setSearchApellido(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscarPorNombre()} className="flex-1" />
          <Button onClick={buscarPorNombre} loading={searching} size="md">Buscar</Button>
        </div>
        {foundByNombre && foundByNombre.length > 0 && (
          <div className="space-y-2">
            {foundByNombre.map(p => <PacienteCard key={p.id} p={p} />)}
          </div>
        )}
      </Card>

      {/* Seed data reference */}
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-rn-500 uppercase tracking-wider mb-3">
          Pacientes de prueba (seed del backend)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            'Benjamín González', 'María López', 'Carlos Martínez',
            'Ana Rodríguez', 'Pedro Sánchez', 'Isabel Flores',
            'Jorge Hernández', 'Camila Gómez', 'Roberto Morales', 'Valentina Araya'
          ].map((n, i) => (
            <button
              key={n}
              onClick={() => { setSearchId(String(i + 1)); }}
              className="text-xs text-rn-500 hover:text-rn-accent text-left transition-colors truncate"
            >
              #{i + 1} {n}
            </button>
          ))}
        </div>
      </Card>

      {/* Modal crear */}
      {showForm && (
        <Modal title="Registrar nuevo paciente" onClose={() => setShowForm(false)}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Input label="N° RUT" type="number" placeholder="12345678"
              value={form.numRut || ''} onChange={e => set('numRut', parseInt(e.target.value))} />
            <Input label="DV RUT" placeholder="K" maxLength={1}
              value={form.dvRut} onChange={e => set('dvRut', e.target.value.toUpperCase())} />
            <Input label="Primer nombre" value={form.primerNombre}
              onChange={e => set('primerNombre', e.target.value)} />
            <Input label="Segundo nombre" value={form.segundoNombre ?? ''}
              onChange={e => set('segundoNombre', e.target.value)} />
            <Input label="Apellido paterno" value={form.apellidoPaterno}
              onChange={e => set('apellidoPaterno', e.target.value)} />
            <Input label="Apellido materno" value={form.apellidoMaterno}
              onChange={e => set('apellidoMaterno', e.target.value)} />
            <Input label="Fecha de nacimiento" type="date" value={form.fechaNacimiento}
              onChange={e => set('fechaNacimiento', e.target.value)} />
            <Input label="Email" type="email" placeholder="ejemplo@correo.com" value={form.email ?? ''}
              onChange={e => set('email', e.target.value)} />
            <Input label="Teléfono" placeholder="+56912345678" value={form.telefono ?? ''}
              onChange={e => set('telefono', e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={() => crear(form)} loading={isPending}>Registrar</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function PacienteSelfView() {
  const { personaId } = useAuth()
  const { data: fichas, isLoading: loadingFichas } = useQuery({
    queryKey: ['mis-fichas-paciente'],
    queryFn: () => pacientesApi.getMisFichas(),
    enabled: !!personaId,
  })

  const { data: miPerfil } = useQuery({
    queryKey: ['mi-perfil', personaId],
    queryFn: () => pacientesApi.getById(personaId!),
    enabled: !!personaId,
  })

  if (!miPerfil) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-rn-800">Mi información</h1>
        <p className="text-sm text-rn-500 mt-1">Tus datos personales e historial clínico</p>
      </div>

      <Card className="p-6">
        <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider mb-4">Datos personales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-rn-400">Nombre completo</span>
            <p className="text-rn-800 font-semibold">
              {miPerfil.primerNombre} {miPerfil.segundoNombre ?? ''} {miPerfil.apellidoPaterno} {miPerfil.apellidoMaterno}
            </p>
          </div>
          <div>
            <span className="text-rn-400">RUT</span>
            <p className="text-rn-800 font-semibold font-mono">{miPerfil.numRut}-{miPerfil.dvRut}</p>
          </div>
          <div>
            <span className="text-rn-400">Fecha de nacimiento</span>
            <p className="text-rn-800 font-semibold">{miPerfil.fechaNacimiento}</p>
          </div>
          <div>
            <span className="text-rn-400">Email</span>
            <p className="text-rn-800 font-semibold">{miPerfil.email ?? 'No registrado'}</p>
          </div>
          <div>
            <span className="text-rn-400">Teléfono</span>
            <p className="text-rn-800 font-semibold">{miPerfil.telefono ?? 'No registrado'}</p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider mb-3">Mis fichas clínicas</h2>
        {loadingFichas ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : !fichas?.length ? (
          <Card className="p-6 text-center text-sm text-rn-500">No tienes fichas clínicas registradas.</Card>
        ) : (
          <div className="space-y-2">
            {fichas.map(f => (
              <Card key={f.id} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-rn-500">{f.fecha}</span>
                </div>
                {f.motivo && <p className="text-xs text-rn-500">Motivo: {f.motivo}</p>}
                {f.diagnostico && <p className="text-sm font-semibold text-rn-700 mt-1">{f.diagnostico}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
