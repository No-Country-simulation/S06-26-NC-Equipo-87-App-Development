import { create } from 'zustand';
import { getRequest, postRequest, API_BASE_URL } from '../../../shared/api/apiClient';
import { getToken } from '../../../shared/auth/tokenService';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';

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
  reportedByEmployeeId?: string;
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
  connection: HubConnection | null;
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
  startSignalR: () => Promise<void>;
  stopSignalR: () => Promise<void>;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: [],
  selectedIncident: null,
  technicians: [],
  loading: false,
  error: null,
  connection: null,

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

  startSignalR: async () => {
    const { connection } = useIncidentStore.getState();
    if (connection) {
      return;
    }

    const newConnection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/incidents`, {
        accessTokenFactory: async () => {
          const token = await getToken();
          return token || '';
        }
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();

    newConnection.on('IncidentCreated', async (event: { incidentId?: string; IncidentId?: string }) => {
      const id = event.incidentId || event.IncidentId;
      console.log('[SignalR] IncidentCreated event received. Incident ID:', id);
      if (!id) return;
      try {
        console.log('[SignalR] Fetching detail for incident:', id);
        const fullIncident = await getRequest<BackendIncidentDetail>(`/api/incidents/${id}`);
        console.log('[SignalR] Fetched detail successfully:', fullIncident);
        set((state) => {
          const exists = state.incidents.some((i) => i.incidentId === fullIncident.incidentId);
          console.log('[SignalR] Does incident already exist in store list?', exists);
          if (exists) {
            return {};
          }
          const newList = [fullIncident, ...state.incidents];
          console.log('[SignalR] Prepending new incident. Old count:', state.incidents.length, 'New count:', newList.length);
          return { incidents: newList };
        });
      } catch (err) {
        console.error('[SignalR] Error fetching new incident detail for real-time update:', err);
      }
    });

    newConnection.on('IncidentStatusChanged', async (event: { incidentId?: string; IncidentId?: string; status?: string; Status?: string }) => {
      const id = event.incidentId || event.IncidentId;
      const status = event.status || event.Status || '';
      console.log('[SignalR] IncidentStatusChanged event received. Incident ID:', id, 'New status:', status);
      if (!id) return;
      try {
        console.log('[SignalR] Fetching updated detail for incident:', id);
        const fullIncident = await getRequest<BackendIncidentDetail>(`/api/incidents/${id}`);
        console.log('[SignalR] Fetched updated detail successfully:', fullIncident);
        set((state) => {
          let found = false;
          const updatedIncidents = state.incidents.map((incident) => {
            if (incident.incidentId === id) {
              found = true;
              return fullIncident;
            }
            return incident;
          });
          console.log('[SignalR] Updated incidents list. Found in list?', found);
          const finalIncidents = found ? updatedIncidents : [fullIncident, ...state.incidents];
          if (!found) {
            console.log('[SignalR] Incident not found in list. Prepending it. New count:', finalIncidents.length);
          }
          const updatedSelected =
            state.selectedIncident?.incidentId === id
              ? fullIncident
              : state.selectedIncident;
          console.log('[SignalR] Updated selectedIncident. Matches active detail?', state.selectedIncident?.incidentId === id);
          return {
            incidents: finalIncidents,
            selectedIncident: updatedSelected,
          };
        });
      } catch (err) {
        console.warn('[SignalR] Fetching incident detail failed, falling back to manual status update. Error:', err);
        set((state) => {
          let found = false;
          const updatedIncidents = state.incidents.map((incident) => {
            if (incident.incidentId === id) {
              found = true;
              return { ...incident, status: status };
            }
            return incident;
          });
          console.log('[SignalR] (Fallback) Updated incidents list. Found in list?', found);
          const updatedSelected =
            state.selectedIncident?.incidentId === id
              ? { ...state.selectedIncident, status: status }
              : state.selectedIncident;
          console.log('[SignalR] (Fallback) Updated selectedIncident. Matches active detail?', state.selectedIncident?.incidentId === id);
          return {
            incidents: updatedIncidents,
            selectedIncident: updatedSelected,
          };
        });
      }
    });

    try {
      await newConnection.start();
      set({ connection: newConnection });
    } catch (err) {
      console.error('SignalR start failed:', err);
    }
  },

  stopSignalR: async () => {
    const { connection } = useIncidentStore.getState();
    if (connection) {
      try {
        await connection.stop();
      } catch (err) {
        console.error('SignalR stop error:', err);
      }
      set({ connection: null });
    }
  },
}));
