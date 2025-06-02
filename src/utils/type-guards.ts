/**
 * Runtime type guards for external data validation
 * Provides type predicates to validate external data at runtime
 */

import { TaskStatusType, isValidTaskStatus } from '../constants/task-status.js';

/**
 * Type guard to check if a value is a string
 * @param value - The value to check
 * @returns True if the value is a string
 */
export function isString(value: unknown): value is string {
	return typeof value === 'string';
}

/**
 * Type guard to check if a value is a non-empty string
 * @param value - The value to check
 * @returns True if the value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
	return isString(value) && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a number
 * @param value - The value to check
 * @returns True if the value is a number
 */
export function isNumber(value: unknown): value is number {
	return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if a value is a boolean
 * @param value - The value to check
 * @returns True if the value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is an array
 * @param value - The value to check
 * @returns True if the value is an array
 */
export function isArray(value: unknown): value is unknown[] {
	return Array.isArray(value);
}

/**
 * Type guard to check if a value is an array of strings
 * @param value - The value to check
 * @returns True if the value is an array of strings
 */
export function isStringArray(value: unknown): value is string[] {
	return isArray(value) && value.every(isString);
}

/**
 * Type guard to check if a value is a plain object
 * @param value - The value to check
 * @returns True if the value is a plain object
 */
export function isPlainObject(
	value: unknown
): value is Record<string, unknown> {
	return (
		typeof value === 'object' &&
		value !== null &&
		!Array.isArray(value) &&
		!(value instanceof Date) &&
		!(value instanceof RegExp)
	);
}

/**
 * Type guard to check if a value is a valid Date object
 * @param value - The value to check
 * @returns True if the value is a valid Date
 */
export function isValidDate(value: unknown): value is Date {
	return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if a value is a valid ISO date string
 * @param value - The value to check
 * @returns True if the value is a valid ISO date string
 */
export function isISODateString(value: unknown): value is string {
	if (!isString(value)) return false;
	const date = new Date(value);
	return isValidDate(date) && date.toISOString() === value;
}

/**
 * Basic task object structure for validation
 */
export interface BasicTask {
	id: string | number;
	title: string;
	description: string;
	status: TaskStatusType;
	dependencies: string[] | number[];
	priority?: string;
}

/**
 * Type guard to check if a value is a valid basic task object
 * @param value - The value to check
 * @returns True if the value is a valid basic task
 */
export function isBasicTask(value: unknown): value is BasicTask {
	if (!isPlainObject(value)) return false;

	const task = value as Record<string, unknown>;

	// Check required fields
	if (!isNonEmptyString(task.title)) return false;
	if (!isString(task.description)) return false;
	if (!isString(task.status) || !isValidTaskStatus(task.status)) return false;

	// Check id (string or number)
	if (!isString(task.id) && !isNumber(task.id)) return false;

	// Check dependencies array
	if (!isArray(task.dependencies)) return false;
	if (!task.dependencies.every((dep) => isString(dep) || isNumber(dep)))
		return false;

	// Check optional priority
	if (task.priority !== undefined && !isString(task.priority)) return false;

	return true;
}

/**
 * Type guard to check if a value is an array of basic tasks
 * @param value - The value to check
 * @returns True if the value is an array of basic tasks
 */
export function isBasicTaskArray(value: unknown): value is BasicTask[] {
	return isArray(value) && value.every(isBasicTask);
}

/**
 * Configuration object structure for validation
 */
export interface BasicConfig {
	projectName?: string;
	version?: string;
	[key: string]: unknown;
}

/**
 * Type guard to check if a value is a valid basic configuration object
 * @param value - The value to check
 * @returns True if the value is a valid basic config
 */
export function isBasicConfig(value: unknown): value is BasicConfig {
	if (!isPlainObject(value)) return false;

	const config = value as Record<string, unknown>;

	// Check optional fields
	if (config.projectName !== undefined && !isString(config.projectName))
		return false;
	if (config.version !== undefined && !isString(config.version)) return false;

	return true;
}

/**
 * Type guard to check if a value has a specific property with a given type
 * @param value - The value to check
 * @param property - The property name to check
 * @param typeGuard - The type guard function to validate the property
 * @returns True if the value has the property with the correct type
 */
export function hasProperty<T>(
	value: unknown,
	property: string,
	typeGuard: (val: unknown) => val is T
): value is Record<string, unknown> & { [K in typeof property]: T } {
	return (
		isPlainObject(value) && property in value && typeGuard(value[property])
	);
}

/**
 * Type guard to check if a value is a valid JSON-parseable string
 * @param value - The value to check
 * @returns True if the value is a valid JSON string
 */
export function isValidJSONString(value: unknown): value is string {
	if (!isString(value)) return false;
	try {
		JSON.parse(value);
		return true;
	} catch {
		return false;
	}
}
