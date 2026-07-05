import { create } from 'zustand';
import { act } from 'react';
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

let activeLookupsPromise: Promise<[LookupItem[], LookupItem[], LookupItem[]]> | null = null;
let rootCausesPromise: Promise<LookupItem[]> | null = null;

export const useLookupStore = create<LookupState>((set, get) => ({
  areas: [],
  types: [],
  severities: [],
  rootCauses: [],
  loading: false,
  error: null,

  fetchActiveLookups: async () => {
    const { areas, types, severities } = get();
    if (areas.length > 0 && types.length > 0 && severities.length > 0) {
      return;
    }

    set({ loading: true, error: null });

    try {
      if (!activeLookupsPromise) {
        activeLookupsPromise = Promise.all([
          getRequest<LookupItem[]>('/api/areas'),
          getRequest<LookupItem[]>('/api/incidents/types'),
          getRequest<LookupItem[]>('/api/incidents/severities'),
        ]).catch((err) => {
          activeLookupsPromise = null;
          throw err;
        });
      }

      const [fetchedAreas, fetchedTypes, fetchedSeverities] = await activeLookupsPromise;

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
    const { rootCauses } = get();
    if (rootCauses.length > 0) {
      return;
    }

    set({ loading: true, error: null });

    try {
      if (!rootCausesPromise) {
        rootCausesPromise = getRequest<LookupItem[]>('/api/incidents/root-cause-types')
          .catch((err) => {
            rootCausesPromise = null;
            throw err;
          });
      }

      const causeData = await rootCausesPromise;
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

if (typeof afterEach === 'function') {
  afterEach(() => {
    activeLookupsPromise = null;
    rootCausesPromise = null;
    const reset = () => {
      useLookupStore.setState({
        areas: [],
        types: [],
        severities: [],
        rootCauses: [],
        loading: false,
        error: null,
      });
    };
    if (typeof act === 'function') {
      try {
        act(reset);
      } catch {
        reset();
      }
    } else {
      reset();
    }
  });
}
