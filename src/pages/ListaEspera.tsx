import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { listaEsperaApi } from '../api'
import { Button, Input, Card, EmptyState, Spinner, Badge } from '../components/ui'
import type { CreateListaEsperaDto } from '../types'
import { useToast } from '../hooks/useToast'
import { ToastContainer } from '../components/ui/Toast'

const ESPECIALIDADES = [
  { id: 1, nombre: 'Med. General' },
  { id: 2, nombre: 'Cardiología' },
  { id: 3, nombre: 'Pediatría' },
  { id: 4, nombre: 'Traumatología' },
  { id: 5, nombre: 'Dermatología' },
]

const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA']

const EMPTY = {
  numRut: 0, especialidadId: 1, prioridad: 'MEDIA', motivoConsulta: '',
}

export default function ListaEspera() {
  const { toasts, toast } = useToast()
  const [form, setForm] = useState(EMPTY)

  const { data: lista, isLoading: loadingLista, refetch } = useQuery({
    queryKey: ['lista-espera'],
    queryFn: listaEsperaApi.listar,
  })

  const { mutate: inscribir, isPending, isSuccess, data } = useMutation({
    mutationFn: listaEsperaApi.inscribirPorRut,
    onSuccess: () => {
      toast.success('Paciente inscrito en lista de espera')
      refetch()
    },
    onError: () => toast.error('Error al inscribir paciente'),
  })

  const set = (k: string, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const nombreEspecialidad = (id: number) =>
    ESPECIALIDADES.find(e => e.id === id)?.nombre ?? `#${id}`

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} />
      <div>
        <h1 className="text-2xl font-bold text-rn-800">Lista de Espera</h1>
        <p className="text-sm text-rn-500 mt-1">
          Inscribir pacientes cuando no hay cupos disponibles
        </p>
      </div>

      {/* Info flujo */}
      <Card className="p-5">
        <h3 className="text-xs font-semibold text-rn-500 uppercase tracking-wider mb-3">
          ¿Cómo funciona?
        </h3>
        <div className="flex items-start gap-8 text-sm">
          {[
            { step: '1', label: 'Crear registro', desc: 'Completa el formulario con los datos del paciente y especialidad', color: 'text-rn-accent' },
            { step: '2', label: 'Asignar prioridad', desc: 'Elige BAJA, MEDIA o ALTA según la urgencia', color: 'text-amber-600' },
            { step: '3', label: 'Inscribir', desc: 'El paciente queda registrado hasta que se libere un cupo', color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.step} className="flex-1">
              <div className={`text-lg font-bold ${s.color} mb-1`}>{s.step}</div>
              <p className="font-semibold text-rn-700 text-xs">{s.label}</p>
              <p className="text-rn-500 text-xs mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Formulario */}
      <Card className="p-6 max-w-lg">
        <h3 className="text-sm font-semibold text-rn-800 mb-4">Inscripción en lista de espera</h3>
        <div className="space-y-4 mb-6">
          <Input
            label="N° RUT del paciente"
            type="number"
            placeholder="Ej: 12345678 (sin DV)"
            value={form.numRut || ''}
            onChange={e => set('numRut', parseInt(e.target.value))}
          />
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-rn-500 uppercase tracking-wider">
              Especialidad requerida
            </label>
            <div className="flex gap-2 flex-wrap">
              {ESPECIALIDADES.map(e => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => set('especialidadId', e.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    form.especialidadId === e.id
                      ? 'bg-rn-accent text-white'
                      : 'bg-rn-100 text-rn-500 hover:text-rn-800 border border-rn-200'
                  }`}
                >
                  {e.nombre}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-rn-500 uppercase tracking-wider">
              Prioridad
            </label>
            <div className="flex gap-2">
              {PRIORIDADES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('prioridad', p)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    form.prioridad === p
                      ? 'bg-rn-accent text-white'
                      : 'bg-rn-100 text-rn-500 hover:text-rn-800 border border-rn-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-rn-500 uppercase tracking-wider">
              Motivo de consulta (opcional)
            </label>
            <textarea
              rows={3}
              className="bg-white border border-rn-300 rounded-lg px-3 py-2 text-sm text-rn-700 placeholder-rn-400 outline-none focus:border-rn-accent transition-colors resize-none"
              placeholder="Describe el motivo de la consulta…"
              value={form.motivoConsulta ?? ''}
              onChange={e => set('motivoConsulta', e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={() => inscribir(form)}
          loading={isPending}
          disabled={!form.numRut}
          className="w-full justify-center"
        >
          Inscribir en lista de espera
        </Button>

        {isSuccess && data && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-fade-in">
            <p className="text-emerald-700 text-xs font-semibold">
              Inscripción exitosa — ID #{data.id}
            </p>
            <p className="text-rn-500 text-xs mt-0.5">
              Prioridad: {data.prioridad} · Estado: {data.estado}
            </p>
            {data.fechaIngreso && (
              <p className="text-rn-500 text-xs mt-0.5">
                Fecha ingreso: {data.fechaIngreso}
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Tabla de inscritos */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-rn-700 uppercase tracking-wider mb-4">
          Pacientes en espera
        </h2>
        {loadingLista ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : !lista?.length ? (
          <EmptyState icon="⏳" title="Lista de espera vacía" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-rn-200">
            <table className="w-full text-sm">
              <thead className="bg-rn-100 text-rn-500 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">RUT</th>
                  <th className="px-4 py-3 text-left">Especialidad</th>
                  <th className="px-4 py-3 text-left">Prioridad</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rn-200 bg-white">
                {lista.map((l: any) => (
                  <tr key={l.id} className="hover:bg-rn-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-rn-500 text-xs">{l.numRut}</td>
                    <td className="px-4 py-3 text-rn-700">{nombreEspecialidad(l.especialidadId)}</td>
                    <td className="px-4 py-3">
                      <Badge color={l.prioridad === 'ALTA' ? 'red' : l.prioridad === 'MEDIA' ? 'yellow' : 'gray'}>
                        {l.prioridad}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={l.estado === 'PENDIENTE' ? 'blue' : 'gray'}>
                        {l.estado ?? '—'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-rn-500 text-xs">{l.motivoConsulta ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="p-4 bg-rn-100 border border-rn-200 rounded-xl text-xs text-rn-500">
        💡 <strong className="text-rn-700">Tip:</strong> También puedes reservar un cupo directamente desde{' '}
        <a href="/agenda" className="text-rn-accent hover:underline">Agenda</a>{' '}
        si hay disponibilidad.
      </div>
    </div>
  )
}