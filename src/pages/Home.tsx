import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { homeApi, doctoresApi, agendaApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { Card, Badge, Spinner, Button } from '../components/ui'

const ESTADO_COLOR_CITA: Record<string, 'green' | 'yellow' | 'gray' | 'red'> = {
  DISPONIBLE: 'green', RESERVADO: 'yellow', COMPLETADO: 'gray', CANCELADO: 'red',
}

const PRIORIDAD_COLOR: Record<string, 'red' | 'yellow' | 'blue' | 'gray'> = {
  CRITICA: 'red', ALTA: 'yellow', MEDIA: 'blue', BAJA: 'gray',
}

export default function Home() {
  const { isAdmin, isDoctor, isPaciente, username, rol, personaId } = useAuth()

  const { data: doctorHome, isLoading: loadingDoc, error: errorDoc } = useQuery({
    queryKey: ['home-doctor'],
    queryFn: homeApi.getDoctorHome,
    enabled: isDoctor,
  })

  const { data: pacienteHome, isLoading: loadingPac, error: errorPac } = useQuery({
    queryKey: ['home-paciente'],
    queryFn: homeApi.getPacienteHome,
    enabled: isPaciente,
  })

  const { data: doctores } = useQuery({
    queryKey: ['doctores'],
    queryFn: doctoresApi.listar,
    enabled: isAdmin,
  })

  if (isAdmin) return <AdminHome doctoresCount={doctores?.length ?? 0} />
  if (isDoctor) return <DoctorHome data={doctorHome} loading={loadingDoc} error={errorDoc as Error | undefined} />
  if (isPaciente) return <PacienteHome data={pacienteHome} loading={loadingPac} error={errorPac as Error | undefined} />
  return null
}

function AdminHome({ doctoresCount }: { doctoresCount: number }) {
  return (
    <div className="space-y-8">
      <Card className="p-8 text-center">
        <div className="text-4xl mb-3">🏥</div>
        <h1 className="text-2xl font-bold text-rn-800">Panel de Administración</h1>
        <p className="text-sm text-rn-500 mt-2 max-w-md mx-auto">
          Bienvenido al sistema de gestión hospitalaria RedNorte. Desde aquí puedes administrar
          doctores, pacientes, agenda médica y lista de espera.
        </p>
      </Card>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-blue-50 text-blue-600">🩺</div>
          <div>
            <div className="text-2xl font-bold text-rn-800">{doctoresCount}</div>
            <div className="text-xs text-rn-500 uppercase tracking-wider">Doctores</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-purple-50 text-purple-600">📅</div>
          <div>
            <div className="text-2xl font-bold text-rn-800">—</div>
            <div className="text-xs text-rn-500 uppercase tracking-wider">Cupos hoy</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-emerald-50 text-emerald-600">✅</div>
          <div>
            <div className="text-2xl font-bold text-rn-800">5</div>
            <div className="text-xs text-rn-500 uppercase tracking-wider">Especialidades</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-amber-50 text-amber-600">⚡</div>
          <div>
            <div className="text-2xl font-bold text-rn-800">5</div>
            <div className="text-xs text-rn-500 uppercase tracking-wider">Servicios activos</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider mb-4">Acciones rápidas</h2>
          <div className="space-y-2 text-sm text-rn-600">
            <p>→ Ve a <strong className="text-rn-800">Agenda</strong> para generar jornadas y administrar cupos.</p>
            <p>→ Ve a <strong className="text-rn-800">Doctores</strong> para registrar nuevos profesionales.</p>
            <p>→ Ve a <strong className="text-rn-800">Pacientes</strong> para buscar y registrar pacientes.</p>
            <p>→ Ve a <strong className="text-rn-800">Lista de Espera</strong> para inscribir pacientes sin cupo.</p>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider mb-4">Sistema</h2>
          <div className="space-y-2 text-sm text-rn-600">
            <p>BFF corriendo en puerto <strong className="text-rn-800">:8080</strong></p>
            <p>5 microservicios activos con Eureka</p>
            <p>Circuit Breaker activo con Resilience4j</p>
            <p>Autenticación JWT habilitada</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function DoctorHome({ data, loading, error }: { data?: import('../types').DoctorHome; loading: boolean; error?: Error }) {
  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (error || !data) return (
    <Card className="p-6 text-center">
      <p className="text-rn-danger font-semibold">Error al cargar tus datos</p>
      <p className="text-xs text-rn-400 mt-1">{error?.message ?? 'Verifica que el backend esté corriendo'}</p>
    </Card>
  )

  const d = data

  return (
    <div className="space-y-8">
      <Card className="p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-rn-accent/10 flex items-center justify-center text-2xl font-bold text-rn-accent">
            {d.nombre.split(' ')[1]?.[0] ?? 'D'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-rn-800">{d.nombre}</h1>
            <p className="text-sm text-rn-500">{d.especialidad}</p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider mb-3">Mis cupos de hoy</h2>
        {d.cuposHoy.length === 0 ? (
          <Card className="p-6 text-center text-sm text-rn-500">Sin cupos programados para hoy</Card>
        ) : (
          <Card>
            <table className="w-full">
              <thead>
                <tr className="border-b border-rn-200">
                  {['Hora', 'Paciente', 'RUT', 'Estado'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-rn-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.cuposHoy.map(c => (
                  <tr key={c.id} className="border-b border-rn-200/50 hover:bg-rn-100 transition-colors">
                    <td className="px-4 py-3 text-sm text-rn-700">{c.horaInicio}</td>
                    <td className="px-4 py-3 text-sm text-rn-700">{c.nombrePaciente}</td>
                    <td className="px-4 py-3 text-xs font-mono text-rn-500">{c.rutPaciente}</td>
                    <td className="px-4 py-3">
                      <Badge color={ESTADO_COLOR_CITA[c.estado] ?? 'gray'}>{c.estado}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  )
}

function PacienteHome({ data, loading, error }: { data?: import('../types').PacienteHome; loading: boolean; error?: Error }) {
  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (error || !data) return (
    <Card className="p-6 text-center">
      <p className="text-rn-danger font-semibold">Error al cargar tus datos</p>
      <p className="text-xs text-rn-400 mt-1">{error?.message ?? 'Verifica que el backend esté corriendo'}</p>
    </Card>
  )

  const d = data
  const p = d.datosPersonales

  const qc = useQueryClient()
  const { mutate: cancelarCita } = useMutation({
    mutationFn: ({ numRut, cupoId }: { numRut: number; cupoId: number }) =>
      agendaApi.cancelarPorRut(numRut, cupoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['home-paciente'] })
    },
  })

  const llamado = d.estadoListaEspera?.find(le => le.estado === 'LLAMADO')

  return (
    <div className="space-y-8">
      {llamado && (
        <Card className="p-4 bg-amber-50 border-amber-200 flex items-center gap-3">
          <span className="text-xl">📢</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">¡Has sido llamado de la lista de espera!</p>
            <p className="text-xs text-amber-600">
              Prioridad {llamado.prioridad} · Ingreso {llamado.fechaIngreso}. Revisa la agenda para reservar tu cupo.
            </p>
          </div>
        </Card>
      )}
      <Card className="p-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-rn-accent/10 flex items-center justify-center text-2xl font-bold text-rn-accent">
            {p.primerNombre[0]}{p.apellidoPaterno[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-rn-800">
              {p.primerNombre} {p.segundoNombre ?? ''} {p.apellidoPaterno} {p.apellidoMaterno}
            </h1>
            <p className="text-sm text-rn-500 font-mono">
              RUT {p.numRut}-{p.dvRut} · Nac. {p.fechaNacimiento}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider mb-3">Mis próximas citas</h2>
          {d.proximasCitas.length === 0 ? (
            <Card className="p-6 text-center text-sm text-rn-500">Sin citas programadas</Card>
          ) : (
            <Card>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-rn-200">
                    {['Fecha', 'Hora', 'Médico', 'Estado', 'Acción'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-rn-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {d.proximasCitas.map(c => (
                    <tr key={c.id} className="border-b border-rn-200/50 hover:bg-rn-100 transition-colors">
                      <td className="px-4 py-3 text-sm text-rn-700">{c.fecha}</td>
                      <td className="px-4 py-3 text-sm text-rn-700">{c.horaInicio}</td>
                      <td className="px-4 py-3 text-sm text-rn-700">{c.nombreDoctor ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge color={ESTADO_COLOR_CITA[c.estado] ?? 'gray'}>{c.estado}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {c.estado !== 'CANCELADO' && c.estado !== 'COMPLETADO' && (
                          <Button variant="danger" size="sm"
                            onClick={() => cancelarCita({ numRut: p.numRut, cupoId: c.id })}>
                            Cancelar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider mb-3">Últimas fichas clínicas</h2>
          {d.ultimasFichas.length === 0 ? (
            <Card className="p-6 text-center text-sm text-rn-500">Sin fichas clínicas registradas</Card>
          ) : (
            <div className="space-y-2">
              {d.ultimasFichas.map(f => (
                <Card key={f.id} className="p-4">
                  <p className="text-sm font-semibold text-rn-700">{f.diagnostico ?? 'Sin diagnóstico'}</p>
                  <p className="text-xs text-rn-500 mt-1">
                    {f.motivo ? `Motivo: ${f.motivo} · ` : ''}{f.fecha}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {d.estadoListaEspera.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider mb-3">Estado en lista de espera</h2>
          <Card>
            <table className="w-full">
              <thead>
                <tr className="border-b border-rn-200">
                  {['Fecha ingreso', 'Prioridad', 'Estado', 'Motivo'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-rn-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.estadoListaEspera.map(le => (
                  <tr key={le.id} className="border-b border-rn-200/50">
                    <td className="px-4 py-3 text-sm text-rn-700">{le.fechaIngreso}</td>
                    <td className="px-4 py-3">
                      <Badge color={PRIORIDAD_COLOR[le.prioridad] ?? 'gray'}>{le.prioridad}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-rn-700">{le.estado}</td>
                    <td className="px-4 py-3 text-sm text-rn-500">{le.motivoConsulta ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  )
}
