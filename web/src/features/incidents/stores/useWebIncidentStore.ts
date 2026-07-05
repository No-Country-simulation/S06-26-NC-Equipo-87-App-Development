import { create } from 'zustand';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { API_BASE_URL, getRequest, type ApiError } from '../../../shared/api/apiClient';
import { getCachedAreas } from '../../../shared/api/areasCache';
import { getToken } from '../../../shared/auth/tokenService';
import { type Incident } from '../components/IncidentCard';

interface IncidentListResponse {
  items: Incident[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  openCount: number;
  assignedCount: number;
  inProgressCount: number;
  closedCount: number;
}

interface IncidentState {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  statusFilter: string;
  severityFilter: string;
  areaFilter: string;
  timeFilter: string;
  currentPage: number;
  totalItems: number;
  availableAreas: string[];
  openCount: number;
  assignedCount: number;
  inProgressCount: number;
  closedCount: number;

  setStatusFilter: (status: string) => void;
  setSeverityFilter: (severity: string) => void;
  setAreaFilter: (area: string) => void;
  setTimeFilter: (time: string) => void;
  setCurrentPage: (page: number) => void;

  fetchAreas: () => Promise<void>;
  fetchIncidents: () => Promise<void>;
  fetchAllIncidentsForExport: (filters?: { status?: string; area?: string; severity?: string; time?: string }) => Promise<Incident[]>;
  connection: HubConnection | null;
  startSignalR: () => Promise<void>;
  stopSignalR: () => Promise<void>;
}

export const useWebIncidentStore = create<IncidentState>((set, get) => ({
  incidents: [],
  loading: false,
  error: null,
  statusFilter: 'All',
  severityFilter: 'All',
  areaFilter: 'All',
  timeFilter: 'week',
  currentPage: 1,
  totalItems: 0,
  availableAreas: [],
  openCount: 0,
  assignedCount: 0,
  inProgressCount: 0,
  closedCount: 0,
  connection: null,

  setStatusFilter: (statusFilter) => {
    set({ statusFilter, currentPage: 1 });
    get().fetchIncidents();
  },

  setSeverityFilter: (severityFilter) => {
    set({ severityFilter, currentPage: 1 });
    get().fetchIncidents();
  },

  setAreaFilter: (areaFilter) => {
    set({ areaFilter, currentPage: 1 });
    get().fetchIncidents();
  },

  setTimeFilter: (timeFilter) => {
    set({ timeFilter, currentPage: 1 });
    get().fetchIncidents();
  },

  setCurrentPage: (currentPage) => {
    set({ currentPage });
    get().fetchIncidents();
  },

  fetchAreas: async () => {
    try {
      const data = await getCachedAreas();
      set({ availableAreas: data });
    } catch (err: unknown) {
      console.error(err);
    }
  },

  fetchIncidents: async () => {
    set({ loading: true, error: null });
    const { currentPage, statusFilter, areaFilter, severityFilter, timeFilter } = get();
    try {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        pageSize: '10',
        status: statusFilter,
        area: areaFilter,
        severity: severityFilter,
      };

      if (timeFilter === 'week') {
        params.since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (timeFilter === 'month') {
        params.since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (timeFilter === 'year') {
        params.since = new Date(new Date().getFullYear(), 0, 1).toISOString();
      }

      const queryParams = new URLSearchParams(params);
      const data = await getRequest<IncidentListResponse>(`/api/incidents?${queryParams.toString()}`);
      set({
        incidents: data.items || [],
        totalItems: data.totalItems || 0,
        openCount: data.openCount || 0,
        assignedCount: data.assignedCount || 0,
        inProgressCount: data.inProgressCount || 0,
        closedCount: data.closedCount || 0,
      });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      set({ error: apiErr.message || 'Error al cargar incidentes.' });
    } finally {
      set({ loading: false });
    }
  },

  fetchAllIncidentsForExport: async (filters?: { status?: string; area?: string; severity?: string; time?: string }): Promise<Incident[]> => {
    const state = get();
    const status = filters?.status ?? state.statusFilter;
    const area = filters?.area ?? state.areaFilter;
    const severity = filters?.severity ?? state.severityFilter;
    const time = filters?.time ?? state.timeFilter;

    try {
      const params: Record<string, string> = {
        page: '1',
        pageSize: '10000',
        status: status,
        area: area,
        severity: severity,
      };

      if (time === 'week' || time === 'current') {
        params.since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (time === 'month') {
        params.since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (time === 'year') {
        params.since = new Date(new Date().getFullYear(), 0, 1).toISOString();
      }

      const queryParams = new URLSearchParams(params);
      const data = await getRequest<IncidentListResponse>(`/api/incidents?${queryParams.toString()}`);
      return data.items || [];
    } catch (err: unknown) {
      console.error(err);
      return [];
    }
  },

  startSignalR: async () => {
    const { connection } = get();
    if (connection) {
      console.log('[SignalR] Connection already exists');
      return;
    }

    console.log('[SignalR] Creating new connection...');
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/incidents`, {
        accessTokenFactory: async () => {
          const token = await getToken();
          console.log('[SignalR] Access token requested, token length:', token?.length ?? 0);
          return token || '';
        }
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build();

    newConnection.on('IncidentCreated', async (event) => {
      console.log('[SignalR] IncidentCreated event received:', event);
      await get().fetchIncidents();
      const { useWebDashboardStore } = await import('../../dashboard/stores/useWebDashboardStore');
      await useWebDashboardStore.getState().loadDashboardData();
    });

    newConnection.on('IncidentStatusChanged', async (event) => {
      console.log('[SignalR] IncidentStatusChanged event received:', event);
      await get().fetchIncidents();
      const { useWebDashboardStore } = await import('../../dashboard/stores/useWebDashboardStore');
      await useWebDashboardStore.getState().loadDashboardData();
    });

    try {
      console.log('[SignalR] Starting connection...');
      await newConnection.start();
      console.log('[SignalR] Connection established successfully');
      set({ connection: newConnection });
    } catch (err) {
      console.error('[SignalR] Connection error:', err);
    }
  },

  stopSignalR: async () => {
    const { connection } = get();
    if (!connection) {
      return;
    }
    try {
      await connection.stop();
    } catch (err) {
      console.error(err);
    } finally {
      set({ connection: null });
    }
  },
}));
