import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi, agendaApi, doctoresApi } from '../api'
import { Button, Input, Card, Select, Spinner, EmptyState, Badge } from '../components/ui'

const ESPECIALIDADES = [
  { id: 1, nombre: 'Med. General' },
  { id: 2, nombre: 'Cardiología' },
  { id: 3, nombre: 'Pediatría' },
  { id: 4, nombre: 'Traumatología' },
  { id: 5, nombre: 'Dermatología' },
]

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-rn-800">{value}</div>
        <div className="text-xs text-rn-500 uppercase tracking-wider">{label}</div>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const [rutInput, setRutInput] = useState('')
  const [searchRut, setSearchRut] = useState<number | null>(null)
  const [espId, setEspId] = useState(1)

  const { data: doctores } = useQuery({ queryKey: ['doctores'], queryFn: doctoresApi.listar })
  const { data: cuposHoy, isLoading: loadingCupos } = useQuery({
    queryKey: ['cupos-hoy', espId],
    queryFn: () => agendaApi.cuposHoy(espId),
  })
  const {
    data: dashPaciente,
    isLoading: loadingPaciente,
    error: errPaciente,
    refetch,
  } = useQuery({
    queryKey: ['dashboard-paciente', searchRut],
    queryFn: () => dashboardApi.getPaciente(searchRut!),
    enabled: searchRut !== null,
    retry: false,
  })

  const buscar = () => {
    const n = parseInt(rutInput.trim())
    if (!isNaN(n)) setSearchRut(n)
  }

  const disponibles = cuposHoy?.filter(c => c.estado === 'DISPONIBLE').length ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-rn-800">Dashboard</h1>
        <p className="text-sm text-rn-500 mt-1">Vista general del sistema hospitalario RedNorte</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Doctores" value={doctores?.length ?? '—'} icon="🩺" color="bg-blue-50 text-blue-600" />
        <StatCard label="Cupos hoy" value={cuposHoy?.length ?? '—'} icon="📅" color="bg-purple-50 text-purple-600" />
        <StatCard label="Disponibles hoy" value={disponibles} icon="✅" color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Servicios activos" value={5} icon="⚡" color="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Búsqueda paciente */}
        <Card className="p-6 space-y-4">
            <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider">
            Historial de Paciente
          </h2>
          <div className="flex gap-2">
            <Input
              placeholder="N° RUT sin DV (ej: 12345678)"
              value={rutInput}
              onChange={e => setRutInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscar()}
              className="flex-1"
            />
            <Button onClick={buscar} loading={loadingPaciente}>
              Buscar
            </Button>
          </div>

          {errPaciente && (
            <p className="text-sm text-rn-danger">Paciente no encontrado.</p>
          )}

          {dashPaciente && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-rn-100">
                <div className="w-10 h-10 rounded-full bg-rn-accent/10 flex items-center justify-center font-bold text-rn-accent">
                  {dashPaciente.paciente.primerNombre[0]}{dashPaciente.paciente.apellidoPaterno[0]}
                </div>
                <div>
                  <p className="font-semibold text-rn-800 text-sm">
                    {dashPaciente.paciente.primerNombre} {dashPaciente.paciente.apellidoPaterno} {dashPaciente.paciente.apellidoMaterno}
                  </p>
                  <p className="text-xs text-rn-500 font-mono">
                    RUT {dashPaciente.paciente.numRut}-{dashPaciente.paciente.dvRut}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-rn-100 rounded-lg p-3">
                  <p className="text-rn-500 uppercase tracking-wider mb-1">Fichas</p>
                  <p className="text-rn-800 font-bold text-lg">{dashPaciente.fichasClinicas?.length ?? 0}</p>
                </div>
                <div className="bg-rn-100 rounded-lg p-3">
                  <p className="text-rn-500 uppercase tracking-wider mb-1">Citas</p>
                  <p className="text-rn-800 font-bold text-lg">{dashPaciente.citas?.length ?? 0}</p>
                </div>
              </div>
              {(dashPaciente.fichasClinicas?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-rn-500 uppercase tracking-wider">Últimas fichas</p>
                  {dashPaciente.fichasClinicas.slice(0, 3).map(f => (
                    <div key={f.id} className="bg-rn-100 rounded-lg p-3 text-xs">
                      <p className="text-rn-700 font-medium">{f.diagnostico ?? f.motivo}</p>
                      <p className="text-rn-400 mt-0.5">{f.fecha}</p>
                    </div>
                  ))}
                </div>
              )}
              {(dashPaciente.citas?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] text-rn-500 uppercase tracking-wider">Citas programadas</p>
                  {dashPaciente.citas.slice(0, 5).map(c => (
                    <div key={c.id} className="bg-rn-100 rounded-lg p-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="text-rn-700">{c.nombreDoctor ?? `Médico #—`}</p>
                        <p className="text-rn-400">{c.fecha} · {c.horaInicio}</p>
                      </div>
                      <Badge color={c.estado === 'DISPONIBLE' ? 'green' : c.estado === 'RESERVADO' ? 'yellow' : 'gray'}>
                        {c.estado}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Cupos de hoy */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider">
              Cupos de Hoy
            </h2>
            <Select
              value={espId}
              onChange={e => setEspId(Number(e.target.value))}
              className="text-xs py-1"
            >
              {ESPECIALIDADES.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </Select>
          </div>

          {loadingCupos ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : !cuposHoy?.length ? (
            <EmptyState icon="📅" title="Sin cupos para hoy" />
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {cuposHoy.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-rn-100 rounded-xl">
                  <span className="font-mono text-xs text-rn-500 w-12">{c.horaInicio}</span>
                  <div className="flex-1">
                    <p className="text-xs text-rn-700">
                      Médico #{c.medicoId}
                    </p>
                  </div>
                  <Badge color={c.estado === 'DISPONIBLE' ? 'green' : c.estado === 'RESERVADO' ? 'yellow' : 'gray'}>
                    {c.estado}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
