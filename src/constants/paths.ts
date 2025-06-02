/**
 * Path constants for Task Master application
 */

// .taskmaster directory structure paths
export const TASKMASTER_DIR = '.taskmaster' as const;
export const TASKMASTER_TASKS_DIR = '.taskmaster/tasks' as const;
export const TASKMASTER_DOCS_DIR = '.taskmaster/docs' as const;
export const TASKMASTER_REPORTS_DIR = '.taskmaster/reports' as const;
export const TASKMASTER_TEMPLATES_DIR = '.taskmaster/templates' as const;

// Task Master configuration files
export const TASKMASTER_CONFIG_FILE = '.taskmaster/config.json' as const;
export const LEGACY_CONFIG_FILE = '.taskmasterconfig' as const;

// Task Master report files
export const COMPLEXITY_REPORT_FILE =
	'.taskmaster/reports/task-complexity-report.json' as const;
export const LEGACY_COMPLEXITY_REPORT_FILE =
	'scripts/task-complexity-report.json' as const;

// Task Master PRD file paths
export const PRD_FILE = '.taskmaster/docs/prd.txt' as const;
export const LEGACY_PRD_FILE = 'scripts/prd.txt' as const;

// Task Master template files
export const EXAMPLE_PRD_FILE =
	'.taskmaster/templates/example_prd.txt' as const;
export const LEGACY_EXAMPLE_PRD_FILE = 'scripts/example_prd.txt' as const;

// Task Master task file paths
export const TASKMASTER_TASKS_FILE = '.taskmaster/tasks/tasks.json' as const;
export const LEGACY_TASKS_FILE = 'tasks/tasks.json' as const;

// General project files (not Task Master specific but commonly used)
export const ENV_EXAMPLE_FILE = '.env.example' as const;
export const GITIGNORE_FILE = '.gitignore' as const;

// Task file naming pattern
export const TASK_FILE_PREFIX = 'task_' as const;
export const TASK_FILE_EXTENSION = '.txt' as const;

/**
 * Project markers used to identify a task-master project root
 * These files/directories indicate that a directory is a Task Master project
 */
export const PROJECT_MARKERS = [
	'.taskmaster', // New taskmaster directory
	LEGACY_CONFIG_FILE, // .taskmasterconfig
	'tasks.json', // Generic tasks file
	LEGACY_TASKS_FILE, // tasks/tasks.json (legacy location)
	TASKMASTER_TASKS_FILE, // .taskmaster/tasks/tasks.json (new location)
	'.git', // Git repository
	'.svn' // SVN repository
] as const;

/**
 * Type representing valid project marker values
 */
export type ProjectMarkerType = (typeof PROJECT_MARKERS)[number];
