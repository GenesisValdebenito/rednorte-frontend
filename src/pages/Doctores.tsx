import { useState } from 'react'
import { doctoresApi } from '../api'
import { Button, Input, Modal, Card, EmptyState, Spinner, Badge } from '../components/ui'
import type { CreateDoctorDto } from '../types'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ui/Toast'
import { useAuth } from '../context/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const ESPECIALIDADES = [
  'Medicina General',
  'Cardiología',
  'Pediatría',
  'Traumatología',
  'Dermatología',
]

const ESTADO_COLOR: Record<string, 'blue' | 'red' | 'green' | 'purple' | 'yellow'> = {
  'Medicina General': 'blue',
  'Cardiología': 'red',
  'Pediatría': 'green',
  'Traumatología': 'purple',
  'Dermatología': 'yellow',
}

const EMPTY: CreateDoctorDto = {
  numRut: 0, dvRut: '', primerNombre: '', apellidoPaterno: '',
  especialidad: 'Medicina General', email: '',
}

export default function Doctores() {
  const [filtro, setFiltro] = useState('')
  const { toasts, toast } = useToast()
  const { isAdmin, isDoctor, personaId } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateDoctorDto>(EMPTY)
  const qc = useQueryClient()


  const { data: doctores, isLoading } = useQuery({
    queryKey: ['doctores'],
    queryFn: doctoresApi.listar,
    enabled: isAdmin,
  })

  const { data: miDoctor } = useQuery({
    queryKey: ['mi-doctor', personaId],
    queryFn: () => doctoresApi.getById(personaId!),
    enabled: isDoctor && personaId != null,
  })


  const { mutate: crear, isPending } = useMutation({
    mutationFn: doctoresApi.crear,
    onSuccess: () => {
      toast.success('Doctor registrado correctamente')
      setShowForm(false)
      setForm(EMPTY)
      qc.invalidateQueries({ queryKey: ['doctores'] })
    },
    onError: () => toast.error('Error al registrar doctor'),
  })

  const set = (k: keyof CreateDoctorDto, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const setEspecialidad = (v: string) =>
    setForm(prev => ({ ...prev, especialidad: v }))

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rn-800">Doctores</h1>
          <p className="text-sm text-rn-500 mt-1">
            {isAdmin ? `${doctores?.length ?? 0} profesionales registrados` : 'Mi perfil'}
          </p>
        </div>
        {isAdmin && <Button onClick={() => setShowForm(true)}>+ Nuevo doctor</Button>}
      </div>

      {/* Filtro (solo admin) */}
      {isAdmin && (
        <input
          type="text"
          placeholder="Filtrar por nombre o especialidad..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="border border-rn-200 rounded-xl px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-rn-accent/30"
        />
      )}

      {/* Perfil del doctor (vista doctor) */}
      {isDoctor && miDoctor && (
        <Card className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-rn-accent/10 flex items-center justify-center text-xl font-bold text-rn-accent flex-shrink-0">
            {miDoctor.primerNombre[0]}{miDoctor.apellidoPaterno[0]}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-rn-800 text-lg">
              Dr. {miDoctor.primerNombre} {miDoctor.apellidoPaterno}
            </p>
            <div className="mt-1 flex items-center gap-3">
              <Badge color={ESTADO_COLOR[miDoctor.especialidad] ?? 'gray'}>
                {miDoctor.especialidad}
              </Badge>
              <span className="text-xs text-rn-500 font-mono">
                RUT {miDoctor.numRut}-{miDoctor.dvRut}
              </span>
            </div>
            {miDoctor.email && (
              <p className="text-xs text-rn-500 mt-1">{miDoctor.email}</p>
            )}
          </div>
        </Card>
      )}

      {/* Tabla de doctores (vista admin) */}
      {isAdmin && (
        <>
          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : !doctores?.length ? (
            <EmptyState
              icon="🩺"
              title="Sin doctores registrados"
              description="El backend tiene 5 doctores de prueba cargados automáticamente al iniciar."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-rn-200">
              <table className="w-full text-sm">
                <thead className="bg-rn-100 text-rn-500 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Doctor</th>
                    <th className="px-4 py-3 text-left">Especialidad</th>
                    <th className="px-4 py-3 text-left">RUT</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rn-200 bg-white">
                  {doctores.filter(d =>
                    `${d.primerNombre} ${d.apellidoPaterno} ${d.especialidad}`
                      .toLowerCase()
                      .includes(filtro.toLowerCase())
                  ).map(d => (
                    <tr key={d.id} className="hover:bg-rn-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-rn-800">
                        Dr. {d.primerNombre} {d.apellidoPaterno}
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={ESTADO_COLOR[d.especialidad] ?? 'gray'}>
                          {d.especialidad}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-rn-500 text-xs">
                        {d.numRut}-{d.dvRut}
                      </td>
                      <td className="px-4 py-3 text-rn-500">{d.email ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-rn-400 text-xs">#{d.id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Card className="p-4">
            <p className="text-[11px] text-rn-500 uppercase tracking-wider mb-2">
              Doctores seed del backend
            </p>
            <div className="text-xs text-rn-500 space-y-0.5">
              {['Alejandro Molina (Medicina General)', 'Carolina Venegas (Cardiología)',
                'Francisco Orellana (Pediatría)', 'Patricia Sanhueza (Traumatología)',
                'Ricardo Fuentes (Dermatología)'].map(d => (
                  <p key={d}>· {d}</p>
                ))}
            </div>
          </Card>
        </>
      )}

      {/* Modal nuevo doctor */}
      {showForm && (
        <Modal title="Registrar nuevo doctor" onClose={() => setShowForm(false)}>
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <Input label="N° RUT" type="number" placeholder="12345678"
                value={form.numRut || ''} onChange={e => set('numRut', parseInt(e.target.value))} />
              <Input label="DV RUT" placeholder="K" maxLength={1}
                value={form.dvRut} onChange={e => set('dvRut', e.target.value.toUpperCase())} />
            </div>
            <Input label="Primer nombre" value={form.primerNombre}
              onChange={e => set('primerNombre', e.target.value)} />
            <Input label="Apellido paterno" value={form.apellidoPaterno}
              onChange={e => set('apellidoPaterno', e.target.value)} />
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-rn-500 uppercase tracking-wider">
                Especialidad
              </label>
              <div className="flex gap-2 flex-wrap">
                {ESPECIALIDADES.map(esp => (
                  <button
                    key={esp}
                    type="button"
                    onClick={() => setEspecialidad(esp)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${form.especialidad === esp
                        ? 'bg-rn-accent text-white'
                        : 'bg-rn-100 text-rn-500 hover:text-rn-800 border border-rn-200'
                      }`}
                  >
                    {esp}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Email" type="email" placeholder="doctor@rednorte.cl"
              value={form.email ?? ''} onChange={e => set('email', e.target.value)} />
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