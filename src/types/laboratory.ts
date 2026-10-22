export type UserRole = 'recepcion' | 'tecnico' | 'quimico' | 'admin';

export type Sexo = 'M' | 'F';

export interface Patient {
  id: string;
  nombre: string;
  edad: number;
  sexo: Sexo;
  fechaNacimiento: string;
  telefono: string; // WhatsApp obligatorio para envío digital
  email?: string;
  medicoTratante?: string;
  direccion?: string;
  notas?: string;
  fechaRegistro: string;
}

export interface ParametroEstudio {
  id: string;
  nombre: string;
  unidad: string;
  rangoMinH: number;
  rangoMaxH: number;
  rangoMinM: number;
  rangoMaxM: number;
  valorPorDefecto?: string;
  esTexto?: boolean; // Para parámetros cualitativos como aspecto, color, bacterias
  opcionesCualitativas?: string[];
}

export interface Estudio {
  id: string;
  codigo: string;
  nombre: string;
  categoria: 'Hematología' | 'Química Clínica' | 'Urianálisis' | 'Inmunología' | 'Coprología' | 'Perfiles';
  tiempoEntregaHoras: number;
  precio: number;
  muestraRequerida: string; // ej. "Sangre venosa con EDTA", "Suero sanguíneo", "Primera orina de la mañana"
  tipoTubo: string; // ej. "Tubo Tapón Lila (EDTA)", "Tubo Tapón Rojo (Sin anticoagulante)", "Tubo Tapón Amarillo (Gel separador)", "Frasco estéril"
  colorTuboHex: string;
  parametros: ParametroEstudio[];
}

export type MuestraStatus = 'pendiente' | 'tomada' | 'en_proceso' | 'rechazada';

export interface OrdenEstudioItem {
  estudioId: string;
  codigo: string;
  nombre: string;
  precio: number;
  tipoTubo: string;
  colorTuboHex: string;
  muestraRequerida: string;
  estatusMuestra: MuestraStatus;
  motivoRechazo?: string;
  fechaToma?: string;
}

export type OrdenStatus = 
  | 'pendiente_pago' 
  | 'pendiente_toma' 
  | 'muestra_tomada' 
  | 'en_analisis' 
  | 'validado' 
  | 'concluido';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia';

export interface ResultadoValor {
  parametroId: string;
  nombreParametro: string;
  valor: string;
  unidad: string;
  rangoReferencia: string;
  fueraDeRango: boolean;
  notas?: string;
}

export interface Orden {
  id: string;
  folio: string; // ej. ORD-2026-001
  pacienteId: string;
  paciente: Patient;
  medicoTratante: string;
  estudios: OrdenEstudioItem[];
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: MetodoPago;
  estatusPago: 'pagado' | 'pendiente';
  estatusGeneral: OrdenStatus;
  fechaCreacion: string;
  fechaTomaMuestra?: string;
  fechaValidacion?: string;
  quimicoValidador?: {
    nombre: string;
    cedula: string;
  };
  resultados: Record<string, ResultadoValor>; // Key = `${estudioId}_${parametroId}`
  fechaEntregaWhatsApp?: string;
  logWhatsApp?: {
    enviado: boolean;
    fecha: string;
    modo: 'link' | 'api';
    telefono: string;
    mensaje: string;
  };
}

export interface WhatsAppConfig {
  plantillaMensaje: string;
  modoEnvio: 'link' | 'api';
  apiUrl?: string;
  apiKey?: string;
  telefonoContacto: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  tableName: string;
}

export interface LabConfig {
  nombreLaboratorio: string;
  subtitulo: string;
  direccion: string;
  telefono: string;
  email: string;
  rfc: string;
  quimicoPredeterminado: string;
  cedulaProfesional: string;
  whatsapp: WhatsAppConfig;
  supabase: SupabaseConfig;
}

export interface CorteCajaItem {
  id: string;
  folio: string;
  paciente: string;
  total: number;
  metodoPago: MetodoPago;
  hora: string;
}
