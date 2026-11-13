import { Link } from "react-router";
import { useStats, useTasks } from "../hooks/use-tasks";
import { getErrorMessage } from "../lib/api";

const cards = [
	{ key: "total", label: "Total", color: "text-ink" },
	{ key: "TODO", label: "À faire", color: "text-todo" },
	{ key: "IN_PROGRESS", label: "En cours", color: "text-progress" },
	{ key: "COMPLETED", label: "Terminées", color: "text-done" },
	{ key: "overdue", label: "En retard", color: "text-late" },
] as const;

export default function DashboardPage() {
	const stats = useStats();
	const tasks = useTasks();

	if (stats.isPending) return <p className="text-muted">Chargement…</p>;
	if (stats.isError)
		return <p className="text-late">{getErrorMessage(stats.error)}</p>;

	return (
		<div className="space-y-8">
			<h1 className="text-2xl font-bold">Tableau de bord</h1>

			<div className="grid grid-cols-2 gap-4 md:grid-cols-5">
				{cards.map((c) => (
					<div key={c.key} className="rounded-xl border border-border bg-surface p-4">
						<p className="text-sm text-muted">{c.label}</p>
						<p className={`mt-1 text-3xl font-bold ${c.color}`}>{stats.data[c.key]}</p>
					</div>
				))}
			</div>

			<section className="rounded-xl border border-border bg-surface p-4">
				<div className="mb-3 flex items-center justify-between">
					<h2 className="font-semibold">Dernières missions</h2>
					<Link to="/tasks" className="text-sm text-primary hover:underline">
						Tout voir
					</Link>
				</div>
				{tasks.isPending && <p className="text-muted">Chargement…</p>}
				{tasks.isError && <p className="text-late">{getErrorMessage(tasks.error)}</p>}
				{tasks.data?.length === 0 && (
					<p className="text-muted">Aucune mission pour le moment.</p>
				)}
				<ul className="divide-y divide-border">
					{tasks.data?.slice(0, 5).map((t) => (
						<li key={t.id} className="flex items-center justify-between py-2 text-sm">
							<span>{t.title}</span>
							<span className="text-muted">
								{new Date(t.dueDate).toLocaleDateString("fr-FR")}
							</span>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}