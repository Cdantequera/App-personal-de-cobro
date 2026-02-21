export function useAlerta() {
  const reproducir = () => {
    const audio = new Audio('/alerta.mp3');
    audio.play().catch(() => {}); // El catch evita errores si el navegador bloquea el audio
  };
  return { reproducir };
}