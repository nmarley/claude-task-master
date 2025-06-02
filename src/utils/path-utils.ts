/**
 * Path utility functions for Task Master
 * Provides centralized path resolution logic for both CLI and MCP use cases
 */

import path from 'path';
import fs from 'fs';
import {
	TASKMASTER_TASKS_FILE,
	LEGACY_TASKS_FILE,
	TASKMASTER_DOCS_DIR,
	TASKMASTER_REPORTS_DIR,
	COMPLEXITY_REPORT_FILE,
	TASKMASTER_CONFIG_FILE,
	LEGACY_CONFIG_FILE
} from '../constants/paths.js';
import { getLoggerOrDefault, type Logger } from './logger-utils.js';

/**
 * Arguments object typically passed from MCP context
 */
export interface MCPArgs {
	projectRoot?: string;
	[key: string]: unknown;
}

/**
 * Find the project root directory by looking for project markers
 * @param startDir - Directory to start searching from
 * @returns Project root path or null if not found
 */
export function findProjectRoot(
	startDir: string = process.cwd()
): string | null {
	const projectMarkers = [
		'.taskmaster',
		TASKMASTER_TASKS_FILE,
		'tasks.json',
		LEGACY_TASKS_FILE,
		'.git',
		'.svn',
		'package.json',
		'yarn.lock',
		'package-lock.json',
		'pnpm-lock.yaml'
	];

	let currentDir = path.resolve(startDir);
	const rootDir = path.parse(currentDir).root;

	while (currentDir !== rootDir) {
		// Check if current directory contains any project markers
		for (const marker of projectMarkers) {
			const markerPath = path.join(currentDir, marker);
			if (fs.existsSync(markerPath)) {
				return currentDir;
			}
		}
		currentDir = path.dirname(currentDir);
	}

	return null;
}

/**
 * Find the tasks.json file path with fallback logic
 * @param explicitPath - Explicit path provided by user (highest priority)
 * @param args - Args object from MCP args (optional)
 * @param log - Logger object (optional)
 * @returns Resolved tasks.json path or null if not found
 */
export function findTasksPath(
	explicitPath: string | null = null,
	args: MCPArgs | null = null,
	log: Logger | null = null
): string | null {
	// Use the passed logger if available, otherwise use the default logger
	const logger = getLoggerOrDefault(log);

	// 1. If explicit path is provided, use it (highest priority)
	if (explicitPath) {
		const resolvedPath = path.isAbsolute(explicitPath)
			? explicitPath
			: path.resolve(process.cwd(), explicitPath);

		if (fs.existsSync(resolvedPath)) {
			logger.info?.(`Using explicit tasks path: ${resolvedPath}`);
			return resolvedPath;
		} else {
			logger.warn?.(
				`Explicit tasks path not found: ${resolvedPath}, trying fallbacks`
			);
		}
	}

	// 2. Try to get project root from args (MCP) or find it
	const projectRoot = args?.projectRoot || findProjectRoot();

	if (!projectRoot) {
		logger.warn?.('Could not determine project root directory');
		return null;
	}

	// 3. Check possible locations in order of preference
	const possiblePaths = [
		path.join(projectRoot, TASKMASTER_TASKS_FILE), // .taskmaster/tasks/tasks.json (NEW)
		path.join(projectRoot, 'tasks.json'), // tasks.json in root (LEGACY)
		path.join(projectRoot, LEGACY_TASKS_FILE) // tasks/tasks.json (LEGACY)
	];

	for (const tasksPath of possiblePaths) {
		if (fs.existsSync(tasksPath)) {
			logger.info?.(`Found tasks file at: ${tasksPath}`);

			// Issue deprecation warning for legacy paths
			if (
				tasksPath.includes('tasks/tasks.json') &&
				!tasksPath.includes('.taskmaster')
			) {
				logger.warn?.(
					`⚠️  DEPRECATION WARNING: Found tasks.json in legacy location '${tasksPath}'. Please migrate to the new .taskmaster directory structure. Run 'task-master migrate' to automatically migrate your project.`
				);
			} else if (
				tasksPath.endsWith('tasks.json') &&
				!tasksPath.includes('.taskmaster') &&
				!tasksPath.includes('tasks/')
			) {
				logger.warn?.(
					`⚠️  DEPRECATION WARNING: Found tasks.json in legacy root location '${tasksPath}'. Please migrate to the new .taskmaster directory structure. Run 'task-master migrate' to automatically migrate your project.`
				);
			}

			return tasksPath;
		}
	}

	logger.warn?.(`No tasks.json found in project: ${projectRoot}`);
	return null;
}

/**
 * Find the PRD document file path with fallback logic
 * @param explicitPath - Explicit path provided by user (highest priority)
 * @param args - Args object for MCP context (optional)
 * @param log - Logger object (optional)
 * @returns Resolved PRD document path or null if not found
 */
export function findPRDPath(
	explicitPath: string | null = null,
	args: MCPArgs | null = null,
	log: Logger | null = null
): string | null {
	const logger = getLoggerOrDefault(log);

	// 1. If explicit path is provided, use it (highest priority)
	if (explicitPath) {
		const resolvedPath = path.isAbsolute(explicitPath)
			? explicitPath
			: path.resolve(process.cwd(), explicitPath);

		if (fs.existsSync(resolvedPath)) {
			logger.info?.(`Using explicit PRD path: ${resolvedPath}`);
			return resolvedPath;
		} else {
			logger.warn?.(
				`Explicit PRD path not found: ${resolvedPath}, trying fallbacks`
			);
		}
	}

	// 2. Try to get project root from args (MCP) or find it
	const projectRoot = args?.projectRoot || findProjectRoot();

	if (!projectRoot) {
		logger.warn?.('Could not determine project root directory');
		return null;
	}

	// 3. Check possible locations in order of preference
	const locations = [
		TASKMASTER_DOCS_DIR, // .taskmaster/docs/ (NEW)
		'scripts/', // Legacy location
		'' // Project root
	];

	const fileNames = ['PRD.md', 'prd.md', 'PRD.txt', 'prd.txt'];

	for (const location of locations) {
		for (const fileName of fileNames) {
			const prdPath = path.join(projectRoot, location, fileName);
			if (fs.existsSync(prdPath)) {
				logger.info?.(`Found PRD document at: ${prdPath}`);

				// Issue deprecation warning for legacy paths
				if (location === 'scripts/' || location === '') {
					logger.warn?.(
						`⚠️  DEPRECATION WARNING: Found PRD file in legacy location '${prdPath}'. Please migrate to .taskmaster/docs/ directory. Run 'task-master migrate' to automatically migrate your project.`
					);
				}

				return prdPath;
			}
		}
	}

	logger.warn?.(`No PRD document found in project: ${projectRoot}`);
	return null;
}

/**
 * Find the complexity report file path with fallback logic
 * @param explicitPath - Explicit path provided by user (highest priority)
 * @param args - Args object for MCP context (optional)
 * @param log - Logger object (optional)
 * @returns Resolved complexity report path or null if not found
 */
export function findComplexityReportPath(
	explicitPath: string | null = null,
	args: MCPArgs | null = null,
	log: Logger | null = null
): string | null {
	const logger = getLoggerOrDefault(log);

	// 1. If explicit path is provided, use it (highest priority)
	if (explicitPath) {
		const resolvedPath = path.isAbsolute(explicitPath)
			? explicitPath
			: path.resolve(process.cwd(), explicitPath);

		if (fs.existsSync(resolvedPath)) {
			logger.info?.(`Using explicit complexity report path: ${resolvedPath}`);
			return resolvedPath;
		} else {
			logger.warn?.(
				`Explicit complexity report path not found: ${resolvedPath}, trying fallbacks`
			);
		}
	}

	// 2. Try to get project root from args (MCP) or find it
	const projectRoot = args?.projectRoot || findProjectRoot();

	if (!projectRoot) {
		logger.warn?.('Could not determine project root directory');
		return null;
	}

	// 3. Check possible locations in order of preference
	const possiblePaths = [
		path.join(projectRoot, COMPLEXITY_REPORT_FILE), // .taskmaster/reports/task-complexity-report.json (NEW)
		path.join(projectRoot, 'scripts/task-complexity-report.json') // Legacy location
	];

	for (const reportPath of possiblePaths) {
		if (fs.existsSync(reportPath)) {
			logger.info?.(`Found complexity report at: ${reportPath}`);

			// Issue deprecation warning for legacy paths
			if (reportPath.includes('scripts/task-complexity-report.json')) {
				logger.warn?.(
					`⚠️  DEPRECATION WARNING: Found complexity report in legacy location '${reportPath}'. Please migrate to .taskmaster/reports/ directory. Run 'task-master migrate' to automatically migrate your project.`
				);
			}

			return reportPath;
		}
	}

	logger.warn?.(`No complexity report found in project: ${projectRoot}`);
	return null;
}

/**
 * Resolve the output path for tasks.json file
 * @param explicitPath - Explicit path provided by user (highest priority)
 * @param args - Args object for MCP context (optional)
 * @param log - Logger object (optional)
 * @returns Resolved output path for tasks.json
 */
export function resolveTasksOutputPath(
	explicitPath: string | null = null,
	args: MCPArgs | null = null,
	log: Logger | null = null
): string {
	const logger = getLoggerOrDefault(log);

	// 1. If explicit path is provided, use it (highest priority)
	if (explicitPath) {
		const resolvedPath = path.isAbsolute(explicitPath)
			? explicitPath
			: path.resolve(process.cwd(), explicitPath);
		logger.info?.(`Using explicit tasks output path: ${resolvedPath}`);
		return resolvedPath;
	}

	// 2. Try to get project root from args (MCP) or find it
	const projectRoot = args?.projectRoot || findProjectRoot() || process.cwd();

	// 3. Use the new .taskmaster structure by default
	const outputPath = path.join(projectRoot, TASKMASTER_TASKS_FILE);
	logger.info?.(`Using default tasks output path: ${outputPath}`);
	return outputPath;
}

/**
 * Resolve the output path for complexity report file
 * @param explicitPath - Explicit path provided by user (highest priority)
 * @param args - Args object for MCP context (optional)
 * @param log - Logger object (optional)
 * @returns Resolved output path for complexity report
 */
export function resolveComplexityReportOutputPath(
	explicitPath: string | null = null,
	args: MCPArgs | null = null,
	log: Logger | null = null
): string {
	const logger = getLoggerOrDefault(log);

	// 1. If explicit path is provided, use it (highest priority)
	if (explicitPath) {
		const resolvedPath = path.isAbsolute(explicitPath)
			? explicitPath
			: path.resolve(process.cwd(), explicitPath);
		logger.info?.(
			`Using explicit complexity report output path: ${resolvedPath}`
		);
		return resolvedPath;
	}

	// 2. Try to get project root from args (MCP) or find it
	const projectRoot = args?.projectRoot || findProjectRoot() || process.cwd();

	// 3. Use the new .taskmaster structure by default
	const outputPath = path.join(projectRoot, COMPLEXITY_REPORT_FILE);
	logger.info?.(`Using default complexity report output path: ${outputPath}`);
	return outputPath;
}

/**
 * Find the config file path with fallback logic
 * @param explicitPath - Explicit path provided by user (highest priority)
 * @param args - Args object for MCP context (optional)
 * @param log - Logger object (optional)
 * @returns Resolved config file path or null if not found
 */
export function findConfigPath(
	explicitPath: string | null = null,
	args: MCPArgs | null = null,
	log: Logger | null = null
): string | null {
	const logger = getLoggerOrDefault(log);

	// 1. If explicit path is provided, use it (highest priority)
	if (explicitPath) {
		const resolvedPath = path.isAbsolute(explicitPath)
			? explicitPath
			: path.resolve(process.cwd(), explicitPath);

		if (fs.existsSync(resolvedPath)) {
			logger.info?.(`Using explicit config path: ${resolvedPath}`);
			return resolvedPath;
		} else {
			logger.warn?.(
				`Explicit config path not found: ${resolvedPath}, trying fallbacks`
			);
		}
	}

	// 2. Try to get project root from args (MCP) or find it
	const projectRoot = args?.projectRoot || findProjectRoot();

	if (!projectRoot) {
		logger.warn?.('Could not determine project root directory');
		return null;
	}

	// 3. Check possible locations in order of preference
	const possiblePaths = [
		path.join(projectRoot, TASKMASTER_CONFIG_FILE), // .taskmaster/config.json (NEW)
		path.join(projectRoot, LEGACY_CONFIG_FILE) // .taskmasterconfig (LEGACY)
	];

	for (const configPath of possiblePaths) {
		if (fs.existsSync(configPath)) {
			logger.info?.(`Found config file at: ${configPath}`);

			// Issue deprecation warning for legacy paths
			if (configPath.endsWith(LEGACY_CONFIG_FILE)) {
				logger.warn?.(
					`⚠️  DEPRECATION WARNING: Found config file in legacy location '${configPath}'. Please migrate to .taskmaster/config.json. Run 'task-master migrate' to automatically migrate your project.`
				);
			}

			return configPath;
		}
	}

	logger.warn?.(`No config file found in project: ${projectRoot}`);
	return null;
}

/**
 * Resolve the output path for config file
 * @param explicitPath - Explicit path provided by user (highest priority)
 * @param args - Args object for MCP context (optional)
 * @param log - Logger object (optional)
 * @returns Resolved output path for config file
 */
export function resolveConfigOutputPath(
	explicitPath: string | null = null,
	args: MCPArgs | null = null,
	log: Logger | null = null
): string {
	const logger = getLoggerOrDefault(log);

	// 1. If explicit path is provided, use it (highest priority)
	if (explicitPath) {
		const resolvedPath = path.isAbsolute(explicitPath)
			? explicitPath
			: path.resolve(process.cwd(), explicitPath);
		logger.info?.(`Using explicit config output path: ${resolvedPath}`);
		return resolvedPath;
	}

	// 2. Try to get project root from args (MCP) or find it
	const projectRoot = args?.projectRoot || findProjectRoot() || process.cwd();

	// 3. Use the new .taskmaster structure by default
	const outputPath = path.join(projectRoot, TASKMASTER_CONFIG_FILE);
	logger.info?.(`Using default config output path: ${outputPath}`);
	return outputPath;
}
