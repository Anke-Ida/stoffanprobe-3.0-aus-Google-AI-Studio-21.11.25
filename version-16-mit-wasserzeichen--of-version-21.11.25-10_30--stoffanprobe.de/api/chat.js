export default async function handler(request, response) {
  // Wir holen die Nachrichten direkt aus dem Body
  const { messages } = request.body;

  try {
    // Anfrage an Grok (X.AI) senden
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROK_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: messages,
        temperature: 0.7, // Kreativität
        stream: false
      }),
    });

    const data = await res.json();

    // Falls Grok einen Fehler meldet, geben wir den weiter
    if (!res.ok) {
      return response.status(res.status).json({ error: data });
    }

    // Erfolgreiche Antwort zurücksenden
    return response.status(200).json(data);

  } catch (error) {
    return response.status(500).json({ error: "Server Error", details: error.message });
  }
}
