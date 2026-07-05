import React from 'react';
import { Typography } from '../../../../shared/components/atoms/Typography';
import type { RecentCriticalIncident } from '../../dashboardApi';
import { getStatusKey, getStatusLabel } from '../../../../shared/utils/status';

interface IncidentsTableProps {
  incidents: RecentCriticalIncident[];
}

export const IncidentsTable: React.FC<IncidentsTableProps> = ({ incidents }) => {
  return (
    <div className="opscore-table-card">
      <div style={{ padding: 'var(--spacing-4) var(--spacing-5)', borderBottom: '1.25px solid #dcdad4' }}>
        <Typography variant="heading" style={{ margin: 0 }}>
          Incidentes críticos recientes
        </Typography>
      </div>
      <div className="opscore-table-wrapper">
        <table className="opscore-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Área</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>T. Resolución</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(inc => {
              const statusKey = getStatusKey(inc.statusKey || inc.status);
              return (
                <tr key={inc.id}>
                  <td>
                    <span className="opscore-row-id">{inc.id}</span>
                  </td>
                  <td>{inc.area}</td>
                  <td>{inc.type}</td>
                  <td>
                    <span className={`opscore-status-pill opscore-status-pill-${statusKey}`}>
                      <span className="opscore-pill-dot" />
                      {getStatusLabel(inc.statusKey || inc.status)}
                    </span>
                  </td>
                  <td>
                    {inc.time}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
