import { create } from 'zustand';
import { fetchAnalyticalDashboard, type AnalyticalDashboardData } from '../analyticalDashboardApi';
import { getCachedAreas } from '../../../shared/api/areasCache';

interface CausaRaizState {
  data: AnalyticalDashboardData | null;
  timeFilter: string;
  areaFilter: string;
  availableAreas: string[];
  loading: boolean;
  error: string | null;

  setTimeFilter: (timeFilter: string) => void;
  setAreaFilter: (areaFilter: string) => void;
  loadAreas: () => Promise<void>;
  loadAnalyticalData: () => Promise<void>;
}

export const useWebCausaRaizStore = create<CausaRaizState>((set, get) => ({
  data: null,
  timeFilter: 'week',
  areaFilter: 'all',
  availableAreas: [],
  loading: false,
  error: null,

  setTimeFilter: (timeFilter) => {
    set({ timeFilter });
    get().loadAnalyticalData();
  },

  setAreaFilter: (areaFilter) => {
    set({ areaFilter });
    get().loadAnalyticalData();
  },

  loadAreas: async () => {
    try {
      const res = await getCachedAreas();
      set({ availableAreas: res });
    } catch (err: unknown) {
      console.error(err);
    }
  },

  loadAnalyticalData: async () => {
    set({ loading: true, error: null });
    const { timeFilter, areaFilter } = get();
    let startDate: string | undefined;

    if (timeFilter === 'week') {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (timeFilter === 'month') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (timeFilter === 'year') {
      startDate = new Date(new Date().getFullYear(), 0, 1).toISOString();
    }

    try {
      const data = await fetchAnalyticalDashboard(startDate, undefined, areaFilter);
      set({ data, loading: false });
    } catch (err: unknown) {
      console.error(err);
      set({ error: 'Error al cargar los datos analíticos.', loading: false });
    }
  },
}));
