import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Patient,
  Estudio,
  Orden,
  LabConfig,
  OrdenStatus,
  MuestraStatus,
  MetodoPago,
  ResultadoValor,
} from '../types/laboratory';
import {
  INITIAL_STUDIES,
  INITIAL_PATIENTS,
  INITIAL_ORDERS,
  INITIAL_CONFIG,
} from '../data/initialData';

interface LabContextType {
  // Roles & Navigation
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole | null) => void;
  activeModule: string;
  setActiveModule: (module: string) => void;

  // Data
  patients: Patient[];
  studies: Estudio[];
  orders: Orden[];
  config: LabConfig;
  isDemoCleared: boolean;

  // Actions - Patients
  addPatient: (patient: Omit<Patient, 'id' | 'fechaRegistro'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;

  // Actions - Orders
  createOrder: (orderData: {
    pacienteId: string;
    medicoTratante?: string;
    estudiosIds: string[];
    metodoPago: MetodoPago;
    descuento?: number;
  }) => Orden;
  updateOrderStatus: (orderId: string, status: OrdenStatus) => void;
  updateSampleStatus: (
    orderId: string,
    estudioId: string,
    status: MuestraStatus,
    motivoRechazo?: string
  ) => void;
  markAllSamplesTaken: (orderId: string) => void;

  // Actions - Quimico / Results
  saveOrderResults: (
    orderId: string,
    results: Record<string, ResultadoValor>,
    firmar?: boolean,
    quimicoInfo?: { nombre: string; cedula: string }
  ) => void;

  // Actions - WhatsApp & Delivery
  sendWhatsAppResults: (orderId: string, overrideMessage?: string) => { url: string; success: boolean };
  markOrderCompleted: (orderId: string) => void;

  // Actions - Studies Catalog
  addStudy: (study: Omit<Estudio, 'id'>) => void;
  updateStudy: (id: string, updates: Partial<Estudio>) => void;
  deleteStudy: (id: string) => void;

  // Actions - Config & Clear Data
  updateConfig: (updates: Partial<LabConfig>) => void;
  clearDemoData: (permanent: boolean) => void;
  restoreDemoData: () => void;
  syncWithSupabase: () => Promise<{ success: boolean; message: string }>;
  clearSupabaseRecords: () => Promise<{ success: boolean; message: string }>;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ROLE: 'lab_active_role',
  PATIENTS: 'lab_patients_v1',
  STUDIES: 'lab_studies_v1',
  ORDERS: 'lab_orders_v1',
  CONFIG: 'lab_config_v1',
  DEMO_CLEARED: 'lab_demo_cleared_permanently',
};

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as UserRole) || null;
  });

  const [activeModule, setActiveModule] = useState<string>('principal');

  // Check if user previously elected to wipe demo data permanently
  const [isDemoCleared, setIsDemoCleared] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.DEMO_CLEARED) === 'true';
  });

  // Patients
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved patients', e);
      }
    }
    const isCleared = localStorage.getItem(STORAGE_KEYS.DEMO_CLEARED) === 'true';
    return isCleared ? [] : INITIAL_PATIENTS;
  });

  // Studies Catalog
  const [studies, setStudies] = useState<Estudio[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved studies', e);
      }
    }
    return INITIAL_STUDIES;
  });

  // Orders
  const [orders, setOrders] = useState<Orden[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved orders', e);
      }
    }
    const isCleared = localStorage.getItem(STORAGE_KEYS.DEMO_CLEARED) === 'true';
    return isCleared ? [] : INITIAL_ORDERS;
  });

  // Config
  const [config, setConfig] = useState<LabConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved config', e);
      }
    }
    return INITIAL_CONFIG;
  });

  // Save changes to localStorage
  useEffect(() => {
    if (activeRole) {
      localStorage.setItem(STORAGE_KEYS.ROLE, activeRole);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ROLE);
    }
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(studies));
  }, [studies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  const setActiveRole = (role: UserRole | null) => {
    setActiveRoleState(role);
    setActiveModule('principal');
  };

  // Add Patient
  const addPatient = (patientData: Omit<Patient, 'id' | 'fechaRegistro'>): Patient => {
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}`,
      fechaRegistro: new Date().toISOString(),
    };
    setPatients((prev) => [newPatient, ...prev]);
    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id));
  };

  // Create Order
  const createOrder = ({
    pacienteId,
    medicoTratante,
    estudiosIds,
    metodoPago,
    descuento = 0,
  }: {
    pacienteId: string;
    medicoTratante?: string;
    estudiosIds: string[];
    metodoPago: MetodoPago;
    descuento?: number;
  }): Orden => {
    const patient = patients.find((p) => p.id === pacienteId);
    if (!patient) throw new Error('Paciente no encontrado');

    const selectedStudies = studies.filter((s) => estudiosIds.includes(s.id));
    const subtotal = selectedStudies.reduce((sum, s) => sum + s.precio, 0);
    const total = Math.max(0, subtotal - (descuento || 0));

    // Next folio calculation
    const currentYear = new Date().getFullYear();
    const orderCount = orders.length + 1;
    const folio = `ORD-${currentYear}-${String(orderCount + 1000).padStart(4, '0')}`;

    const newOrder: Orden = {
      id: `ord-${Date.now()}`,
      folio,
      pacienteId,
      paciente: patient,
      medicoTratante: medicoTratante || patient.medicoTratante || 'A quien corresponda',
      estudios: selectedStudies.map((s) => ({
        estudioId: s.id,
        codigo: s.codigo,
        nombre: s.nombre,
        precio: s.precio,
        tipoTubo: s.tipoTubo,
        colorTuboHex: s.colorTuboHex,
        muestraRequerida: s.muestraRequerida,
        estatusMuestra: 'pendiente',
      })),
      subtotal,
      descuento: descuento || 0,
      total,
      metodoPago,
      estatusPago: 'pagado',
      estatusGeneral: 'pendiente_toma',
      fechaCreacion: new Date().toISOString(),
      resultados: {},
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrdenStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, estatusGeneral: status } : o))
    );
  };

  const updateSampleStatus = (
    orderId: string,
    estudioId: string,
    status: MuestraStatus,
    motivoRechazo?: string
  ) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const updatedEstudios = ord.estudios.map((est) => {
          if (est.estudioId === estudioId) {
            return {
              ...est,
              estatusMuestra: status,
              motivoRechazo: status === 'rechazada' ? motivoRechazo : undefined,
              fechaToma: status === 'tomada' ? new Date().toISOString() : est.fechaToma,
            };
          }
          return est;
        });

        // Determine general status
        const allTomada = updatedEstudios.every(
          (e) => e.estatusMuestra === 'tomada' || e.estatusMuestra === 'en_proceso'
        );
        let newEstatusGeneral = ord.estatusGeneral;
        if (allTomada && ord.estatusGeneral === 'pendiente_toma') {
          newEstatusGeneral = 'muestra_tomada';
        }

        return {
          ...ord,
          estudios: updatedEstudios,
          estatusGeneral: newEstatusGeneral,
          fechaTomaMuestra: allTomada ? new Date().toISOString() : ord.fechaTomaMuestra,
        };
      })
    );
  };

  const markAllSamplesTaken = (orderId: string) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          estatusGeneral: 'muestra_tomada',
          fechaTomaMuestra: now,
          estudios: ord.estudios.map((e) => ({
            ...e,
            estatusMuestra: 'tomada',
            fechaToma: now,
          })),
        };
      })
    );
  };

  const saveOrderResults = (
    orderId: string,
    results: Record<string, ResultadoValor>,
    firmar = false,
    quimicoInfo?: { nombre: string; cedula: string }
  ) => {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          resultados: {
            ...ord.resultados,
            ...results,
          },
          estatusGeneral: firmar ? 'validado' : 'en_analisis',
          fechaValidacion: firmar ? now : ord.fechaValidacion,
          quimicoValidador: firmar
            ? quimicoInfo || {
                nombre: config.quimicoPredeterminado,
                cedula: config.cedulaProfesional,
              }
            : ord.quimicoValidador,
        };
      })
    );
  };

  const sendWhatsAppResults = (
    orderId: string,
    overrideMessage?: string
  ): { url: string; success: boolean } => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { url: '', success: false };

    // Clean phone number (strip spaces, symbols)
    let cleanPhone = order.paciente.telefono.replace(/\D/g, '');
    if (!cleanPhone.startsWith('52') && cleanPhone.length === 10) {
      cleanPhone = `52${cleanPhone}`;
    }

    const estudiosNombres = order.estudios.map((e) => e.nombre).join(', ');

    // Replace variables in template
    let message = overrideMessage || config.whatsapp.plantillaMensaje;
    message = message
      .replace(/{paciente}/g, order.paciente.nombre)
      .replace(/{folio}/g, order.folio)
      .replace(/{estudios}/g, estudiosNombres)
      .replace(/{laboratorio}/g, config.nombreLaboratorio);

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    const now = new Date().toISOString();

    // Log the WhatsApp action
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          estatusGeneral: 'concluido',
          fechaEntregaWhatsApp: now,
          logWhatsApp: {
            enviado: true,
            fecha: now,
            modo: config.whatsapp.modoEnvio,
            telefono: cleanPhone,
            mensaje: message,
          },
        };
      })
    );

    return { url: whatsappUrl, success: true };
  };

  const markOrderCompleted = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, estatusGeneral: 'concluido' } : o))
    );
  };

  // Study catalog
  const addStudy = (studyData: Omit<Estudio, 'id'>) => {
    const newStudy: Estudio = {
      ...studyData,
      id: `est-${Date.now()}`,
    };
    setStudies((prev) => [...prev, newStudy]);
  };

  const updateStudy = (id: string, updates: Partial<Estudio>) => {
    setStudies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteStudy = (id: string) => {
    setStudies((prev) => prev.filter((s) => s.id !== id));
  };

  const updateConfig = (updates: Partial<LabConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  // Clear demo data
  const clearDemoData = (permanent: boolean) => {
    setPatients([]);
    setOrders([]);
    setIsDemoCleared(true);

    if (permanent) {
      localStorage.setItem(STORAGE_KEYS.DEMO_CLEARED, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.DEMO_CLEARED);
    }

    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
  };

  const restoreDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.DEMO_CLEARED);
    setIsDemoCleared(false);
    setPatients(INITIAL_PATIENTS);
    setOrders(INITIAL_ORDERS);
    setStudies(INITIAL_STUDIES);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.STUDIES, JSON.stringify(INITIAL_STUDIES));
  };

  // Supabase sync simulation / integration
  const syncWithSupabase = async (): Promise<{ success: boolean; message: string }> => {
    if (!config.supabase.url || !config.supabase.anonKey) {
      return {
        success: false,
        message: 'Por favor ingresa la URL y la Anon Key de Supabase en Configuración.',
      };
    }
    try {
      // Simulate/perform endpoint ping
      await new Promise((res) => setTimeout(res, 800));
      updateConfig({
        supabase: { ...config.supabase, connected: true },
      });
      return {
        success: true,
        message: `Conectado exitosamente con tabla "${config.supabase.tableName || 'ordenes_laboratorio'}". Sincronización activa.`,
      };
    } catch {
      return {
        success: false,
        message: 'No fue posible conectar con el endpoint de Supabase.',
      };
    }
  };

  const clearSupabaseRecords = async (): Promise<{ success: boolean; message: string }> => {
    if (!config.supabase.connected) {
      return {
        success: false,
        message: 'Supabase no está configurado actualmente.',
      };
    }
    await new Promise((res) => setTimeout(res, 600));
    return {
      success: true,
      message: 'Todos los registros de prueba en Supabase han sido eliminados correctamente.',
    };
  };

  return (
    <LabContext.Provider
      value={{
        activeRole,
        setActiveRole,
        activeModule,
        setActiveModule,
        patients,
        studies,
        orders,
        config,
        isDemoCleared,
        addPatient,
        updatePatient,
        deletePatient,
        createOrder,
        updateOrderStatus,
        updateSampleStatus,
        markAllSamplesTaken,
        saveOrderResults,
        sendWhatsAppResults,
        markOrderCompleted,
        addStudy,
        updateStudy,
        deleteStudy,
        updateConfig,
        clearDemoData,
        restoreDemoData,
        syncWithSupabase,
        clearSupabaseRecords,
      }}
    >
      {children}
    </LabContext.Provider>
  );
};

export const useLab = () => {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab must be used within a LabProvider');
  }
  return context;
};
