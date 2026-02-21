'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


export default function Inicio() {
  const router = useRouter();

  useEffect(() => {
    // Si ya eligió rol antes, lo manda directo
    const rol = localStorage.getItem('rol');
    if (rol === 'deudor') router.replace('/deudor');
    if (rol === 'acreedor') router.replace('/acreedor');
  }, []);

  const elegirRol = (rol) => {
    localStorage.setItem('rol', rol);
    router.push(`/${rol}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Control de Pagos</h1>
        <p className="text-slate-600 max-w-md mx-auto">
          Seleccioná tu rol. La próxima vez que abras la app vas a entrar directo.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg mt-4">
        <button
          onClick={() => elegirRol('acreedor')}
          className="flex-1 bg-white border-2 border-slate-200 hover:border-green-500 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all group"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💰</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Soy Acreedor</h2>
          <p className="text-sm text-slate-500">Registrar pagos y ver estado de cuenta.</p>
        </button>

        <button
          onClick={() => elegirRol('deudor')}
          className="flex-1 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all group"
        >
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📱</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Soy Deudor</h2>
          <p className="text-sm text-slate-500">Ver mi saldo y pagos acreditados.</p>
        </button>
      </div>
    </div>
  );
}