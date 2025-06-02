/**
 * Task status type definition and validation utilities
 */

/**
 * Task status enumeration
 * Defines possible task statuses with their string values
 */
export const TaskStatus = {
	PENDING: 'pending',
	DONE: 'done',
	IN_PROGRESS: 'in-progress',
	REVIEW: 'review',
	DEFERRED: 'deferred',
	CANCELLED: 'cancelled'
} as const;

/**
 * Type representing valid task status values
 */
export type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];

/**
 * Task status options list
 * @description Defines possible task statuses:
 * - pending: Task waiting to start
 * - done: Task completed
 * - in-progress: Task in progress
 * - review: Task completed and waiting for review
 * - deferred: Task postponed or paused
 * - cancelled: Task cancelled and will not be completed
 */
export const TASK_STATUS_OPTIONS = [
	TaskStatus.PENDING,
	TaskStatus.DONE,
	TaskStatus.IN_PROGRESS,
	TaskStatus.REVIEW,
	TaskStatus.DEFERRED,
	TaskStatus.CANCELLED
] as const;

/**
 * Check if a given status is a valid task status
 * @param status - The status to check
 * @returns True if the status is valid, false otherwise
 */
export function isValidTaskStatus(status: string): status is TaskStatusType {
	return TASK_STATUS_OPTIONS.includes(status as TaskStatusType);
}
