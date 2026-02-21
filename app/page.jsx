'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Inicio() {
  const router = useRouter();
  const [promptInstall, setPromptInstall] = useState(null);
  const [yaInstalada, setYaInstalada] = useState(false);

  useEffect(() => {
    // Si ya eligió rol, redirigir directo
    const rol = localStorage.getItem('rol');
    if (rol === 'deudor') router.replace('/deudor');
    if (rol === 'acreedor') router.replace('/acreedor');

    // Capturar el evento de instalación antes de que Chrome lo muestre solo
    const handler = (e) => {
      e.preventDefault(); // Evita que aparezca el banner automático
      setPromptInstall(e); // Guardamos el evento para usarlo después
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Detectar si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setYaInstalada(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const instalarApp = async () => {
    if (!promptInstall) return;
    promptInstall.prompt(); // Abre el diálogo nativo de instalación
    const { outcome } = await promptInstall.userChoice;
    if (outcome === 'accepted') setPromptInstall(null);
  };

  const elegirRol = (rol) => {
    localStorage.setItem('rol', rol);
    router.push(`/${rol}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Control de Pagos</h1>
        <p className="text-slate-600 max-w-md mx-auto">
          Seleccioná tu rol para ingresar al panel correspondiente.
        </p>
      </div>

      {/* BANNER DE INSTALACIÓN — solo aparece si el navegador lo soporta y no está instalada */}
      {promptInstall && !yaInstalada && (
        <div className="w-full max-w-lg bg-white border-2 border-blue-400 rounded-2xl p-5 shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📲</span>
            <div>
              <p className="font-bold text-slate-800">Instalá la app</p>
              <p className="text-sm text-slate-500">Accedé más rápido desde tu celular</p>
            </div>
          </div>
          <button
            onClick={instalarApp}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shrink-0"
          >
            Instalar
          </button>
        </div>
      )}

      {/* TARJETAS DE ROL */}
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