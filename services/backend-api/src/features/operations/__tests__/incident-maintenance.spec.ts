import { NotFoundException } from '@nestjs/common';
import { IncidentService } from '../incident.service';
import { MaintenanceWindowService } from '../maintenance-window.service';
import { IncidentRecord, MaintenanceWindow } from '../operations.entities';

const mockIncident: IncidentRecord = {
  id: 'incident-1',
  title: 'API Outage',
  description: 'The API is experiencing intermittent failures',
  severity: 'major',
  status: 'investigating',
  impact: null,
  startedAt: new Date('2025-01-15T10:00:00Z'),
  resolvedAt: null,
  ownerId: 'admin-1',
  postmortemUrl: null,
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMaintenanceWindow: MaintenanceWindow = {
  id: 'maint-1',
  title: 'Database upgrade',
  description: 'Upgrading PostgreSQL to v16',
  type: 'planned',
  status: 'scheduled',
  affectedServices: ['api', 'database'],
  scheduledStart: new Date('2025-02-01T02:00:00Z'),
  scheduledEnd: new Date('2025-02-01T04:00:00Z'),
  actualStart: null,
  actualEnd: null,
  userMessage: 'Brief downtime expected',
  createdBy: 'admin-1',
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOpsRepo = {
  createIncident: jest.fn(),
  findAllIncidents: jest.fn(),
  findIncidentById: jest.fn(),
  updateIncidentStatus: jest.fn(),
  createAuditLog: jest.fn(),
};

const mockAuditService = {
  logAction: jest.fn(),
};

describe('IncidentService', () => {
  let service: IncidentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new IncidentService(mockOpsRepo as any);
  });

  describe('createIncident', () => {
    it('should create an incident and log audit', async () => {
      mockOpsRepo.createIncident.mockResolvedValue(mockIncident);
      mockOpsRepo.createAuditLog.mockResolvedValue({});

      const result = await service.createIncident('00000000-0000-0000-0000-000000000099', {
        title: 'API Outage',
        description: 'The API is experiencing intermittent failures',
        severity: 'major',
        startedAt: '2025-01-15T10:00:00Z',
      });

      expect(result).toEqual(mockIncident);
      expect(mockOpsRepo.createIncident).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'API Outage',
          severity: 'major',
          ownerId: '00000000-0000-0000-0000-000000000099',
        }),
      );
      expect(mockOpsRepo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'incident_created',
          resourceType: 'incident',
        }),
      );
    });
  });

  describe('listIncidents', () => {
    it('should list incidents with default pagination', async () => {
      mockOpsRepo.findAllIncidents.mockResolvedValue([mockIncident]);

      const result = await service.listIncidents();

      expect(result).toEqual([mockIncident]);
      expect(mockOpsRepo.findAllIncidents).toHaveBeenCalledWith(50, 0);
    });

    it('should pass custom pagination parameters', async () => {
      mockOpsRepo.findAllIncidents.mockResolvedValue([]);

      await service.listIncidents(10, 20);

      expect(mockOpsRepo.findAllIncidents).toHaveBeenCalledWith(10, 20);
    });
  });

  describe('getById', () => {
    it('should return an incident by ID', async () => {
      mockOpsRepo.findIncidentById.mockResolvedValue(mockIncident);

      const result = await service.getById('00000000-0000-0000-0000-000000000010');

      expect(result).toEqual(mockIncident);
    });

    it('should throw NotFoundException if incident does not exist', async () => {
      mockOpsRepo.findIncidentById.mockResolvedValue(null);

      await expect(
        service.getById('00000000-0000-0000-0000-000000000099'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update incident status and log audit', async () => {
      mockOpsRepo.findIncidentById.mockResolvedValue(mockIncident);
      const updatedIncident = { ...mockIncident, status: 'resolved' as const };
      mockOpsRepo.updateIncidentStatus.mockResolvedValue(updatedIncident);
      mockOpsRepo.createAuditLog.mockResolvedValue({});

      const result = await service.updateStatus(
        '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000099',
        {
          status: 'resolved',
          resolvedAt: '2025-01-15T12:00:00Z',
        },
      );

      expect(result.status).toBe('resolved');
      expect(mockOpsRepo.updateIncidentStatus).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000010',
        'resolved',
        new Date('2025-01-15T12:00:00Z'),
        null,
      );
      expect(mockOpsRepo.createAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'incident_status_updated',
          details: expect.objectContaining({
            previousStatus: 'investigating',
            newStatus: 'resolved',
          }),
        }),
      );
    });

    it('should throw NotFoundException if incident does not exist', async () => {
      mockOpsRepo.findIncidentById.mockResolvedValue(null);

      await expect(
        service.updateStatus(
          '00000000-0000-0000-0000-000000000099',
          '00000000-0000-0000-0000-000000000001',
          { status: 'resolved' },
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should include postmortemUrl when status is postmortem', async () => {
      mockOpsRepo.findIncidentById.mockResolvedValue(mockIncident);
      const updatedIncident = {
        ...mockIncident,
        status: 'postmortem' as const,
        postmortemUrl: 'https://docs.example.com/postmortem/1',
      };
      mockOpsRepo.updateIncidentStatus.mockResolvedValue(updatedIncident);
      mockOpsRepo.createAuditLog.mockResolvedValue({});

      const result = await service.updateStatus(
        '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000099',
        {
          status: 'postmortem',
          postmortemUrl: 'https://docs.example.com/postmortem/1',
        },
      );

      expect(result.postmortemUrl).toBe('https://docs.example.com/postmortem/1');
    });
  });
});

describe('MaintenanceWindowService', () => {
  let service: MaintenanceWindowService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MaintenanceWindowService(mockAuditService as any);
  });

  describe('createWindow', () => {
    it('should create a maintenance window and log audit', async () => {
      mockAuditService.logAction.mockResolvedValue({});

      const result = await service.createWindow(
        {
          title: 'Database upgrade',
          description: 'Upgrading PostgreSQL to v16',
          type: 'planned',
          affectedServices: ['api', 'database'],
          scheduledStart: new Date('2025-02-01T02:00:00Z'),
          scheduledEnd: new Date('2025-02-01T04:00:00Z'),
          userMessage: 'Brief downtime expected',
        },
        'admin-1',
      );

      expect(result.title).toBe('Database upgrade');
      expect(result.type).toBe('planned');
      expect(result.status).toBe('scheduled');
      expect(result.createdBy).toBe('admin-1');
      expect(result.affectedServices).toEqual(['api', 'database']);
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'admin-1',
        'maintenance_window.created',
        'maintenance_window',
        expect.any(String),
        expect.objectContaining({ title: 'Database upgrade' }),
      );
    });
  });

  describe('getWindows', () => {
    it('should return maintenance windows', async () => {
      const result = await service.getWindows();

      expect(result).toEqual([]);
    });
  });

  describe('getWindowById', () => {
    it('should throw NotFoundException (stub implementation)', async () => {
      await expect(service.getWindowById('maint-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateWindowStatus', () => {
    it('should throw NotFoundException when window does not exist (stub)', async () => {
      await expect(
        service.updateWindowStatus(
          'nonexistent-id',
          { status: 'in_progress' },
          'admin-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getActiveMaintenanceWindows', () => {
    it('should return active maintenance windows', async () => {
      const result = await service.getActiveMaintenanceWindows();

      expect(result).toEqual([]);
    });
  });
});
