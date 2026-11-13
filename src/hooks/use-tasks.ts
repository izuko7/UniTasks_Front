import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Task, TaskFilters, TaskInput, TaskStats, TaskStatus } from "../types/task";

const KEYS = {
	all: ["tasks"] as const,
	list: (f: TaskFilters) => ["tasks", "list", f] as const,
	one: (id: number) => ["tasks", "one", id] as const,
	stats: ["tasks", "stats"] as const,
};

function clean(filters: TaskFilters) {
	return Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
}

export function useTasks(filters: TaskFilters = {}) {
	return useQuery({
		queryKey: KEYS.list(filters),
		queryFn: async () => (await api.get<Task[]>("/tasks", { params: clean(filters) })).data,
		placeholderData: keepPreviousData,
	});
}

export function useTask(id: number) {
	return useQuery({
		queryKey: KEYS.one(id),
		queryFn: async () => (await api.get<Task>(`/tasks/${id}`)).data,
	});
}

export function useStats() {
	return useQuery({
		queryKey: KEYS.stats,
		queryFn: async () => (await api.get<TaskStats>("/tasks/stats")).data,
	});
}

export function useCreateTask() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input: TaskInput) => (await api.post<Task>("/tasks", input)).data,
		onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
	});
}

export function useUpdateTask() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, data }: { id: number; data: Partial<TaskInput> }) =>
			(await api.patch<Task>(`/tasks/${id}`, data)).data,
		onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
	});
}

export function useUpdateStatus() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, status }: { id: number; status: TaskStatus }) =>
			(await api.patch<Task>(`/tasks/${id}`, { status })).data,
		onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
	});
}

export function useDeleteTask() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (id: number) => {
			await api.delete(`/tasks/${id}`);
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
	});
}