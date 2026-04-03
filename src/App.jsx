import { useEffect, useState } from "react";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function fetchMessages() {
  const response = await fetch(`${apiUrl}/messages`);

  if (!response.ok) {
    throw new Error("Impossible de charger les messages.");
  }

  return response.json();
}

export default function App() {
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadMessages() {
    setIsLoading(true);
    setError("");

    try {
      const data = await fetchMessages();
      setMessages(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          author: author.trim() || "Anonymous",
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible d'enregistrer le message.");
      }

      setContent("");
      await loadMessages();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>FakeTenderAI Messages</h1>
        <p className="intro">
          Cette page envoie un message au backend FastAPI, puis affiche la liste
          sauvegardee dans PostgreSQL.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Auteur
            <input
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Exemple : Alice"
              maxLength={100}
            />
          </label>

          <label>
            Message
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Ecris un message..."
              rows="4"
              maxLength={500}
              required
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Envoi..." : "Envoyer"}
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}

        <div className="list-header">
          <h2>Messages</h2>
          <button type="button" className="secondary-button" onClick={loadMessages}>
            Rafraichir
          </button>
        </div>

        {isLoading ? (
          <p>Chargement...</p>
        ) : messages.length === 0 ? (
          <p>Aucun message pour le moment.</p>
        ) : (
          <ul className="message-list">
            {messages.map((message) => (
              <li key={message.id} className="message-item">
                <p className="message-content">{message.content}</p>
                <p className="message-meta">
                  {message.author} - {new Date(message.created_at).toLocaleString("fr-FR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
