import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { signIn, signUp } from "../lib/auth-client";

export default function LoginPage() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<"login" | "register">("login");
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({ name: "", email: "", password: "" });

	async function handleSubmit(e: React.SyntheticEvent) {
		e.preventDefault();
		setLoading(true);
		const { error } =
			mode === "login"
				? await signIn.email({ email: form.email, password: form.password })
				: await signUp.email(form);
		setLoading(false);
		if (error) return toast.error(error.message ?? "Échec de l'authentification");
		navigate("/");
	}

	const input =
		"w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-surface p-6"
			>
				<h1 className="text-xl font-bold">
					{mode === "login" ? "Connexion" : "Créer un compte"}
				</h1>
				{mode === "register" && (
					<input
						className={input}
						placeholder="Nom"
						required
						value={form.name}
						onChange={(e) => setForm({ ...form, name: e.target.value })}
					/>
				)}
				<input
					className={input}
					type="email"
					placeholder="Email"
					required
					value={form.email}
					onChange={(e) => setForm({ ...form, email: e.target.value })}
				/>
				<input
					className={input}
					type="password"
					placeholder="Mot de passe (8 caractères min.)"
					required
					minLength={8}
					value={form.password}
					onChange={(e) => setForm({ ...form, password: e.target.value })}
				/>
				<button
					disabled={loading}
					className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
				>
					{loading ? "Patientez…" : mode === "login" ? "Se connecter" : "S'inscrire"}
				</button>
				<button
					type="button"
					onClick={() => setMode(mode === "login" ? "register" : "login")}
					className="w-full text-sm text-muted hover:text-primary"
				>
					{mode === "login" ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
				</button>
			</form>
		</div>
	);
}