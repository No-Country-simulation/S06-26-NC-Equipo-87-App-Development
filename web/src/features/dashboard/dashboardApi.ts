import { getRequest } from '../../shared/api/apiClient';

export interface DailyIncidentTrend {
  day: string;
  value: number;
}

export interface IncidentTypeDistribution {
  label: string;
  percent: number;
  count: number;
}

export interface ShiftDistribution {
  label: string;
  percent: number;
  count: number;
}

export interface RecentCriticalIncident {
  id: string;
  area: string;
  type: string;
  status: string;
  statusKey: string;
  time: string;
}

export interface StatusSummaryCounts {
  open: number;
  assigned: number;
  inProgress: number;
  closed: number;
}

export interface OperationalDashboardData {
  incidentsThisWeek: number;
  incidentsLastWeek: number;
  meanTimeToRepair: string;
  meanTimeToRepairMinutes: number;
  meanTimeToRepairLastWeekMinutes: number;
  resolutionRate: string;
  resolutionRateLastWeek: string;
  highSeverityThisWeek: number;
  highSeverityLastWeek: number;
  incidentsByDay: DailyIncidentTrend[];
  incidentsByType: IncidentTypeDistribution[];
  incidentsByShift: ShiftDistribution[];
  recentCriticalIncidents: RecentCriticalIncident[];
  statusCounts: StatusSummaryCounts;
  insights: string[];
}

export const fetchOperationalDashboard = (startDate?: string, endDate?: string): Promise<OperationalDashboardData> => {
  const params = new URLSearchParams();
  if (startDate) {
    params.append('startDate', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
  }
  const queryString = params.toString();
  const path = `/api/dashboard/operational${queryString ? `?${queryString}` : ''}`;
  return getRequest<OperationalDashboardData>(path);
};
