'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [rol, setRol] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    setRol(localStorage.getItem('rol'));
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('rol');
    setRol(null);
    window.location.href = '/';
  };

  return (
    <nav className="w-full bg-[#0d1133] border-b border-[#3a4499]/40 shadow-lg shadow-black/30">
      <div className="max-w-4xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">

        {/* Logo / Nombre */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl">💰</span>
          <span className="font-bold text-white tracking-wide group-hover:text-neon transition-colors">
            Control de Pagos
          </span>
        </Link>

        {/* Derecha: links o badge de rol */}
        <div className="flex items-center gap-3">

          {/* Si NO tiene rol: muestra los dos links */}
          {!rol && (
            <>
              <Link
                href="/acreedor"
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-all
                  ${pathname === '/acreedor'
                    ? 'bg-naranja/20 text-naranja border border-naranja/40'
                    : 'text-[#6B7FD4] hover:text-white hover:bg-white/5'
                  }`}
              >
                Acreedor
              </Link>
              <Link
                href="/deudor"
                className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-all
                  ${pathname === '/deudor'
                    ? 'bg-neon/20 text-neon border border-neon/40'
                    : 'text-[#6B7FD4] hover:text-white hover:bg-white/5'
                  }`}
              >
                Deudor
              </Link>
            </>
          )}

          {/* Si TIENE rol: muestra badge y botón de salir */}
          {rol && (
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full border
                ${rol === 'acreedor'
                  ? 'bg-naranja/10 text-naranja border-naranja/30'
                  : 'bg-neon/10 text-neon border-neon/30'
                }`}>
                {rol === 'acreedor' ? '💰 Acreedor' : '📱 Deudor'}
              </span>

              <button
                onClick={cerrarSesion}
                className="text-xs text-[#6B7FD4] hover:text-white transition-colors"
                title="Cambiar de rol"
              >
                Salir
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}