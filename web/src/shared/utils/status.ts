export const getStatusKey = (status: string): string => {
  const s = status.toLowerCase();
  if (s === 'open' || s === 'abierto') return 'open';
  if (s === 'assigned' || s === 'asignado') return 'assigned';
  if (s === 'in progress' || s === 'in-progress' || s === 'en proceso' || s === 'en-proceso' || s === 'inprogress') return 'in-progress';
  return 'closed';
};

export const getStatusLabel = (status: string): string => {
  const s = status.toLowerCase();
  if (s === 'open' || s === 'abierto') return 'Abierto';
  if (s === 'assigned' || s === 'asignado') return 'Asignado';
  if (s === 'in progress' || s === 'in-progress' || s === 'en proceso' || s === 'en-proceso' || s === 'inprogress') return 'En proceso';
  return 'Cerrado';
};
