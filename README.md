# rednorte-frontend

Frontend de **RedNorte** — Sistema de Gestión Hospitalaria.
Stack: **React 18 + TypeScript + Vite + TailwindCSS + Axios + TanStack Query**

---

## Inicio rápido (desarrollo local)

### Prerrequisitos
- Node 18+
- Backend corriendo en `localhost:8080` (`docker-compose up --build` en el repo del backend)

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npm run dev

# 3. Abrir en el browser
# → http://localhost:5173
```

El proxy de Vite redirige automáticamente `/api/*` → `http://localhost:8080/api/*`.  
No necesitas configurar CORS ni tocar el backend.

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor dev con hot-reload en :5173 |
| `npm run build` | Build de producción en `/dist` |
| `npm run preview` | Previsualizar el build en :4173 |

---

## Integración con Docker Compose

Agrega esto al `docker-compose.yml` del backend:

```yaml
  rednorte-frontend:
    build:
      context: ./rednorte-frontend
      dockerfile: Dockerfile
    container_name: rednorte-frontend
    ports:
      - "3000:80"
    depends_on:
      - rednorte-bff
    networks:
      - rednorte-net   # misma red que los microservicios
```

Luego:

```bash
docker-compose up --build
# Frontend en: http://localhost:3000
```

---

## Páginas

| Ruta | Descripción | Endpoints BFF |
|---|---|---|
| `/` | Dashboard + historial paciente | `GET /api/dashboard/paciente/{rut}`, `GET /api/dashboard/agenda/hoy` |
| `/pacientes` | Buscar y crear pacientes | `GET /api/pacientes/{id}`, `GET /api/pacientes/rut/{rut}`, `POST /api/pacientes` |
| `/doctores` | Listar y crear doctores | `GET /api/doctores`, `POST /api/doctores` |
| `/agenda` | Ver disponibilidad, reservar, generar jornada | `GET /api/agenda/disponibilidad`, `POST /api/agenda/reserva`, `POST /api/agenda/generar-jornada` |
| `/lista-espera` | Inscribir pacientes | `POST /api/lista-espera` |
| `/fichas` | Crear fichas clínicas | `POST /api/fichas` |

---

## Variables de entorno

| Variable | Valor dev | Valor Docker prod |
|---|---|---|
| `VITE_BFF_URL` | `/api` (usa proxy Vite) | `/api` (usa proxy nginx) |

---

## Estructura del proyecto

```
src/
├── api/
│   ├── client.ts        Instancia Axios
│   └── index.ts         Todas las llamadas al BFF por dominio
├── components/
│   ├── ui/
│   │   ├── index.tsx    Button, Badge, Input, Select, Modal, Card, Spinner, EmptyState
│   │   └── Toast.tsx    Notificaciones
│   └── layout/
│       └── Sidebar.tsx  Navegación lateral
├── hooks/
│   └── useToast.ts      Hook para notificaciones
├── pages/
│   ├── Dashboard.tsx
│   ├── Pacientes.tsx
│   ├── Doctores.tsx
│   ├── Agenda.tsx
│   ├── ListaEspera.tsx
│   └── FichasClinicas.tsx
├── types/
│   └── index.ts         Interfaces TypeScript (espejo de los DTOs del BFF)
├── App.tsx              Router principal
├── main.tsx             Entry point
└── index.css            Tailwind base
```
