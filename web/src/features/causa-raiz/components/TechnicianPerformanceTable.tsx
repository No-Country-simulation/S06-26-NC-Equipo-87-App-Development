import React from 'react';
import { Typography } from '../../../shared/components/atoms/Typography';
import type { TechnicianPerformance } from '../analyticalDashboardApi';

interface TechnicianPerformanceTableProps {
  data: TechnicianPerformance[];
}

export const TechnicianPerformanceTable: React.FC<TechnicianPerformanceTableProps> = ({ data }) => {
  return (
    <div className="opscore-table-card">
      <div style={{ padding: 'var(--spacing-4) var(--spacing-5)', borderBottom: '1.25px solid #dcdad4' }}>
        <Typography variant="heading" style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--colors-text-primary)' }}>
          Rendimiento por técnico
        </Typography>
      </div>
      <div className="opscore-table-wrapper">
        <table className="opscore-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Técnico</th>
              <th style={{ textAlign: 'left' }}>Especialidad</th>
              <th style={{ textAlign: 'right' }}>Tickets Resueltos</th>
              <th style={{ textAlign: 'right' }}>T. Prom. Resolución</th>
            </tr>
          </thead>
          <tbody>
            {data.map((tech, index) => (
              <tr key={index}>
                <td style={{ textAlign: 'left', fontWeight: 400 }}>{tech.name}</td>
                <td style={{ textAlign: 'left', color: 'var(--colors-text-secondary)' }}>{tech.specialty}</td>
                <td style={{ textAlign: 'right', fontWeight: 400 }}>{tech.ticketsResolved}</td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--colors-text-secondary)' }}>
                  {tech.avgResolutionTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

