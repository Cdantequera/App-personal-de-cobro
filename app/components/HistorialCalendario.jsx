'use client';
import { useState } from 'react';

export default function HistorialCalendario({ pagosReales = [] }) {
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const pagosAgrupados = pagosReales.reduce((acc, pago) => {
    if (!acc[pago.fecha]) acc[pago.fecha] = [];
    acc[pago.fecha].push(pago);
    return acc;
  }, {});

  const fechaActual = new Date();
  const anio = fechaActual.getFullYear();
  const mesIndex = fechaActual.getMonth(); // 0 a 11
  const mes = String(mesIndex + 1).padStart(2, '0');
  const diasEnMes = new Date(anio, mesIndex + 1, 0).getDate();
  const diasDelMes = Array.from({ length: diasEnMes }, (_, i) => i + 1);

  // --- LÓGICA DE ALINEACIÓN DEL CALENDARIO ---
  // 1. Averiguamos qué día de la semana es el 1 del mes (0 = Domingo, 1 = Lunes, etc.)
  const primerDia = new Date(anio, mesIndex, 1).getDay();
  
  // 2. Ajustamos para que nuestra semana empiece en Lunes (0) y termine en Domingo (6)
  const espaciosVacios = primerDia === 0 ? 6 : primerDia - 1;
  
  // 3. Título dinámico (Opcional, pero le da mejor aspecto)
  const nombreMes = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(fechaActual);

  const manejarClicDia = (dia) => {
    const fechaClave = `${anio}-${mes}-${dia.toString().padStart(2, '0')}`;
    const pagosDelDia = pagosAgrupados[fechaClave];
    
    setDiaSeleccionado({ fecha: fechaClave, pagos: pagosDelDia || [] });
  };

  return (
    // Contenedor principal oscuro
    <div className="bg-fondo p-6 rounded-xl shadow-lg shadow-azul/10 border border-azul/30">
      <h2 className="text-lg font-bold mb-6 text-white capitalize">{nombreMes}</h2>
      
      <div className="grid grid-cols-7 gap-2 mb-6 text-center">
        {/* Cabecera de los días */}
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (
          <div key={d} className="font-bold text-azul text-sm">{d}</div>
        ))}
        
        {/* Renderizamos celdas vacías para alinear el día 1 en la columna correcta */}
        {Array.from({ length: espaciosVacios }).map((_, i) => (
          <div key={`vacio-${i}`} className="p-2"></div>
        ))}
        
        {/* Renderizamos los días reales del mes */}
        {diasDelMes.map((dia) => {
          const fechaClave = `${anio}-${mes}-${dia.toString().padStart(2, '0')}`;
          const tienePago = pagosAgrupados[fechaClave];

          return (
            <button
              key={dia}
              onClick={() => manejarClicDia(dia)}
              className={`p-2 rounded-lg text-sm font-medium transition-all border 
                ${tienePago 
                  ? 'bg-neon/20 border-neon text-neon hover:bg-neon/30 hover:shadow-[0_0_10px_#28E71D]' 
                  : 'bg-transparent border-azul/20 text-azul hover:bg-azul/10 hover:border-azul/50'
                }`}
            >
              {dia}
            </button>
          );
        })}
      </div>

      {/* Panel de detalle oscuro */}
      {diaSeleccionado && (
        <div className="p-4 bg-azul/10 rounded-lg border border-azul/30 animate-fadeIn">
          <h3 className="font-semibold text-white mb-3">
            Detalle del <span className="text-neon">{diaSeleccionado.fecha}</span>:
          </h3>
          
          {diaSeleccionado.pagos.length > 0 ? (
            <div className="flex flex-col gap-2">
              {diaSeleccionado.pagos.map((pago, idx) => (
                <div key={idx} className="bg-fondo p-3 rounded border border-azul/20 shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-neon font-bold text-lg">+ ${pago.monto.toLocaleString()}</p>
                    <p className="text-azul text-sm">{pago.nota}</p>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-azul italic text-sm">No hay movimientos en esta fecha.</p>
          )}
        </div>
      )}
    </div>
  );
}