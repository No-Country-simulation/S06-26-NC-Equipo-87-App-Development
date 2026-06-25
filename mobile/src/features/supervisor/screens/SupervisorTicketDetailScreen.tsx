import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationHeader } from '../../../shared/components/molecules/NavigationHeader';
import { Typography } from '../../../shared/components/atoms/Typography';
import { Card } from '../../../shared/components/atoms/Card';
import { Button } from '../../../shared/components/atoms/Button';
import { SupervisorTicketDetailsCard } from '../../../shared/components/organisms/SupervisorTicketDetailsCard';
import { SupervisorTicketTimelineCard } from '../../../shared/components/organisms/SupervisorTicketTimelineCard';
import { SupervisorTicket } from '../../../shared/components/molecules/SupervisorTicketCard';
import { useIncidentStore } from '../../incidents/stores/useIncidentStore';
import designTokens from '../../../shared/theme/designTokens.json';

interface SupervisorTicketDetailScreenProps {
  ticketId: string;
  onBack?: () => void;
  onClose?: () => void;
}

interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  color: string;
}

interface Technician {
  id: string;
  name: string;
  specialty: string;
  status: 'libre' | 'ocupado';
  statusLabel: string;
}

interface IncidentStatusHistoryDto {
  historyId: number;
  previousStatus: string | null;
  newStatus: string;
  transitionNotes: string | null;
  changedByUserId: string;
  changedByUserFullName: string;
  changedDate: string;
}


const formatElapsed = (reportedDateStr: string): string => {
  if (!reportedDateStr) return 'N/A';
  const reportedDate = new Date(reportedDateStr);
  if (isNaN(reportedDate.getTime())) return 'N/A';
  const diffMs = Date.now() - reportedDate.getTime();
  const diffMins = Math.max(0, Math.floor(diffMs / 60000));
  
  if (diffMins < 60) {
    return `${diffMins} min`;
  }
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} d`;
};

const mapSeverity = (severityName: string): 'Alta' | 'Media' | 'Baja' => {
  const normalized = (severityName || '').toLowerCase();
  if (normalized === 'alto' || normalized === 'alta') return 'Alta';
  if (normalized === 'medio' || normalized === 'media') return 'Media';
  return 'Baja';
};

const mapStatusToType = (status: string): 'open' | 'in-progress' | 'closed' | 'assigned' => {
  const normalized = (status || '').toLowerCase().replace('_', '-');
  if (normalized === 'in-progress' || normalized === 'inprogress') {
    return 'in-progress';
  }
  if (normalized === 'closed') {
    return 'closed';
  }
  if (normalized === 'assigned') {
    return 'assigned';
  }
  return 'open';
};

const mapStatusToLabel = (status: string): string => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'in-progress') {
    return 'En proceso';
  }
  if (normalized === 'closed') {
    return 'Cerrado';
  }
  if (normalized === 'assigned') {
    return 'Asignado';
  }
  return 'Abierto';
};

const formatTime = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
};

const mapStatusToColor = (status: string): string => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'closed') {
    return designTokens.colors['status-closed'];
  }
  if (normalized === 'in-progress') {
    return designTokens.colors['status-in-progress'];
  }
  if (normalized === 'assigned') {
    return '#378ADD';
  }
  return designTokens.colors['status-open'];
};

const mapBackendHistoryToTimeline = (historyList: IncidentStatusHistoryDto[]): TimelineEvent[] => {
  return historyList.map((h) => {
    let title = h.transitionNotes || 'Actualización de estado';
    const normalizedNewStatus = (h.newStatus || '').toLowerCase();
    if (normalizedNewStatus === 'open') {
      title = h.transitionNotes || 'Incidente reportado';
    } else if (normalizedNewStatus === 'in-progress') {
      title = h.transitionNotes || `Técnico asignado (${h.changedByUserFullName})`;
    } else if (normalizedNewStatus === 'closed') {
      title = h.transitionNotes || `Ticket cerrado (${h.changedByUserFullName})`;
    }
    
    return {
      id: String(h.historyId),
      title,
      time: formatTime(h.changedDate),
      color: mapStatusToColor(h.newStatus),
    };
  });
};

export const SupervisorTicketDetailScreen: React.FC<SupervisorTicketDetailScreenProps> = ({
  ticketId,
  onBack,
  onClose,
}) => {
  const fetchIncidentDetailStore = useIncidentStore((state) => state.fetchIncidentDetail);
  const fetchTechniciansStore = useIncidentStore((state) => state.fetchTechnicians);
  const assignTechnicianStore = useIncidentStore((state) => state.assignTechnician);

  const [ticket, setTicket] = useState<SupervisorTicket | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  const fetchTicketDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIncidentDetailStore(ticketId);
      const mappedTicket: SupervisorTicket = {
        id: data.incidentId,
        incidentCode: data.incidentId,
        areaName: data.areaName,
        elapsedTime: formatElapsed(data.reportedDate),
        categoryName: data.incidentTypeName || 'Incidente',
        description: data.description,
        operatorNumber: data.reportedByUserId ? '#' + String(data.reportedByUserId).substring(0, 5) : 'N/A',
        severity: mapSeverity(data.severityTypeName),
        status: mapStatusToType(data.status),
        statusLabel: mapStatusToLabel(data.status),
        pendingSync: false,
      };
      setTicket(mappedTicket);
      
      if (data.history && data.history.length > 0) {
        setTimeline(mapBackendHistoryToTimeline(data.history));
      } else {
        setTimeline([
          {
            id: 'initial',
            title: 'Incidente reportado',
            time: formatTime(data.reportedDate),
            color: designTokens.colors['status-open'],
          },
        ]);
      }

      try {
        const techsData = await fetchTechniciansStore(data.areaId, data.incidentTypeId);
        const mappedTechs = techsData.map((item) => ({
          id: item.userId,
          name: `${item.firstName} ${item.lastName}`,
          specialty: item.specialityName || 'General',
          status: item.isFree ? ('libre' as const) : ('ocupado' as const),
          statusLabel: item.isFree ? 'LIBRE' : 'OCUPADO',
        }));
        setTechnicians(mappedTechs);
        if (mappedTechs.length > 0) {
          setSelectedTechnicianId(mappedTechs[0].id);
        } else {
          setSelectedTechnicianId(null);
        }
      } catch (techErr) {
        console.error('Error fetching technicians:', techErr);
        setTechnicians([]);
        setSelectedTechnicianId(null);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Error al obtener los detalles del incidente.');
    } finally {
      setLoading(false);
    }
  }, [ticketId, fetchIncidentDetailStore, fetchTechniciansStore]);

  useEffect(() => {
    fetchTicketDetail();
  }, [fetchTicketDetail]);



  const handleConfirmAssignment = useCallback(async () => {
    if (!ticket || !selectedTechnicianId) return;
    const selectedTech = technicians.find((t) => t.id === selectedTechnicianId);
    if (!selectedTech) return;

    setLoading(true);
    setError(null);
    try {
      await assignTechnicianStore(ticket.id, selectedTechnicianId);
      await fetchTicketDetail();
    } catch (err: unknown) {
      const apiErr = err as { message: string };
      setError(apiErr?.message || 'Error al asignar el técnico.');
    } finally {
      setLoading(false);
      setIsBottomSheetVisible(false);
    }
  }, [ticket, selectedTechnicianId, technicians, fetchTicketDetail, assignTechnicianStore]);



  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <NavigationHeader
          title="Cargando..."
          onBack={onBack}
          onClose={onClose}
          showBack={true}
          showClose={true}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={designTokens.colors['text-primary']} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !ticket) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <NavigationHeader
          title="Error"
          onBack={onBack}
          onClose={onClose}
          showBack={true}
          showClose={true}
        />
        <View style={styles.errorContainer}>
          <Typography variant="body" color={designTokens.colors['status-open']} style={styles.errorText}>
            {error || 'Ticket no encontrado'}
          </Typography>
          <Button label="Reintentar" onPress={fetchTicketDetail} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <NavigationHeader
        title={ticket.incidentCode}
        onBack={onBack}
        onClose={onClose}
        showBack={true}
        showClose={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SupervisorTicketDetailsCard
          status={ticket.status}
          statusLabel={ticket.statusLabel}
          severity={ticket.severity}
          categoryName={ticket.categoryName}
          areaName={ticket.areaName}
          operatorNumber={ticket.operatorNumber}
          elapsedTime={ticket.elapsedTime}
        />

        <Card style={styles.card}>
          <Typography variant="micro" color={designTokens.colors['text-tertiary']} style={styles.sectionTitle}>
            DESCRIPCIÓN DEL INCIDENTE
          </Typography>
          <Typography variant="body" color={designTokens.colors['text-primary']} style={styles.descriptionText}>
            {ticket.description}
          </Typography>
        </Card>

        <SupervisorTicketTimelineCard timeline={timeline} />

      </ScrollView>

      <View style={styles.footer}>
        {ticket.status === 'open' ? (
          <Button label="Asignar técnico →" onPress={() => setIsBottomSheetVisible(true)} />
        ) : (
          <Button label="Volver al Inicio" onPress={onBack} />
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isBottomSheetVisible}
        onRequestClose={() => setIsBottomSheetVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetOverlayDismiss}
            activeOpacity={1}
            onPress={() => setIsBottomSheetVisible(false)}
          />
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            
            <Typography variant="heading" color={designTokens.colors['text-primary']} style={styles.sheetTitle}>
              Asignar técnico
            </Typography>

            <View style={styles.techList}>
              {technicians.length === 0 ? (
                <View style={styles.emptyTechContainer}>
                  <Typography
                    variant="body"
                    color={designTokens.colors['text-secondary']}
                    style={styles.emptyTechText}
                  >
                    No hay técnicos disponibles para este tipo de incidente y área.
                  </Typography>
                </View>
              ) : (
                technicians.map((tech) => {
                  const isSelected = selectedTechnicianId === tech.id;
                  const isLibre = tech.status === 'libre';
                  const pillBg = isLibre ? '#E1F5EE' : '#FAEEDA';
                  const pillText = isLibre ? '#085041' : '#633806';

                  return (
                    <TouchableOpacity
                      key={tech.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedTechnicianId(tech.id)}
                      style={[
                        styles.techRow,
                        isSelected && styles.techRowSelected,
                      ]}
                    >
                      <View>
                        <Typography
                          variant="body"
                          color={designTokens.colors['text-primary']}
                          style={styles.techName}
                        >
                          {tech.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={designTokens.colors['text-secondary']}
                        >
                          {tech.specialty}
                        </Typography>
                      </View>

                      <View style={[styles.techPill, { backgroundColor: pillBg }]}>
                        <Typography
                          variant="caption"
                          color={pillText}
                          style={styles.techPillText}
                        >
                          {tech.statusLabel}
                        </Typography>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            <View style={styles.sheetFooter}>
              <Button
                label="Confirmar asignación"
                onPress={handleConfirmAssignment}
                disabled={!selectedTechnicianId}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors['background-primary'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: designTokens.colors['background-primary'],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: designTokens.colors['background-primary'],
    padding: 24,
    gap: 16,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  scrollContent: {
    padding: parseInt(designTokens.spacing['4']),
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: parseInt(designTokens.spacing['4']),
    marginBottom: parseInt(designTokens.spacing['4']),
    borderRadius: parseInt(designTokens.rounded.md),
  },
  sectionTitle: {
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  descriptionText: {
    lineHeight: 20,
  },
  commentButton: {
    marginTop: 12,
    height: 48,
    borderWidth: 1.25,
    borderColor: '#D3D1C7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  footer: {
    paddingHorizontal: parseInt(designTokens.spacing['4']),
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: designTokens.colors['background-primary'],
    borderTopWidth: 1,
    borderTopColor: '#E0DDD4',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetOverlayDismiss: {
    flex: 1,
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: parseInt(designTokens.rounded.lg),
    borderTopRightRadius: parseInt(designTokens.rounded.lg),
    paddingHorizontal: parseInt(designTokens.spacing['4']),
    paddingTop: 12,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D3D1C7',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  techList: {
    borderTopWidth: 1,
    borderTopColor: '#E0DDD4',
  },
  emptyTechContainer: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0DDD4',
  },
  emptyTechText: {
    textAlign: 'center',
    lineHeight: 18,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0DDD4',
    backgroundColor: '#FFFFFF',
  },
  techRowSelected: {
    backgroundColor: '#F5F3EC',
  },
  techName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  techPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  techPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sheetFooter: {
    marginTop: 24,
  },
});
