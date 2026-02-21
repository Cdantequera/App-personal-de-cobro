'use client'; // Necesario en Next.js para usar hooks de cliente como usePathname

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-900 p-4 text-white flex justify-center gap-8 shadow-md">
      <Link 
        href="/acreedor" 
        className={`font-semibold transition-colors ${
          pathname === '/acreedor' 
            ? 'underline decoration-2 underline-offset-4 text-green-400' 
            : 'hover:text-gray-300'
        }`}
      >
        Panel Acreedor
      </Link>
      <Link 
        href="/deudor" 
        className={`font-semibold transition-colors ${
          pathname === '/deudor' 
            ? 'underline decoration-2 underline-offset-4 text-green-400' 
            : 'hover:text-gray-300'
        }`}
      >
        Mi Deuda
      </Link>
    </nav>
  );
}