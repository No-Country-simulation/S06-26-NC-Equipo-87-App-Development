import { getRequest } from '../../shared/api/apiClient';

export interface FrequentCause {
  label: string;
  count: number;
}

export interface AreaIncidentDistribution {
  name: string;
  count: number;
}

export interface MechanicalFailTrend {
  week: string;
  count: number;
}

export interface TechnicianPerformance {
  name: string;
  specialty: string;
  ticketsResolved: number;
  avgResolutionTime: string;
}
export interface AnalyticalDashboardData {
  frequentCauses: FrequentCause[];
  incidentsByArea: AreaIncidentDistribution[];
  mechanicalFailsTrend: MechanicalFailTrend[];
  technicianPerformance: TechnicianPerformance[];
  insights: string[];
}

export const fetchAnalyticalDashboard = (startDate?: string, endDate?: string, area?: string): Promise<AnalyticalDashboardData> => {
  const params = new URLSearchParams();
  if (startDate) {
    params.append('startDate', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
  }
  if (area) {
    params.append('area', area);
  }
  const queryString = params.toString();
  const path = `/api/dashboard/analytical${queryString ? `?${queryString}` : ''}`;
  return getRequest<AnalyticalDashboardData>(path);
};
