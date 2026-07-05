import { create } from 'zustand';
import { fetchOperationalDashboard, type OperationalDashboardData } from '../dashboardApi';

interface DashboardState {
  data: OperationalDashboardData | null;
  timeFilter: string;
  loading: boolean;
  error: string | null;
  setTimeFilter: (timeFilter: string) => void;
  loadDashboardData: () => Promise<void>;
}

export const useWebDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  timeFilter: 'current',
  loading: false,
  error: null,

  setTimeFilter: (timeFilter) => {
    set({ timeFilter });
    get().loadDashboardData();
  },

  loadDashboardData: async () => {
    set({ loading: true, error: null });
    const { timeFilter } = get();
    let startDate: string | undefined;

    if (timeFilter === 'current') {
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (timeFilter === 'month') {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (timeFilter === 'year') {
      startDate = new Date(new Date().getFullYear(), 0, 1).toISOString();
    }

    try {
      const data = await fetchOperationalDashboard(startDate, undefined);
      set({ data, loading: false });
    } catch (err: unknown) {
      console.error(err);
      set({ error: 'Error al cargar los datos del dashboard.', loading: false });
    }
  },
}));
