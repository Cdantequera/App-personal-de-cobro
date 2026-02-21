'use client';
import { useState, useEffect, useRef} from 'react';
import HistorialCalendario from '../components/HistorialCalendario';
import Swal from 'sweetalert2';
import { useAlerta } from '../hooks/useAlerta';

// Número del DEUDOR (Daniel) - el acreedor le escribe a él
const WHATSAPP_DEUDOR = '543816608841';

export default function PanelAcreedor() {
  const [montoPago, setMontoPago] = useState('');
  const [nota, setNota] = useState('');
  const [cuenta, setCuenta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const { reproducir } = useAlerta();
  const cuentaRef = useRef(null);

const cargarDatos = async () => {
  try {
    const res = await fetch(`/api/deuda?t=${new Date().getTime()}`, { 
      cache: 'no-store',
      headers: { 'Pragma': 'no-cache' }
    });
    const json = await res.json();
    if (json.success) {
      const nueva = json.data;
      const anterior = cuentaRef.current;

      // Sonido si el deudor aprobó o rechazó el pago
      if (anterior?.pagoPendiente && !nueva.pagoPendiente) reproducir();
      // Sonido si el deudor aprobó la deuda inicial
      if (anterior?.estado === 'pendiente' && nueva.estado === 'aprobada') reproducir();

      cuentaRef.current = nueva; // actualizamos la referencia
      setCuenta(nueva);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setCargando(false);
  }
};

useEffect(() => {
  cargarDatos();
  const intervalo = setInterval(cargarDatos, 3000);
  return () => clearInterval(intervalo);
}, []);

  const manejarNuevaDeuda = async () => {
    const { value: montoNuevo } = await Swal.fire({
      title: 'Generar Deuda del Mes',
      text: 'Ingresá el monto total que el deudor debe pagar este mes:',
      input: 'number',
      inputPlaceholder: 'Ej: 200000',
      background: '#1F2358',
      color: '#fff',
      confirmButtonColor: '#FF6B00',
      cancelButtonColor: '#d33',
      showCancelButton: true,
      confirmButtonText: 'Enviar para Aprobación',
      cancelButtonText: 'Cancelar'
    });

    if (montoNuevo && montoNuevo > 0) {
      try {
        const res = await fetch('/api/deuda', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accion: 'nueva_deuda', monto: montoNuevo })
        });
        const json = await res.json();
        if (json.success) {
          setCuenta(json.data);
          Swal.fire({
            title: '¡Enviado!',
            text: 'Monto enviado. Esperando aprobación del deudor.',
            icon: 'success',
            background: '#1F2358', color: '#fff', confirmButtonColor: '#28E71D'
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const manejarRegistroPago = async (e) => {
    e.preventDefault();
    if (!montoPago || montoPago <= 0) return;

    const fechaHoy = new Date().toISOString().split('T')[0];

    try {
      const res = await fetch('/api/deuda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto: Number(montoPago), fecha: fechaHoy, nota: nota || 'Pago recibido' }),
      });
      const json = await res.json();

      if (json.success) {
        setCuenta(json.data);
        setMontoPago('');
        setNota('');
        Swal.fire({
          title: 'Pago enviado a revisión',
          text: `Se registraron $${montoPago}. Esperando que el deudor lo confirme.`,
          icon: 'info',
          confirmButtonColor: '#28E71D', background: '#1F2358', color: '#fff'
        });
      } else {
        throw new Error(json.error);
      }
    } catch (error) {
      Swal.fire({
        title: 'Atención', 
        text: error.message || 'No se pudo registrar el pago',
        icon: 'warning', 
        confirmButtonColor: '#FF6B00', background: '#1F2358', color: '#fff'
      });
    }
  };

  if (cargando) return <div className="text-center p-10 font-medium text-neon animate-pulse">Cargando panel...</div>;
  if (!cuenta) return <div className="text-center p-10 text-naranja">Error al cargar la cuenta.</div>;

  const estaPendiente = cuenta.estado === 'pendiente';
  const hayPagoPendiente = !!cuenta.pagoPendiente;
  const formularioBloqueado = estaPendiente || hayPagoPendiente;

  return (
    <div className="flex flex-col gap-8">
      {/* HEADER */}
      <header className="bg-fondo border border-azul/30 p-6 rounded-xl shadow-lg shadow-azul/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-naranja drop-shadow-sm">Panel de Cobros</h1>
          <p className="text-neon font-medium mt-2">Administrá los pagos recibidos del deudor.</p>
        </div>
        <button 
          onClick={manejarNuevaDeuda}
          className="bg-naranja hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
        >
          + Nueva Deuda del Mes
        </button>
      </header>

      {/* AVISO: DEUDA MENSUAL PENDIENTE */}
      {estaPendiente && (
        <div className="bg-naranja/20 border-l-4 border-naranja p-4 rounded-r-lg">
          <p className="text-naranja font-bold">⚠️ Esperando aprobación de deuda inicial</p>
          <p className="text-sm text-white mt-1">El deudor debe aprobar el monto total del mes antes de que puedas registrar cobros.</p>
        </div>
      )}

      {/* AVISO: PAGO EN REVISIÓN */}
      {hayPagoPendiente && (
        <div className="bg-azul/20 border-l-4 border-neon p-4 rounded-r-lg animate-pulse">
          <p className="text-neon font-bold">⏳ Pago en revisión</p>
          <p className="text-sm text-white mt-1">
            Esperando que el deudor confirme el pago de <span className="font-bold">${cuenta.pagoPendiente.monto.toLocaleString()}</span>. 
            Si lo rechaza, vas a poder ingresarlo nuevamente.
          </p>
          <button 
            onClick={async () => {
              const res = await fetch('/api/deuda', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accion: 'cancelar_pago' })
              });
              const json = await res.json();
              if (json.success) setCuenta(json.data);
            }}
            className="mt-3 text-xs text-naranja underline hover:text-orange-400"
          >
            Cancelar y reenviar pago
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* FORMULARIO DE PAGOS */}
        <section className={`bg-fondo border p-6 rounded-xl shadow-lg transition-all ${formularioBloqueado ? 'border-red-500/50 opacity-50' : 'border-azul/30 shadow-azul/10'} h-fit`}>
          <h2 className="text-xl font-semibold mb-4 text-white">Registrar Nuevo Pago</h2>
          <form onSubmit={manejarRegistroPago} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-azul mb-1">Monto Recibido ($)</label>
              <input 
                type="number" 
                value={montoPago} 
                onChange={(e) => setMontoPago(e.target.value)}
                placeholder="Ej: 10000" 
                required 
                disabled={formularioBloqueado}
                className="w-full p-3 bg-azul/10 border border-azul/30 rounded-lg text-white disabled:bg-gray-800 disabled:cursor-not-allowed focus:ring-2 focus:ring-neon focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-azul mb-1">Nota (Opcional)</label>
              <input 
                type="text" 
                value={nota} 
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ej: Transferencia MP" 
                disabled={formularioBloqueado}
                className="w-full p-3 bg-azul/10 border border-azul/30 rounded-lg text-white disabled:bg-gray-800 disabled:cursor-not-allowed focus:ring-2 focus:ring-neon focus:outline-none transition-all"
              />
            </div>
            <button 
              type="submit" 
              disabled={formularioBloqueado}
              className={`font-bold py-3 rounded-lg transition-colors mt-2 border ${formularioBloqueado ? 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed' : 'bg-neon/20 text-neon border-neon hover:bg-neon/30'}`}
            >
              ENVIAR PAGO A REVISIÓN
            </button>
          </form>
        </section>

        {/* TARJETA DE ESTADO */}
        <section className="bg-fondo border border-azul/30 p-6 rounded-xl shadow-lg shadow-azul/10 flex flex-col justify-center">
          <h2 className="text-lg font-medium text-white mb-4">Estado de la Cuenta</h2>
          <div className="mb-6 p-4 bg-azul/10 rounded-lg border border-azul/20">
            <p className="text-sm text-azul">Deuda Original del Mes</p>
            <p className="text-2xl font-bold text-white">${cuenta.deudaTotal.toLocaleString()}</p>
          </div>
          <div className={`p-4 rounded-lg border ${estaPendiente ? 'bg-naranja/10 border-naranja/20' : 'bg-neon/10 border-neon/20'}`}>
            <p className={`text-sm ${estaPendiente ? 'text-naranja' : 'text-neon'}`}>Saldo Pendiente</p>
            <p className={`text-4xl font-extrabold drop-shadow-sm ${estaPendiente ? 'text-naranja' : 'text-neon'}`}>
              ${cuenta.saldoActual.toLocaleString()}
            </p>
          </div>
        </section>
      </div>

      {/* CALENDARIO */}
      <HistorialCalendario pagosReales={cuenta.pagos} />

      {/* BOTÓN FLOTANTE WHATSAPP - Contactar a Daniel (Deudor) */}
      <a
        href={`https://wa.me/${WHATSAPP_DEUDOR}?text=Hola%20Daniel%2C%20te%20escribo%20desde%20la%20app%20de%20pagos.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3 px-5 rounded-full shadow-xl hover:shadow-[0_0_20px_#25D366] transition-all hover:scale-105 z-50"
        title="Contactar a Daniel por WhatsApp"
      >
        {/* Ícono WhatsApp SVG */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Contactar a Daniel
      </a>
    </div>
  );
}