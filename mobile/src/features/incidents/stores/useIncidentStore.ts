import { create } from 'zustand';
import { getRequest, postRequest } from '../../../shared/api/apiClient';

export interface IncidentStatusHistoryDto {
  historyId: number;
  previousStatus: string | null;
  newStatus: string;
  transitionNotes: string | null;
  changedByUserId: string;
  changedByUserFullName: string;
  changedDate: string;
}

export interface BackendIncidentDetail {
  incidentId: string;
  description: string;
  areaId: number;
  areaName: string;
  incidentTypeId: number;
  incidentTypeName: string;
  severityTypeId: number;
  severityTypeName: string;
  status: string;
  reportedByUserId: string;
  reportedDate: string;
  history?: IncidentStatusHistoryDto[];
}

export interface BackendTechnician {
  userId: string;
  firstName: string;
  lastName: string;
  specialityId: number | null;
  specialityName: string;
  isFree: boolean;
}

interface IncidentState {
  incidents: BackendIncidentDetail[];
  selectedIncident: BackendIncidentDetail | null;
  technicians: BackendTechnician[];
  loading: boolean;
  error: string | null;
  fetchOperatorIncidents: (userId: string, sinceDate: string) => Promise<BackendIncidentDetail[]>;
  fetchSupervisorIncidents: () => Promise<BackendIncidentDetail[]>;
  fetchIncidentDetail: (incidentId: string) => Promise<BackendIncidentDetail>;
  createIncident: (incidentData: {
    AreaId?: number;
    IncidentTypeId?: number;
    SeverityTypeId?: number;
    Description: string;
    DeviceTimestamp: string;
  }) => Promise<{ incidentId: string }>;
  assignTechnician: (incidentId: string, technicianId: string) => Promise<void>;
  startAttention: (incidentId: string) => Promise<void>;
  closeIncident: (incidentId: string, solutionApplied: string, rootCauseTypeId: number) => Promise<void>;
  fetchTechnicians: (areaId: number, incidentTypeId: number) => Promise<BackendTechnician[]>;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: [],
  selectedIncident: null,
  technicians: [],
  loading: false,
  error: null,

  fetchOperatorIncidents: async (userId: string, sinceDate: string) => {
    set({ loading: true, error: null });
    try {
      const data = await getRequest<BackendIncidentDetail[]>(
        `/api/incidents?reportedByUserId=${encodeURIComponent(userId)}&since=${encodeURIComponent(sinceDate)}`
      );
      set({ incidents: data, loading: false });
      return data;
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message || 'Error al obtener los incidentes.',
        loading: false,
      });
      throw err;
    }
  },

  fetchSupervisorIncidents: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getRequest<BackendIncidentDetail[]>('/api/incidents');
      set({ incidents: data, loading: false });
      return data;
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message || 'Error al obtener los incidentes.',
        loading: false,
      });
      throw err;
    }
  },

  fetchIncidentDetail: async (incidentId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await getRequest<BackendIncidentDetail>(`/api/incidents/${incidentId}`);
      set({ selectedIncident: data, loading: false });
      return data;
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message || 'Error al obtener los detalles del incidente.',
        loading: false,
      });
      throw err;
    }
  },

  createIncident: async (incidentData) => {
    set({ loading: true, error: null });
    try {
      const response = await postRequest<typeof incidentData, { incidentId: string }>('/api/incidents', incidentData);
      set({ loading: false });
      return response;
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message || 'Error al reportar el incidente.',
        loading: false,
      });
      throw err;
    }
  },

  assignTechnician: async (incidentId, technicianId) => {
    set({ loading: true, error: null });
    try {
      await postRequest<{ technicianId: string }, { message: string }>(`/api/incidents/${incidentId}/assign`, {
        technicianId,
      });
      set({ loading: false });
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message || 'Error al asignar el técnico.',
        loading: false,
      });
      throw err;
    }
  },

  startAttention: async (incidentId) => {
    set({ loading: true, error: null });
    try {
      await postRequest<Record<string, never>, { message: string }>(`/api/incidents/${incidentId}/start`, {});
      set({ loading: false });
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message || 'Error al iniciar la atención del incidente.',
        loading: false,
      });
      throw err;
    }
  },

  closeIncident: async (incidentId, solutionApplied, rootCauseTypeId) => {
    set({ loading: true, error: null });
    try {
      await postRequest<{ solutionApplied: string; rootCauseTypeId: number }, { message: string }>(
        `/api/incidents/${incidentId}/close`,
        {
          solutionApplied,
          rootCauseTypeId,
        }
      );
      set({ loading: false });
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message || 'Error al cerrar el incidente.',
        loading: false,
      });
      throw err;
    }
  },

  fetchTechnicians: async (areaId, incidentTypeId) => {
    set({ loading: true, error: null });
    try {
      const data = await getRequest<BackendTechnician[]>(
        `/api/technicians?areaId=${areaId}&incidentTypeId=${incidentTypeId}`
      );
      set({ technicians: data, loading: false });
      return data;
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message || 'Error al obtener los técnicos.',
        loading: false,
        technicians: [],
      });
      throw err;
    }
  },
}));
