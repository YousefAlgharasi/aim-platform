import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupabaseJwtAuthGuard } from '../../auth/supabase-jwt-auth.guard';
import { SupportTicketService } from './support-ticket.service';
import { IncidentService } from './incident.service';
import { MaintenanceWindowService } from './maintenance-window.service';
import { ReleaseNotesService } from './release-notes.service';
import { FeatureFlagService } from './feature-flag.service';
import { OperationalStatusService } from './operational-status.service';
import { OperationsAdminGuard, OperationsAdminOnly } from './operations.guards';

@ApiTags('Admin Operations Dashboard')
@Controller('admin/operations')
@UseGuards(SupabaseJwtAuthGuard, OperationsAdminGuard)
@ApiBearerAuth()
export class AdminOperationsDashboardController {
  constructor(
    private readonly ticketService: SupportTicketService,
    private readonly incidentService: IncidentService,
    private readonly maintenanceWindowService: MaintenanceWindowService,
    private readonly releaseNotesService: ReleaseNotesService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly operationalStatusService: OperationalStatusService,
  ) {}

  @Get('dashboard')
  @OperationsAdminOnly()
  @ApiOperation({ summary: 'Get operations dashboard summary (admin)' })
  async getDashboard() {
    const [
      openTickets,
      activeIncidents,
      upcomingMaintenance,
      componentStatuses,
    ] = await Promise.all([
      this.ticketService.getMyTickets('__all__'),
      this.incidentService.listIncidents(100, 0),
      this.maintenanceWindowService.getActiveMaintenanceWindows(),
      this.operationalStatusService.getStatus(),
    ]);

    const openTicketCount = openTickets.filter(
      (t) => t.status === 'open' || t.status === 'in_progress',
    ).length;

    const activeIncidentCount = activeIncidents.filter(
      (i) =>
        i.status === 'investigating' ||
        i.status === 'identified' ||
        i.status === 'monitoring',
    ).length;

    return {
      openTickets: openTicketCount,
      activeIncidents: activeIncidentCount,
      upcomingMaintenance: upcomingMaintenance.length,
      componentStatuses: componentStatuses.length,
      summary: {
        tickets: {
          total: openTickets.length,
          open: openTicketCount,
        },
        incidents: {
          total: activeIncidents.length,
          active: activeIncidentCount,
        },
        maintenance: {
          upcoming: upcomingMaintenance.length,
        },
        components: {
          total: componentStatuses.length,
        },
      },
    };
  }
}
