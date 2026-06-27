import React from 'react';
import { Typography } from '../../../shared/components/atoms/Typography';

export interface Incident {
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
  reportedByEmployeeId: string;
  reportedDate: string;
}

interface IncidentCardProps {
  incident: Incident;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident }) => {
  const getStatusClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'open' || s === 'abierto') return 'opscore-status-open';
    if (s === 'in progress' || s === 'in-progress' || s === 'en proceso' || s === 'en-proceso') return 'opscore-status-in-progress';
    return 'opscore-status-closed';
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="opscore-incident-card" data-testid="incident-card">
      <div className="opscore-card-header">
        <Typography variant="mono" className="opscore-incident-id">
          {incident.incidentId}
        </Typography>
        <span className={`opscore-status-badge ${getStatusClass(incident.status)}`}>
          {incident.status}
        </span>
      </div>

      <div className="opscore-card-body">
        <Typography variant="body" className="opscore-incident-description">
          {incident.description}
        </Typography>

        <div className="opscore-card-details">
          <div className="opscore-detail-row">
            <Typography variant="micro" className="opscore-detail-label">
              Área:
            </Typography>
            <Typography variant="caption" className="opscore-detail-value">
              {incident.areaName}
            </Typography>
          </div>

          <div className="opscore-detail-row">
            <Typography variant="micro" className="opscore-detail-label">
              ¿Qué pasó?:
            </Typography>
            <Typography variant="caption" className="opscore-detail-value">
              {incident.incidentTypeName}
            </Typography>
          </div>

          <div className="opscore-detail-row">
            <Typography variant="micro" className="opscore-detail-label">
              Urgencia:
            </Typography>
            <Typography variant="caption" className="opscore-detail-value">
              {incident.severityTypeName}
            </Typography>
          </div>
        </div>
      </div>

      <div className="opscore-card-footer">
        <Typography variant="caption" color="#888780">
          Reportado por: {incident.reportedByEmployeeId}
        </Typography>
        <Typography variant="mono" color="#888780" className="opscore-reported-date">
          {formatDateTime(incident.reportedDate)}
        </Typography>
      </div>
    </div>
  );
};
