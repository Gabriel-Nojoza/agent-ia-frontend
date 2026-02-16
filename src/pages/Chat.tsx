import { useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { chat } from "../services/api";
import "../styles.css";

type Msg = { from: "user" | "bot"; text: string; ts: number };


export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "bot",
      text:
        "Olá! Sou seu assistente conectado à planilha.\nDigite sua pergunta sobre produtos, vendas, faturamento, estoque, lucro ou qualquer outro dado.",
      ts: Date.now()
    }
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const canSend = useMemo(() => text.trim().length > 0 && !loading, [text, loading]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function onSend(customText?: string) {
    const msg = (customText ?? text).trim();
    if (!msg || loading) return;

    setMessages((m) => [...m, { from: "user", text: msg, ts: Date.now() }]);
    setText("");
    setLoading(true);

    try {
      const data = await chat(msg);
      setMessages((m) => [...m, { from: "bot", text: data.answer, ts: Date.now() }]);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail
          ? "Erro: request inválido (backend)."
          : "Falha ao consultar API. Confere se o backend está em http://127.0.0.1:3001";

      toast.error(message);
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Deu erro ao consultar a API. Confere se o backend está ligado.", ts: Date.now() }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <Toaster position="top-right" />

      <header className="header">
        <div>
          <h1 className="title">Agente IA - Planilhas</h1>
          <p className="subtitle">Pergunte e eu busco a resposta na sua planilha.</p>
        </div>

        <div className="status">
          <span className={`dot ${loading ? "busy" : "ok"}`} />
          <span>{loading ? "Consultando..." : "Online"}</span>
        </div>
      </header>

      <div className="card">

        <div className="chatBox" ref={listRef}>
          {messages.map((m, i) => (
            <div key={i} className={`row ${m.from}`}>
              <div className={`bubble ${m.from}`}>
                <div className="bubbleText">{m.text}</div>
                <div className="bubbleTime">{new Date(m.ts).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="row bot">
              <div className="bubble bot">
                <div className="typing"><span /><span /><span /></div>
              </div>
            </div>
          )}
        </div>


        <div className="footer">
          <input
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite sua pergunta..."
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            disabled={loading}
          />
          <button className="button" onClick={() => onSend()} disabled={!canSend}>
            Enviar
          </button>
        </div>

        <div className="hint">
          Dica: “faturamento 01/2026”, “lucro 02/2026”, “preço de X”, “quantas unidades de X”.
        </div>
      </div>
    </div>
  );
}
