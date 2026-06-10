import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { agendaApi, fichasApi } from '../api'
import { Button, Input, Modal, Card, Badge, Spinner } from '../components/ui'
import type { FichaClinica } from '../types'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ui/Toast'

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

type HoraHoy = {
  id: number; horaInicio: string; horaFin: string; estado: string
  especialidadId: number; nombrePaciente?: string; rutPaciente?: string; numRut?: number
}

export default function FichasClinicas() {
  const { toasts, toast } = useToast()
  const [espId, setEspId] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [horaSeleccionada, setHoraSeleccionada] = useState<HoraHoy | null>(null)
  const [diagnostico, setDiagnostico] = useState('')
  const [motivo, setMotivo] = useState('')

  const { data: horasHoy, isLoading: loadingHoras } = useQuery({
    queryKey: ['mis-horas-hoy', espId],
    queryFn: () => agendaApi.misHorasHoy(espId),
  })

  const { data: misFichas, isLoading: loadingFichas, refetch: refetchFichas } = useQuery({
    queryKey: ['mis-fichas'],
    queryFn: fichasApi.getMisFichas,
  })

  const { mutate: crearFicha, isPending } = useMutation({
    mutationFn: fichasApi.crearPorRut,
    onSuccess: (ficha) => {
      toast.success(`Ficha clínica creada (ID #${ficha.id}). Cupo completado.`)
      setShowForm(false)
      setDiagnostico('')
      setMotivo('')
      refetchFichas()
    },
    onError: () => toast.error('Error al crear la ficha clínica'),
  })

  const abrirForm = (hora: HoraHoy) => {
    setHoraSeleccionada(hora)
    setDiagnostico('')
    setMotivo('')
    setShowForm(true)
  }

  const handleCrearFicha = () => {
    if (!horaSeleccionada?.numRut || !horaSeleccionada?.id) return
    crearFicha({
      numRut: horaSeleccionada.numRut,
      cupoId: horaSeleccionada.id,
      fecha: new Date().toISOString().split('T')[0],
      motivo: motivo || undefined,
      diagnostico: diagnostico || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />
      <div>
        <h1 className="text-2xl font-bold text-rn-800">Fichas Clínicas</h1>
        <p className="text-sm text-rn-500 mt-1">Gestiona tus atenciones médicas</p>
      </div>

      {/* Mis horas de hoy */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider">Mis horas de hoy</h2>
          <div className="flex gap-2">
            {ESPECIALIDADES.map(e => (
              <button key={e.id} onClick={() => setEspId(e.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  espId === e.id ? 'bg-rn-accent text-white' : 'bg-rn-100 text-rn-500 hover:text-rn-800 border border-rn-200'
                }`}>
                {e.nombre}
              </button>
            ))}
          </div>
        </div>

        {loadingHoras ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : !horasHoy?.length ? (
          <p className="text-sm text-rn-500 text-center py-6">Sin horas programadas para hoy en esta especialidad.</p>
        ) : (
          <div className="space-y-2">
            {horasHoy.map(h => (
              <div key={h.id} className={`flex items-center gap-4 p-3 rounded-xl border ${
                h.estado === 'RESERVADO' ? 'bg-amber-50 border-amber-200' :
                h.estado === 'COMPLETADO' ? 'bg-emerald-50 border-emerald-200' :
                'bg-rn-100 border-rn-200'
              }`}>
                <span className="font-mono text-xs text-rn-600 w-28">
                  {h.horaInicio} → {h.horaFin}
                </span>
                <div className="flex-1">
                  {h.nombrePaciente ? (
                    <>
                      <p className="text-sm font-semibold text-rn-800">{h.nombrePaciente}</p>
                      <p className="text-xs text-rn-500 font-mono">RUT {h.rutPaciente}</p>
                    </>
                  ) : (
                    <p className="text-sm text-rn-400">Sin paciente asignado</p>
                  )}
                </div>
                <Badge color={ESTADO_COLOR[h.estado] ?? 'gray'}>{h.estado}</Badge>
                {h.estado === 'RESERVADO' && h.numRut && (
                  <Button size="sm" onClick={() => abrirForm(h)}>
                    Crear ficha
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Mis fichas creadas */}
      <div>
        <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider mb-3">Mis fichas creadas</h2>
        {loadingFichas ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : !misFichas?.length ? (
          <Card className="p-6 text-center text-sm text-rn-500">Aún no has creado fichas clínicas.</Card>
        ) : (
          <div className="space-y-2">
            {misFichas.map(f => (
              <Card key={f.id} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-rn-500 font-mono">Ficha #{f.id}</span>
                  <span className="text-xs text-rn-400">{f.fecha}</span>
                </div>
                {f.motivo && <p className="text-xs text-rn-500">Motivo: {f.motivo}</p>}
                {f.diagnostico && (
                  <p className="text-sm font-semibold text-rn-700 mt-1">{f.diagnostico}</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal crear ficha */}
      {showForm && horaSeleccionada && (
        <Modal title="Crear ficha clínica" onClose={() => setShowForm(false)}>
          <div className="mb-4 p-3 bg-rn-100 rounded-xl">
            <p className="text-sm font-semibold text-rn-800">{horaSeleccionada.nombrePaciente}</p>
            <p className="text-xs text-rn-500 font-mono mt-0.5">
              RUT {horaSeleccionada.rutPaciente} · {horaSeleccionada.horaInicio} → {horaSeleccionada.horaFin}
            </p>
          </div>
          <div className="space-y-4 mb-6">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-rn-500 uppercase tracking-wider">Motivo de consulta</label>
              <textarea rows={2}
                className="bg-white border border-rn-300 rounded-lg px-3 py-2 text-sm text-rn-700 placeholder-rn-400 outline-none focus:border-rn-accent transition-colors resize-none"
                placeholder="Describe el motivo de la consulta…"
                value={motivo} onChange={e => setMotivo(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-rn-500 uppercase tracking-wider">Diagnóstico</label>
              <textarea rows={3}
                className="bg-white border border-rn-300 rounded-lg px-3 py-2 text-sm text-rn-700 placeholder-rn-400 outline-none focus:border-rn-accent transition-colors resize-none"
                placeholder="Describe el diagnóstico…"
                value={diagnostico} onChange={e => setDiagnostico(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleCrearFicha} loading={isPending} disabled={!diagnostico}>Guardar ficha</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
