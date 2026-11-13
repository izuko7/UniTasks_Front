import { NavLink, Outlet, useNavigate } from "react-router";
import { LayoutDashboard, ListChecks, LogOut } from "lucide-react";
import { signOut, useSession } from "../lib/auth-client";

const link = ({ isActive }: { isActive: boolean }) =>
	`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
		isActive ? "bg-primary-soft text-primary" : "text-muted hover:bg-bg"
	}`;

export function Layout() {
	const { data: session } = useSession();
	const navigate = useNavigate();

	async function handleLogout() {
		await signOut();
		navigate("/login");
	}

	return (
		<div className="min-h-screen">
			<header className="border-b border-border bg-surface">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
					<div className="flex items-center gap-6">
						<span className="text-lg font-bold text-primary">UniTask</span>
						<nav className="flex gap-1">
							<NavLink to="/" end className={link}>
								<LayoutDashboard size={16} /> Tableau de bord
							</NavLink>
							<NavLink to="/tasks" className={link}>
								<ListChecks size={16} /> Missions
							</NavLink>
						</nav>
					</div>
					<div className="flex items-center gap-3">
						<span className="hidden text-sm text-muted sm:inline">{session?.user.name}</span>
						<button
							onClick={handleLogout}
							className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted hover:bg-bg"
						>
							<LogOut size={16} /> Déconnexion
						</button>
					</div>
				</div>
			</header>
			<main className="mx-auto max-w-6xl px-4 py-8">
				<Outlet />
			</main>
		</div>
	);
}