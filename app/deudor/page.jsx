'use client';
import { useState, useEffect, useRef} from 'react';
import HistorialCalendario from '../components/HistorialCalendario';
import Swal from 'sweetalert2';
import { useAlerta } from '../hooks/useAlerta';




// Número de la ACREEDORA (Claudia) - el deudor le escribe a ella
const WHATSAPP_ACREEDORA = '543816719966';


export default function PanelDeudor() {
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

      // Sonido si llegó nueva deuda para aprobar
      if (anterior?.estado !== 'pendiente' && nueva.estado === 'pendiente') reproducir();
      // Sonido si llegó un pago para confirmar
      if (!anterior?.pagoPendiente && nueva.pagoPendiente) reproducir();

      cuentaRef.current = nueva;
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

  const aprobarDeuda = async () => {
    try {
      const res = await fetch('/api/deuda', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'aprobar' })
      });
      const json = await res.json();
      if (json.success) {
        setCuenta(json.data);
        Swal.fire({
          title: '¡Deuda Aprobada!',
          text: 'El acreedor ya puede comenzar a registrar tus pagos del mes.',
          icon: 'success',
          background: '#1F2358', color: '#fff', confirmButtonColor: '#28E71D'
        });
      }
    } catch (error) {
      console.error('Error al aprobar:', error);
    }
  };

  const manejarRespuestaPago = async (accion) => {
    try {
      const res = await fetch('/api/deuda', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion })
      });
      const json = await res.json();
      if (json.success) {
        setCuenta(json.data);
        if (accion === 'aprobar_pago') {
          Swal.fire({ title: '¡Excelente!', text: 'El pago se descontó de tu deuda.', icon: 'success', background: '#1F2358', color: '#fff', confirmButtonColor: '#28E71D' });
        } else {
          Swal.fire({ title: 'Pago Rechazado', text: 'Le avisaremos al acreedor para que corrija el monto.', icon: 'info', background: '#1F2358', color: '#fff', confirmButtonColor: '#FF6B00' });
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (cargando) return <div className="text-center p-10 font-medium text-neon animate-pulse">Cargando estado...</div>;
  if (!cuenta) return <div className="text-center p-10 text-naranja">Error al cargar la cuenta.</div>;

  const deudaInicial = cuenta.deudaTotal;
  const saldoActual = cuenta.saldoActual;
  const totalPagado = deudaInicial - saldoActual;
  const porcentajePagado = deudaInicial > 0 ? Math.round((totalPagado / deudaInicial) * 100) : 0;
  const estaPendiente = cuenta.estado === 'pendiente';
  const hayPagoPendiente = !!cuenta.pagoPendiente;
  

  return (
    <div className="flex flex-col gap-8">
      {/* HEADER */}
      <header className="bg-fondo border border-azul/30 p-6 rounded-xl shadow-lg shadow-azul/10">
        <h1 className="text-3xl font-bold text-naranja drop-shadow-sm">Mi Deuda</h1>
        <p className="text-neon font-medium mt-2">Revisá tu saldo pendiente y los pagos acreditados.</p>
      </header>

      {/* PANEL 1: APROBAR DEUDA INICIAL DEL MES */}
      {estaPendiente && (
        <section className="bg-naranja/10 border-2 border-naranja p-6 rounded-xl shadow-[0_0_15px_#FF6B00] text-center animate-pulse">
          <h2 className="text-2xl font-bold text-naranja mb-2">⚠️ Nueva Deuda Recibida</h2>
          <p className="text-white text-lg mb-6">
            El acreedor estableció un nuevo monto mensual de: <span className="font-extrabold text-neon text-2xl">${deudaInicial.toLocaleString()}</span>
          </p>
          <button 
            onClick={aprobarDeuda}
            className="bg-neon hover:bg-green-500 text-fondo font-extrabold py-3 px-8 rounded-lg transition-transform hover:scale-105 shadow-lg"
          >
            SÍ, APROBAR MONTO
          </button>
        </section>
      )}

      {/* PANEL 2: APROBAR PAGO PUNTUAL */}
      {hayPagoPendiente && (
        <section className="bg-azul/20 border-2 border-neon p-6 rounded-xl shadow-[0_0_15px_#28E71D] text-center">
          <h2 className="text-2xl font-bold text-neon mb-2">🔔 Confirmación de Pago</h2>
          <p className="text-white text-lg mb-6">
            El acreedor registró que entregaste: <span className="font-extrabold text-naranja text-2xl">${cuenta.pagoPendiente.monto.toLocaleString()}</span>
            <br/><span className="text-sm text-azul mt-2 block">Nota del cobro: {cuenta.pagoPendiente.nota}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => manejarRespuestaPago('aprobar_pago')}
              className="bg-neon hover:bg-green-500 text-fondo font-extrabold py-3 px-6 rounded-lg transition-transform hover:scale-105 shadow-lg"
            >
              SÍ, ES CORRECTO
            </button>
            <button 
              onClick={() => manejarRespuestaPago('rechazar_pago')}
              className="bg-transparent border-2 border-naranja text-naranja hover:bg-naranja hover:text-white font-extrabold py-3 px-6 rounded-lg transition-colors"
            >
              NO, RECHAZAR
            </button>
          </div>
        </section>
      )}

      {/* TARJETA PRINCIPAL OSCURA */}
      <section className={`bg-fondo border p-6 rounded-xl shadow-lg transition-all ${estaPendiente || hayPagoPendiente ? 'border-azul/10 opacity-60' : 'border-azul/30 shadow-azul/10'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <p className="text-sm font-medium text-azul uppercase tracking-wide mb-1">Saldo a Pagar</p>
            <p className="text-6xl font-extrabold text-neon drop-shadow-sm">${saldoActual.toLocaleString()}</p>
          </div>
          <div className="text-right p-4 bg-azul/10 rounded-lg border border-azul/20">
            <p className="text-sm text-azul mb-1">Deuda Total: <span className="text-white font-bold">${deudaInicial.toLocaleString()}</span></p>
            <p className="text-sm text-neon font-medium">Ya pagaste: <span className="font-bold">${totalPagado.toLocaleString()}</span></p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-azul/20 rounded-full h-5 mb-2 overflow-hidden border border-azul/30">
          <div 
            className="bg-neon h-5 rounded-full transition-all duration-500 shadow-[0_0_10px_#28E71D]" 
            style={{ width: `${porcentajePagado}%` }}
          ></div>
        </div>
        <p className="text-right text-xs text-azul font-bold">{porcentajePagado}% completado</p>
      </section>

      {/* CALENDARIO */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 px-2">Historial de Pagos</h2>
        <HistorialCalendario pagosReales={cuenta.pagos} />
      </section>

      {/* BOTÓN FLOTANTE WHATSAPP - Contactar a Claudia (Acreedora) */}
      <a
        href={`https://wa.me/${WHATSAPP_ACREEDORA}?text=Hola%20Claudia%2C%20te%20escribo%20desde%20la%20app%20de%20pagos.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 flex items-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3 px-5 rounded-full shadow-xl hover:shadow-[0_0_20px_#25D366] transition-all hover:scale-105 z-50"
        title="Contactar a Claudia por WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Contactar a Claudia
      </a>
    </div>
  );
}