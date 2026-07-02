// Le "forme" dei dati che l'app si scambia con Supabase.
// Scrivere questi tipi una volta sola aiuta l'editor a segnalarti errori
// (es. se scrivi report.titolo invece di report.title) prima ancora di
// eseguire l'app.

export type RiskLevel = 'bassa' | 'media' | 'alta';

export interface Report {
  id: string;
  created_at: string;
  category: string; // es. "Scarsa illuminazione", "Persone moleste"...
  risk_level: RiskLevel;
  note: string | null;
  latitude: number;
  longitude: number;
  is_anonymous: boolean;
  confirm_count: number;
}

export interface TrustedContact {
  id: string;
  full_name: string;
  role: string | null; // es. "Mamma", "Coinquilino"
  phone: string | null;
}

export interface Profile {
  id: string;
  display_name: string;
  points: number;
  level_label: string; // es. "Guardiana"
}
