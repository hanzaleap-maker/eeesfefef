import { useLocalStorage } from './useLocalStorage';
import type { AdminSettings } from '@/types';

const STORAGE_KEY = 'loadup_admin_settings';

const DEFAULT_SETTINGS: AdminSettings = {
  logoSize: 48,
  datenschutzText: `Datenschutzerklärung

Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 

1. Datenerhebung
Wir erheben nur die Daten, die für die Bearbeitung Ihrer Anfrage notwendig sind.

2. Datenspeicherung
Ihre Daten werden sicher gespeichert und nicht an Dritte weitergegeben.

3. Ihre Rechte
Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten.

Bei Fragen zum Datenschutz kontaktieren Sie uns unter loadup313@gmail.com`,
  instagramUrl: '',
  tiktokUrl: '',
  facebookUrl: '',
};

export function useAdminSettings() {
  const [settings, setSettings] = useLocalStorage<AdminSettings>(STORAGE_KEY, DEFAULT_SETTINGS);

  const updateSettings = (updates: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  return {
    settings,
    updateSettings,
  };
}
