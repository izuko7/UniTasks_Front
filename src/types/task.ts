export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
	id: number;
	title: string;
	description: string;
	priority: TaskPriority;
	status: TaskStatus;
	dueDate: string;
	createdAt: string;
	updatedAt: string;
	userId: string;
}

export interface TaskStats {
	total: number;
	TODO: number;
	IN_PROGRESS: number;
	COMPLETED: number;
	overdue: number;
}

export interface TaskFilters {
	status?: TaskStatus;
	priority?: TaskPriority;
	search?: string;
}

export interface TaskInput {
	title: string;
	description: string;
	priority: TaskPriority;
	status?: TaskStatus;
	dueDate: string; // ISO complet
}