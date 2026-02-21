# 💰 Control de Pagos

App web progresiva (PWA) para la gestión de pagos mensuales entre dos personas — un **acreedor** y un **deudor** — con sincronización en tiempo real, sistema de confirmación de pagos y notificaciones sonoras.

---

## ✨ Características

- 🔄 **Sincronización en tiempo real** mediante polling cada 3 segundos
- ✅ **Sistema de aprobación de deuda mensual** — el deudor aprueba el monto antes de que se registren cobros
- 🔔 **Confirmación de pagos** — cada pago registrado por el acreedor debe ser aprobado o rechazado por el deudor
- 🔊 **Alertas sonoras** en cada notificación entre paneles
- 📅 **Historial de pagos** visualizado en calendario mensual
- 💬 **Botones de WhatsApp** para contacto directo entre las partes
- 📱 **PWA instalable** en celular sin pasar por el App Store
- 🎯 **Roles persistentes** — cada usuario elige su rol una sola vez y la app lo recuerda

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| [Next.js 14](https://nextjs.org/) | Framework principal (App Router) |
| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Base de datos |
| [Tailwind CSS](https://tailwindcss.com/) | Estilos |
| [SweetAlert2](https://sweetalert2.github.io/) | Alertas y modales |
| PWA (Service Worker + Manifest) | Instalación en celular |

---

## 📁 Estructura del Proyecto

```
/
├── app/
│   ├── layout.jsx              # Layout global con Navbar y Footer
│   ├── page.jsx                # Pantalla de selección de rol (inicio)
│   ├── acreedor/
│   │   └── page.jsx            # Panel del acreedor
│   ├── deudor/
│   │   └── page.jsx            # Panel del deudor
│   ├── api/
│   │   └── deuda/
│   │       └── route.js        # API REST (GET, POST, PUT)
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── HistorialCalendario.jsx
│   │   └── RegisterSW.jsx      # Registro del Service Worker
│   ├── hooks/
│   │   └── useAlerta.js        # Hook para reproducir sonido de alerta
│   ├── lib/
│   │   └── mongodb.js          # Conexión a MongoDB
│   ├── models/
│   │   └── Deuda.js            # Schema de Mongoose
│   └── globals.css
├── public/
│   ├── alerta.mp3              # Sonido de notificación
│   ├── manifest.json           # Configuración PWA
│   ├── sw.js                   # Service Worker
│   ├── icon-192.png            # Ícono PWA pequeño
│   └── icon-512.png            # Ícono PWA grande
└── README.md
```

---

## 🚀 Instalación y uso local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/control-de-pagos.git
cd control-de-pagos
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Creá un archivo `.env.local` en la raíz del proyecto:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/control-pagos
```

### 4. Correr en desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:3000`

---

## 🗄️ Modelo de datos

```js
// Deuda.js
{
  deudaTotal: Number,       // Monto total del mes
  saldoActual: Number,      // Lo que falta pagar
  estado: String,           // 'aprobada' | 'pendiente'
  pagoPendiente: {          // Pago esperando confirmación del deudor
    monto: Number,
    fecha: String,
    nota: String
  },
  pagos: [                  // Historial de pagos confirmados
    {
      monto: Number,
      fecha: String,        // Formato: YYYY-MM-DD
      nota: String
    }
  ]
}
```

---

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/deuda` | Obtener estado actual de la cuenta |
| `POST` | `/api/deuda` | Registrar un nuevo pago (queda pendiente) |
| `PUT` | `/api/deuda` | Ejecutar acciones sobre la cuenta |

### Acciones disponibles en PUT

| Acción (`body.accion`) | Descripción |
|---|---|
| `nueva_deuda` | Genera una nueva deuda mensual (requiere `body.monto`) |
| `aprobar` | El deudor aprueba la deuda mensual |
| `aprobar_pago` | El deudor confirma que el pago es correcto |
| `rechazar_pago` | El deudor rechaza el pago por error de monto |
| `cancelar_pago` | El acreedor cancela un pago enviado por error |

---

## 📱 Flujo de uso

```
Acreedor                          Deudor
   │                                │
   │── Nueva Deuda del Mes ────────►│
   │                          Aprueba el monto
   │◄─────────────────────────────── │
   │                                │
   │── Registrar Pago ($X) ────────►│
   │                       Aprueba o Rechaza
   │◄─────────────────────────────── │
   │                                │
   │  (si aprueba: descuenta del saldo)
   │  (si rechaza: vuelve a ingresar)
```

---

## 📲 Instalación como PWA

1. Abrí la app desde **Chrome en tu celular**
2. En la pantalla de inicio, elegí tu rol (**Acreedor** o **Deudor**)
3. El navegador te va a mostrar el banner **"Agregar a pantalla de inicio"**
4. Instalá la app — la próxima vez que la abras irás directo a tu panel

> La elección de rol se guarda en `localStorage`. Si necesitás cambiar de rol, limpiá los datos del sitio desde la configuración del navegador.

---

## 🎨 Paleta de colores

| Variable | Color | Uso |
|---|---|---|
| `bg-fondo` | `#1F2358` | Fondo principal oscuro |
| `text-neon` | `#28E71D` | Verde neón — pagos, confirmaciones |
| `text-naranja` | `#FF6B00` | Naranja — alertas, deuda |
| `text-azul` | `#6B7FD4` | Azul — textos secundarios |

---

## 👥 Contacto entre usuarios

Cada panel tiene un botón flotante de WhatsApp para contactar a la otra parte directamente:

- Panel **Acreedor** → contacta a **Daniel** (deudor)
- Panel **Deudor** → contacta a **Claudia** (acreedora)

---

## 📝 Licencia

Proyecto de uso personal. Todos los derechos reservados.