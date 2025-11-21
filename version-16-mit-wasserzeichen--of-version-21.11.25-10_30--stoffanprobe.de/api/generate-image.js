export default async function handler(request, response) {
  // Wir holen die Daten direkt aus dem Body (ohne extra JSON.parse)
  const { prompt, imageUrl, maskUrl } = request.body;

  // Hier rufen wir Fal.ai auf (Flux Inpainting)
  const res = await fetch("https://queue.fal.run/fal-ai/flux/dev/inpainting", {
    method: "POST",
    headers: {
      "Authorization": `Key ${process.env.FAL_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt,
      image_url: imageUrl,
      mask_url: maskUrl,
      strength: 0.85, // Wie stark soll verändert werden?
      guidance_scale: 3.5,
      num_inference_steps: 28,
      enable_safety_checker: true // Kommerziell wichtig
    }),
  });

  const data = await res.json();
  response.status(200).json(data);
}
