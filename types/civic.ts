export type UserRole = 'ADMIN' | 'STAFF';

export type ReportStatus = 'SUBMITTED' | 'REVIEWING' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type ReportPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export const reportStatuses: ReportStatus[] = ['SUBMITTED', 'REVIEWING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

export const reportPriorities: ReportPriority[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
