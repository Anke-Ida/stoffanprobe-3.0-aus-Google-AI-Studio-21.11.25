// services/AIService.ts

export const AIService = {
  
  /**
   * Sendet Chat-Nachrichten an Grok (via /api/chat)
   */
  async chat(messages: any[]) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`Chat Error: ${response.statusText} - ${JSON.stringify(errData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Fehler im AIService (Chat):", error);
      throw error;
    }
  },

  /**
   * Sendet Bild+Maske an Fal.ai (via /api/generate-image)
   */
  async generateImage(prompt: string, imageUrl: string, maskUrl: string) {
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          imageUrl,
          maskUrl
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`Image Gen Error: ${response.statusText} - ${JSON.stringify(errData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Fehler im AIService (Bild):", error);
      throw error;
    }
  }
};
