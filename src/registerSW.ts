import { registerSW } from 'virtual:pwa-register';

export function setupServiceWorker(): void {
  registerSW({
    immediate: true,
    onRegistered(registration) {
      if (registration) {
        console.info('Kizuna PWA service worker kayıtlı.');
      }
    },
    onRegisterError(error) {
      console.error('Service worker kaydı başarısız:', error);
    },
  });
}
