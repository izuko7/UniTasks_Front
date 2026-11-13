import axios from "axios";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	headers: { "Content-Type": "application/json" },
});

export function getErrorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		if (!error.response) return "Impossible de joindre le serveur";
		const msg = error.response.data?.message;
		if (Array.isArray(msg)) return msg.join(", ");
		if (typeof msg === "string") return msg;
	}
	return "Une erreur est survenue";
}