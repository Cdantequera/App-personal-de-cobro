import Navbar from './components/Navbar';
import Footer from './components/footer';
import RegisterSW from './components/RegisterSW';
import '@/app/globals.css';

export const metadata = {
  title: 'Control de Pagos',
  description: 'App para gestión de saldos y pagos mensuales',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
        <head>
    <link rel="icon" href="/favicon.ico" type="image/svg+xml" />
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#1F2358" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Pagos" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
  </head>
      <body className="bg-slate-50 min-h-screen text-slate-800 font-sans">
        <RegisterSW />
        <Navbar />
        <main className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </main>
        <Footer />
      </body>
      

    </html>
  );
}