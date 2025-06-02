/**
 * Logger utility functions for Task Master
 * Provides standardized logging patterns for both CLI and utility contexts
 */

import { log as utilLog } from '../../scripts/modules/utils.js';

/**
 * Standard logger interface with common logging methods
 */
export interface Logger {
	info: (msg: string, ...args: unknown[]) => void;
	warn: (msg: string, ...args: unknown[]) => void;
	error: (msg: string, ...args: unknown[]) => void;
	debug: (msg: string, ...args: unknown[]) => void;
	success: (msg: string, ...args: unknown[]) => void;
}

/**
 * Creates a standard logger object that wraps the utility log function
 * This provides a consistent logger interface across different parts of the application
 * @returns A logger object with standard logging methods (info, warn, error, debug, success)
 */
export function createStandardLogger(): Logger {
	return {
		info: (msg: string, ...args: unknown[]) => utilLog('info', msg, ...args),
		warn: (msg: string, ...args: unknown[]) => utilLog('warn', msg, ...args),
		error: (msg: string, ...args: unknown[]) => utilLog('error', msg, ...args),
		debug: (msg: string, ...args: unknown[]) => utilLog('debug', msg, ...args),
		success: (msg: string, ...args: unknown[]) =>
			utilLog('success', msg, ...args)
	};
}

/**
 * Creates a logger using either the provided logger or a default standard logger
 * This is the recommended pattern for functions that accept an optional logger parameter
 * @param providedLogger - Optional logger object passed from caller
 * @returns A logger object with standard logging methods
 */
export function getLoggerOrDefault(
	providedLogger: Logger | null = null
): Logger {
	return providedLogger || createStandardLogger();
}
