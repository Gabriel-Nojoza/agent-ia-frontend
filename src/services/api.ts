import axios from "axios";

console.log("API URL =>", import.meta.env.VITE_API_URL);

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 20000,
});

export async function chat(message:string) {
    const res = await api.post("/chat", { message});
    return res.data as {answer: string; raw?: any};
}
