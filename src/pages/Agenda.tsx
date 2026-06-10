import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { agendaApi } from '../api'
import { Button, Input, Modal, Card, EmptyState, Spinner, Badge } from '../components/ui'
import type { CreateCupoDto, GenerarJornadaDto, ReservaDto, Cupo } from '../types'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ui/Toast'
import { useAuth } from '../context/AuthContext'

const ESPECIALIDADES = [
  { id: 1, nombre: 'Med. General' },
  { id: 2, nombre: 'Cardiología' },
  { id: 3, nombre: 'Pediatría' },
  { id: 4, nombre: 'Traumatología' },
  { id: 5, nombre: 'Dermatología' },
]

const ESTADO_COLOR: Record<string, 'green' | 'yellow' | 'gray' | 'red'> = {
  DISPONIBLE: 'green', RESERVADO: 'yellow', COMPLETADO: 'gray', CANCELADO: 'red',
}

export default function Agenda() {
  const { toasts, toast } = useToast()
  const { isAdmin, isDoctor, isPaciente, personaId } = useAuth()
  const [espId, setEspId] = useState(1)
  const [showReserva, setShowReserva] = useState(false)
  const [showCupo, setShowCupo] = useState(false)
  const [showJornada, setShowJornada] = useState(false)

  const [rutCancel, setRutCancel] = useState('')
  const [cancelSearchRut, setCancelSearchRut] = useState<number | null>(null)

  const [reservaForm, setReservaForm] = useState<ReservaDto>({
    cupoId: 0, pacienteId: undefined, motivoConsulta: '',
  })
  const [cupoForm, setCupoForm] = useState<CreateCupoDto>({
    medicoId: 1, especialidadId: 1,
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '09:00:00', horaFin: '09:30:00',
  })
  const [jornadaForm, setJornadaForm] = useState<GenerarJornadaDto>({
    medicoId: 1, especialidadId: 1,
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '08:00', horaFin: '17:00',
  })

  const { data: cupos, isLoading, refetch } = useQuery({
    queryKey: ['disponibilidad', espId, isDoctor ? 'mis' : 'todos'],
    queryFn: () => isDoctor ? agendaApi.misCupos(espId) : agendaApi.disponibilidad(espId),
  })

  const { mutate: reservar, isPending: reservando } = useMutation({
    mutationFn: agendaApi.reservar,
    onSuccess: (res) => {
      toast.success(`Reserva confirmada (cupo #${res.id}, estado: ${res.estado})`)
      setShowReserva(false)
      refetch()
    },
    onError: () => toast.error('Error al procesar la reserva'),
  })

  const { mutate: crearCupo, isPending: creandoCupo } = useMutation({
    mutationFn: agendaApi.crearCupo,
    onSuccess: (res) => {
      toast.success(`Cupo #${res.id} creado correctamente`)
      setShowCupo(false)
      refetch()
    },
    onError: () => toast.error('Error al crear cupo'),
  })

  const { mutate: generarJornada, isPending: generando } = useMutation({
    mutationFn: agendaApi.generarJornada,
    onSuccess: (cupos) => {
      toast.success(`Jornada generada: ${cupos.length} cupos de 30 min`)
      setShowJornada(false)
      refetch()
    },
    onError: () => toast.error('Error al generar jornada'),
  })

  const {
    data: cuposPaciente,
    isLoading: loadingCuposPaciente,
    refetch: refetchCuposPaciente,
  } = useQuery({
    queryKey: ['cupos-paciente-cancel', cancelSearchRut],
    queryFn: () => agendaApi.disponibilidad(espId).then(cupos =>
      cupos.filter(c => c.pacienteId !== null)
    ),
    enabled: cancelSearchRut !== null,
  })

  const { mutate: cancelarPorRut, isPending: cancelando } = useMutation({
    mutationFn: ({ numRut, cupoId }: { numRut: number; cupoId: number }) =>
      agendaApi.cancelarPorRut(numRut, cupoId),
    onSuccess: (res) => {
      const reasignado = res.reasignacion?.reasignado
      toast.success(
        `Cupo #${res.cupoId} cancelado` +
        (reasignado ? ` — Paciente #${res.reasignacion?.pacienteId} reasignado` : '')
      )
      refetch()
      refetchCuposPaciente()
    },
    onError: () => toast.error('Error al cancelar el cupo'),
  })

  const { mutate: reservarCupo, isPending: reservandoCupo } = useMutation({
    mutationFn: (cupoId: number) =>
      agendaApi.reservar({ cupoId, pacienteId: personaId ?? undefined }),
    onSuccess: () => {
      toast.success('Cupo reservado correctamente')
      refetch()
    },
    onError: () => toast.error('Error al reservar el cupo'),
  })

  const buscarCuposPorRut = () => {
    const n = parseInt(rutCancel.trim())
    if (!isNaN(n)) setCancelSearchRut(n)
  }

  const disponibles = cupos?.filter(c => c.estado === 'DISPONIBLE').length ?? 0

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rn-800">Agenda Médica</h1>
          <p className="text-sm text-rn-500 mt-1">{disponibles} cupos disponibles</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button variant="secondary" onClick={() => setShowJornada(true)}>Generar jornada</Button>
              <Button variant="secondary" onClick={() => setShowCupo(true)}>Crear cupo</Button>
            </>
          )}
          {isAdmin && (
            <Button onClick={() => setShowReserva(true)}>Reservar cupo</Button>
          )}
        </div>
      </div>

      {/* Filtro especialidad */}
      <Card className="p-4 flex items-center gap-4">
        <span className="text-xs text-rn-500 uppercase tracking-wider">Especialidad</span>
        <div className="flex gap-2 flex-wrap">
          {ESPECIALIDADES.map(e => (
            <button
              key={e.id}
              onClick={() => setEspId(e.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                espId === e.id
                  ? 'bg-rn-accent text-white'
                  : 'bg-rn-100 text-rn-500 hover:text-rn-800 border border-rn-200'
              }`}
            >
              {e.nombre}
            </button>
          ))}
        </div>
      </Card>

      {/* Tabla de cupos */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !cupos?.length ? (
        <EmptyState
          icon="📅"
          title="Sin cupos para esta especialidad"
        
        />
      ) : (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="border-b border-rn-200">
                {['ID', 'Médico', 'Fecha', 'Hora inicio', 'Hora fin', 'Paciente', 'Estado', 'Acción'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-rn-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cupos.map(c => (
                <tr key={c.id} className="border-b border-rn-200/50 hover:bg-rn-100 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-rn-500">#{c.id}</td>
                  <td className="px-4 py-3 text-sm text-rn-700">#{c.medicoId}</td>
                  <td className="px-4 py-3 text-sm text-rn-700">{c.fecha}</td>
                  <td className="px-4 py-3 text-sm font-mono text-rn-700">{c.horaInicio}</td>
                  <td className="px-4 py-3 text-sm font-mono text-rn-700">{c.horaFin}</td>
                  <td className="px-4 py-3 text-sm text-rn-700">
                    {c.pacienteId ? `#${c.pacienteId}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={ESTADO_COLOR[c.estado] ?? 'gray'}>{c.estado}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {isPaciente && c.estado === 'DISPONIBLE' && (
                      <Button size="sm" onClick={() => reservarCupo(c.id)} loading={reservandoCupo}>
                        Reservar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Cancelar cupo por RUT */}
      {(isAdmin || isDoctor) && (
        <Card className="p-6 space-y-4">
          <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider">
            Cancelar cupo por RUT
          </h2>
          <div className="flex gap-2">
            <Input
              placeholder="N° RUT del paciente (ej: 12345678)"
              value={rutCancel}
              onChange={e => setRutCancel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscarCuposPorRut()}
              className="flex-1"
            />
            <Button onClick={buscarCuposPorRut} loading={loadingCuposPaciente}>
              Buscar
            </Button>
          </div>

          {cancelSearchRut && cuposPaciente && cuposPaciente.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cuposPaciente.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-rn-100 rounded-xl">
                  <span className="font-mono text-xs text-rn-500 w-12">#{c.id}</span>
                  <div className="flex-1">
                    <p className="text-xs text-rn-700">
                      Médico #{c.medicoId} · {c.fecha} · {c.horaInicio}
                    </p>
                  </div>
                  <Badge color={ESTADO_COLOR[c.estado] ?? 'gray'}>{c.estado}</Badge>
                  {c.pacienteId && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        cancelarPorRut({ numRut: cancelSearchRut, cupoId: c.id })
                      }
                      loading={cancelando}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {cancelSearchRut && cuposPaciente?.length === 0 && !loadingCuposPaciente && (
            <p className="text-xs text-rn-500">No se encontraron cupos para este RUT.</p>
          )}
        </Card>
      )}

      {/* Modal Reserva */}
      {showReserva && (
        <Modal title="Reservar cupo" onClose={() => setShowReserva(false)}>
          <p className="text-xs text-rn-500 mb-4">
            Asigna un paciente a un cupo existente (debe estar DISPONIBLE).
          </p>
          <div className="space-y-4 mb-6">
            <Input label="ID del cupo" type="number" placeholder="Ej: 5"
              value={reservaForm.cupoId || ''}
              onChange={e => setReservaForm(p => ({ ...p, cupoId: parseInt(e.target.value) }))} />
            <Input label="ID de paciente (opcional)" type="number" placeholder="Ej: 1"
              value={reservaForm.pacienteId ?? ''}
              onChange={e => setReservaForm(p => ({ ...p, pacienteId: e.target.value ? parseInt(e.target.value) : undefined }))} />
            <Input label="Motivo consulta (opcional)" placeholder="Ej: Control general"
              value={reservaForm.motivoConsulta ?? ''}
              onChange={e => setReservaForm(p => ({ ...p, motivoConsulta: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowReserva(false)}>Cancelar</Button>
            <Button onClick={() => reservar(reservaForm)} loading={reservando}
              disabled={!reservaForm.cupoId}>
              Confirmar reserva
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal Crear Cupo */}
      {showCupo && (
        <Modal title="Crear cupo individual" onClose={() => setShowCupo(false)}>
          <p className="text-xs text-rn-500 mb-4">
            Crea un cupo manual para un médico en una fecha y hora específicas.
          </p>
          <div className="space-y-4 mb-6">
            <Input label="ID médico" type="number" placeholder="Ej: 1"
              value={cupoForm.medicoId || ''}
              onChange={e => setCupoForm(p => ({ ...p, medicoId: parseInt(e.target.value) }))} />
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-rn-500 uppercase tracking-wider">Especialidad</label>
              <div className="flex gap-2 flex-wrap">
                {ESPECIALIDADES.map(e => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setCupoForm(p => ({ ...p, especialidadId: e.id }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      cupoForm.especialidadId === e.id
                        ? 'bg-rn-accent text-white'
                        : 'bg-rn-100 text-rn-500 hover:text-rn-800 border border-rn-200'
                    }`}
                  >
                    {e.nombre}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Fecha" type="date" value={cupoForm.fecha}
              onChange={e => setCupoForm(p => ({ ...p, fecha: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Hora inicio" type="time" value={cupoForm.horaInicio}
                onChange={e => setCupoForm(p => ({ ...p, horaInicio: e.target.value + ':00' }))} />
              <Input label="Hora fin" type="time" value={cupoForm.horaFin}
                onChange={e => setCupoForm(p => ({ ...p, horaFin: e.target.value + ':00' }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCupo(false)}>Cancelar</Button>
            <Button onClick={() => crearCupo(cupoForm)} loading={creandoCupo}>
              Crear cupo
            </Button>
          </div>
        </Modal>
      )}

      {/* Modal Generar Jornada */}
      {showJornada && (
        <Modal title="Generar jornada médica" onClose={() => setShowJornada(false)}>
          <p className="text-xs text-rn-500 mb-4">
            Genera bloques de 30 minutos automáticamente para el médico y día seleccionados.
          </p>
          <div className="space-y-4 mb-6">
            <Input label="ID médico" type="number" placeholder="Ej: 1"
              value={jornadaForm.medicoId || ''}
              onChange={e => setJornadaForm(p => ({ ...p, medicoId: parseInt(e.target.value) }))} />
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-rn-500 uppercase tracking-wider">Especialidad</label>
              <div className="flex gap-2 flex-wrap">
                {ESPECIALIDADES.map(e => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setJornadaForm(p => ({ ...p, especialidadId: e.id }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      jornadaForm.especialidadId === e.id
                        ? 'bg-rn-accent text-white'
                        : 'bg-rn-100 text-rn-500 hover:text-rn-800 border border-rn-200'
                    }`}
                  >
                    {e.nombre}
                  </button>
                ))}
              </div>
            </div>
            <Input label="Fecha" type="date" value={jornadaForm.fecha}
              onChange={e => setJornadaForm(p => ({ ...p, fecha: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Hora inicio" type="time" value={jornadaForm.horaInicio}
                onChange={e => setJornadaForm(p => ({ ...p, horaInicio: e.target.value }))} />
              <Input label="Hora fin" type="time" value={jornadaForm.horaFin}
                onChange={e => setJornadaForm(p => ({ ...p, horaFin: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowJornada(false)}>Cancelar</Button>
            <Button onClick={() => generarJornada(jornadaForm)} loading={generando}>
              Generar jornada
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
