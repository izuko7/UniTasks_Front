import { Navigate, Outlet, Route, Routes } from "react-router";
import { useSession } from "./lib/auth-client";
import { Layout } from "./components/Layout";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import TasksPage from "./pages/tasks";

function ProtectedRoute() {
	const { data: session, isPending } = useSession();
	if (isPending) return <p className="p-8 text-muted">Chargement…</p>;
	if (!session) return <Navigate to="/login" replace />;
	return <Outlet />;
}

function PublicRoute() {
	const { data: session, isPending } = useSession();
	if (isPending) return <p className="p-8 text-muted">Chargement…</p>;
	if (session) return <Navigate to="/" replace />;
	return <Outlet />;
}

export default function App() {
	return (
		<Routes>
			<Route element={<PublicRoute />}>
				<Route path="/login" element={<LoginPage />} />
			</Route>
			<Route element={<ProtectedRoute />}>
				<Route element={<Layout />}>
					<Route index element={<DashboardPage />} />
					<Route path="/tasks" element={<TasksPage />} />
				</Route>
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}