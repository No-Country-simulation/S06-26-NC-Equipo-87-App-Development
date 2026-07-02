export interface CauseData {
  label: string;
  count: number;
}

export interface AreaData {
  name: string;
  count: number;
}

export interface TrendData {
  week: string;
  count: number;
}

export interface TechnicianData {
  name: string;
  specialty: string;
  ticketsResolved: number;
  avgResolutionTime: string;
}

export const frequentCausesData: CauseData[] = [
  { label: 'Falla o desgaste de componente', count: 18 },
  { label: 'Error de operación', count: 11 },
  { label: 'Falta de mantenimiento', count: 9 },
  { label: 'Material o insumo defectuoso', count: 7 },
  { label: 'Causa no determinada', count: 5 }
];

export const areaIncidentsData: AreaData[] = [
  { name: 'Zona Norte', count: 24 },
  { name: 'Linea 3', count: 12 },
  { name: 'Almacén', count: 7 },
  { name: 'Empaque', count: 4 }
];

export const mechanicalFailsTrendData: TrendData[] = [
  { week: 'Sem 1', count: 8 },
  { week: 'Sem 2', count: 14 },
  { week: 'Sem 3', count: 11 },
  { week: 'Sem 4', count: 12 }
];

export const technicianPerformanceData: TechnicianData[] = [
  { name: 'Ramírez #042', specialty: 'Mecánico', ticketsResolved: 18, avgResolutionTime: '01:45' },
  { name: 'González #107', specialty: 'Calidad', ticketsResolved: 12, avgResolutionTime: '00:52' },
  { name: 'López #089', specialty: 'Seguridad', ticketsResolved: 9, avgResolutionTime: '02:10' },
  { name: 'Morales #031', specialty: 'General', ticketsResolved: 5, avgResolutionTime: '01:20' }
];
