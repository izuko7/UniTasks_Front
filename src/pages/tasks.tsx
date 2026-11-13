import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
	useCreateTask,
	useDeleteTask,
	useTasks,
	useUpdateStatus,
	useUpdateTask,
} from "../hooks/use-tasks";
import { getErrorMessage } from "../lib/api";
import type { Task, TaskFilters, TaskInput, TaskPriority, TaskStatus } from "../types/task";

const STATUS: Record<TaskStatus, { label: string; style: string }> = {
	TODO: { label: "À faire", style: "bg-todo/10 text-todo" },
	IN_PROGRESS: { label: "En cours", style: "bg-progress/10 text-progress" },
	COMPLETED: { label: "Terminée", style: "bg-done/10 text-done" },
};

const PRIORITY: Record<TaskPriority, { label: string; style: string }> = {
	LOW: { label: "Basse", style: "text-low" },
	MEDIUM: { label: "Moyenne", style: "text-medium" },
	HIGH: { label: "Haute", style: "text-high" },
};

const field =
	"w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

const toInputDate = (iso: string) => iso.slice(0, 10);
const toISO = (d: string) => new Date(`${d}T00:00:00.000Z`).toISOString();

export default function TasksPage() {
	const [filters, setFilters] = useState<TaskFilters>({});
	const [searchInput, setSearchInput] = useState("");
	const [formTask, setFormTask] = useState<Task | "new" | null>(null);
	const [toDelete, setToDelete] = useState<Task | null>(null);

	// Recherche avec délai (évite une requête par frappe)
	useEffect(() => {
		const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput })), 300);
		return () => clearTimeout(t);
	}, [searchInput]);

	const tasks = useTasks(filters);
	const updateStatus = useUpdateStatus();
	const deleteTask = useDeleteTask();

	function confirmDelete() {
		if (!toDelete) return;
		deleteTask.mutate(toDelete.id, {
			onSuccess: () => {
				toast.success("Mission supprimée");
				setToDelete(null);
			},
			onError: (e) => toast.error(getErrorMessage(e)),
		});
	}

	function changeStatus(id: number, status: TaskStatus) {
		updateStatus.mutate(
			{ id, status },
			{
				onSuccess: () => toast.success("Statut mis à jour"),
				onError: (e) => toast.error(getErrorMessage(e)),
			},
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Missions</h1>
				<button
					onClick={() => setFormTask("new")}
					className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
				>
					<Plus size={16} /> Nouvelle mission
				</button>
			</div>

			{/* Filtres */}
			<div className="grid gap-3 sm:grid-cols-3">
				<input
					className={field}
					placeholder="Rechercher par titre…"
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
				/>
				<select
					className={field}
					value={filters.status ?? ""}
					onChange={(e) =>
						setFilters({ ...filters, status: (e.target.value || undefined) as TaskStatus })
					}
				>
					<option value="">Tous les statuts</option>
					{Object.entries(STATUS).map(([k, v]) => (
						<option key={k} value={k}>
							{v.label}
						</option>
					))}
				</select>
				<select
					className={field}
					value={filters.priority ?? ""}
					onChange={(e) =>
						setFilters({ ...filters, priority: (e.target.value || undefined) as TaskPriority })
					}
				>
					<option value="">Toutes les priorités</option>
					{Object.entries(PRIORITY).map(([k, v]) => (
						<option key={k} value={k}>
							{v.label}
						</option>
					))}
				</select>
			</div>

			{/* États : chargement, erreur, vide */}
			{tasks.isPending && <p className="text-muted">Chargement…</p>}
			{tasks.isError && (
				<div className="rounded-lg border border-late/30 bg-late/10 p-4 text-sm text-late">
					{getErrorMessage(tasks.error)}{" "}
					<button onClick={() => tasks.refetch()} className="underline">
						Réessayer
					</button>
				</div>
			)}
			{tasks.data?.length === 0 && (
				<p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
					Aucune mission trouvée.
				</p>
			)}

			{/* Liste */}
			<div className="grid gap-3">
				{tasks.data?.map((t) => {
					const late = new Date(t.dueDate) < new Date() && t.status !== "COMPLETED";
					return (
						<div
							key={t.id}
							className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div className="min-w-0">
								<p className="truncate font-semibold">{t.title}</p>
								<p className="truncate text-sm text-muted">{t.description}</p>
								<div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
									<span className={`font-medium ${PRIORITY[t.priority].style}`}>
										Priorité : {PRIORITY[t.priority].label}
									</span>
									<span className={late ? "font-medium text-late" : "text-muted"}>
										Échéance : {new Date(t.dueDate).toLocaleDateString("fr-FR")}
										{late && " (en retard)"}
									</span>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<select
									value={t.status}
									onChange={(e) => changeStatus(t.id, e.target.value as TaskStatus)}
									className={`rounded-full border-0 px-3 py-1 text-xs font-medium ${STATUS[t.status].style}`}
								>
									{Object.entries(STATUS).map(([k, v]) => (
										<option key={k} value={k}>
											{v.label}
										</option>
									))}
								</select>
								<button
									onClick={() => setFormTask(t)}
									aria-label="Modifier"
									className="rounded-lg p-2 text-muted hover:bg-bg"
								>
									<Pencil size={16} />
								</button>
								<button
									onClick={() => setToDelete(t)}
									aria-label="Supprimer"
									className="rounded-lg p-2 text-late hover:bg-late/10"
								>
									<Trash2 size={16} />
								</button>
							</div>
						</div>
					);
				})}
			</div>

			{formTask && (
				<TaskFormModal
					task={formTask === "new" ? null : formTask}
					onClose={() => setFormTask(null)}
				/>
			)}

			{toDelete && (
				<Modal onClose={() => setToDelete(null)}>
					<h2 className="text-lg font-bold">Supprimer la mission ?</h2>
					<p className="mt-2 text-sm text-muted">
						« {toDelete.title} » sera définitivement supprimée.
					</p>
					<div className="mt-6 flex justify-end gap-2">
						<button
							onClick={() => setToDelete(null)}
							className="rounded-lg px-4 py-2 text-sm hover:bg-bg"
						>
							Annuler
						</button>
						<button
							onClick={confirmDelete}
							disabled={deleteTask.isPending}
							className="rounded-lg bg-late px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
						>
							{deleteTask.isPending ? "Suppression…" : "Supprimer"}
						</button>
					</div>
				</Modal>
			)}
		</div>
	);
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
			onClick={onClose}
		>
			<div
				className="w-full max-w-md rounded-xl bg-surface p-6"
				onClick={(e) => e.stopPropagation()}
			>
				{children}
			</div>
		</div>
	);
}

function TaskFormModal({ task, onClose }: { task: Task | null; onClose: () => void }) {
	const create = useCreateTask();
	const update = useUpdateTask();
	const pending = create.isPending || update.isPending;

	const [form, setForm] = useState({
		title: task?.title ?? "",
		description: task?.description ?? "",
		priority: (task?.priority ?? "MEDIUM") as TaskPriority,
		dueDate: task ? toInputDate(task.dueDate) : "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	function validate() {
		const e: Record<string, string> = {};
		if (!form.title.trim()) e.title = "Titre requis";
		if (!form.description.trim()) e.description = "Description requise";
		if (!form.dueDate) e.dueDate = "Date limite requise";
		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleSubmit(ev: React.SyntheticEvent) {
		ev.preventDefault();
		if (!validate()) return;

		const data: TaskInput = {
			title: form.title.trim(),
			description: form.description.trim(),
			priority: form.priority,
			dueDate: toISO(form.dueDate),
		};
		const opts = {
			onSuccess: () => {
				toast.success(task ? "Mission modifiée" : "Mission créée");
				onClose();
			},
			onError: (e: unknown) => toast.error(getErrorMessage(e)),
		};

		if (task) update.mutate({ id: task.id, data }, opts);
		else create.mutate(data, opts);
	}

	return (
		<Modal onClose={onClose}>
			<form onSubmit={handleSubmit} className="space-y-4" noValidate>
				<h2 className="text-lg font-bold">
					{task ? "Modifier la mission" : "Nouvelle mission"}
				</h2>

				<div>
					<input
						className={field}
						placeholder="Titre"
						value={form.title}
						onChange={(e) => setForm({ ...form, title: e.target.value })}
					/>
					{errors.title && <p className="mt-1 text-xs text-late">{errors.title}</p>}
				</div>

				<div>
					<textarea
						className={field}
						rows={3}
						placeholder="Description"
						value={form.description}
						onChange={(e) => setForm({ ...form, description: e.target.value })}
					/>
					{errors.description && (
						<p className="mt-1 text-xs text-late">{errors.description}</p>
					)}
				</div>

				<div className="grid grid-cols-2 gap-3">
					<select
						className={field}
						value={form.priority}
						onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
					>
						{Object.entries(PRIORITY).map(([k, v]) => (
							<option key={k} value={k}>
								{v.label}
							</option>
						))}
					</select>
					<div>
						<input
							type="date"
							className={field}
							value={form.dueDate}
							onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
						/>
						{errors.dueDate && <p className="mt-1 text-xs text-late">{errors.dueDate}</p>}
					</div>
				</div>

				<div className="flex justify-end gap-2">
					<button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm hover:bg-bg">
						Annuler
					</button>
					<button
						disabled={pending}
						className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
					>
						{pending ? "Enregistrement…" : task ? "Enregistrer" : "Créer"}
					</button>
				</div>
			</form>
		</Modal>
	);
}