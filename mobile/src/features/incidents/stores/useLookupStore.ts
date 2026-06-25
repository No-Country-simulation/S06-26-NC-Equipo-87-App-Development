import { create } from 'zustand';
import { getRequest } from '../../../shared/api/apiClient';

export interface LookupItem {
  id: number;
  name: string;
  status: string;
}

interface LookupState {
  areas: LookupItem[];
  types: LookupItem[];
  severities: LookupItem[];
  rootCauses: LookupItem[];
  loading: boolean;
  error: string | null;
  fetchActiveLookups: () => Promise<void>;
  fetchRootCauses: () => Promise<void>;
}

export const useLookupStore = create<LookupState>((set) => ({
  areas: [],
  types: [],
  severities: [],
  rootCauses: [],
  loading: false,
  error: null,

  fetchActiveLookups: async () => {
    set({ loading: true, error: null });
    try {
      const [fetchedAreas, fetchedTypes, fetchedSeverities] = await Promise.all([
        getRequest<LookupItem[]>('/api/areas'),
        getRequest<LookupItem[]>('/api/incidents/types'),
        getRequest<LookupItem[]>('/api/incidents/severities'),
      ]);

      set({
        areas: fetchedAreas,
        types: fetchedTypes,
        severities: fetchedSeverities,
        loading: false,
      });
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message || 'Error al cargar los datos de configuración.',
        loading: false,
      });
      throw err;
    }
  },

  fetchRootCauses: async () => {
    set({ loading: true, error: null });
    try {
      const causeData = await getRequest<LookupItem[]>('/api/incidents/root-cause-types');
      set({ rootCauses: causeData, loading: false });
    } catch (err: unknown) {
      set({
        error: (err as Error)?.message || 'Error al obtener los detalles del incidente.',
        loading: false,
      });
      throw err;
    }
  },
}));
