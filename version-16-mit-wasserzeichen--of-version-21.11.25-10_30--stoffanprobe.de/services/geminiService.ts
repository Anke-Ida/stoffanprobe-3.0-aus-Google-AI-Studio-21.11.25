
import { GoogleGenAI, Modality } from "@google/genai";
import { PresetType, RALColor, VisualizationMode } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// Helper to load an image into an HTMLImageElement
const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Handle CORS for images from different origins
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });

/**
 * Adds a professional watermark to the image.
 */
const addWatermarkToImage = (
  imageSrc: string,
  watermarkText: string = "stoffanprobe.de – AI generated"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Originalbild zeichnen
      ctx.drawImage(img, 0, 0);

      // ---- WATERMARK-EINSTELLUNGEN ----
      const fontSize = Math.max(14, img.width * 0.035); // Skaliert automatisch, Mindestgröße 14px
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";

      const padding = Math.max(10, img.width * 0.02);

      // **Schatten**, damit man es auf hellen UND dunklen Hintergründen sieht
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Wasserzeichen unten rechts platzieren
      ctx.fillText(
        watermarkText,
        img.width - padding,
        img.height - padding
      );

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = (err) => reject(err);
  });
};

/**
 * Applies a solid HEX color to an image based on a mask.
 * This function is used for the "RAL exakt (Profi-Modus)".
 */
async function applyRALColor(roomImageUrl: string, maskImageUrl: string, hexColor: string): Promise<string> {
  const roomImg = await loadImage(roomImageUrl);
  const maskImg = await loadImage(maskImageUrl);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = roomImg.width;
  canvas.height = roomImg.height;

  // 1. Create a temporary canvas for the colored overlay
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('Could not get temp canvas context');
  
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  
  // Draw the mask on the temp canvas
  tempCtx.drawImage(maskImg, 0, 0, tempCanvas.width, tempCanvas.height);
  
  // Use 'source-in' to replace the mask's content (the white parts) with the solid color
  tempCtx.globalCompositeOperation = 'source-in';
  tempCtx.fillStyle = hexColor;
  tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // 2. Draw the original room image on the main canvas
  ctx.drawImage(roomImg, 0, 0);
  
  // 3. Draw the colored overlay onto the main canvas with 90% opacity for realism
  ctx.globalAlpha = 0.9;
  ctx.drawImage(tempCanvas, 0, 0);
  ctx.globalAlpha = 1.0; // Reset alpha

  return canvas.toDataURL('image/jpeg');
}

const getPromptForPreset = (preset: PresetType, textHint?: string): string => {
  let basePrompt = '';
  switch (preset) {
    case 'Gardine':
      basePrompt = "Combine the room photo (room) and the fabric sample (pattern). Apply the fabric as curtains on visible window areas. Preserve perspective, scale, lighting, and realistic shadows. Keep a calm, elegant interior mood.";
      break;
    case 'Tapete':
      basePrompt = "Combine room and pattern. Render the pattern as wallpaper on vertical wall surfaces. Respect wall edges, corners, lighting direction, and subtle texture blending.";
      break;
    case 'Teppich':
      basePrompt = "Combine room and pattern. Render the pattern as a floor rug in correct perspective and room scale. Keep reflections and contact shadows natural.";
      break;
    case 'Accessoire':
      basePrompt = "Use the pattern/object as a decorative accessory placed naturally in the scene (e.g., table, shelf, floor). Harmonize with lighting and composition; add realistic shadowing.";
      break;
    case 'Möbel': {
        const baseInstruction = `Du bist eine professionelle Interior-AI. Ziel: Das hochgeladene Möbelstück oder Stoffmuster soll verwendet werden, um ein Möbelstück im Raum visuell anzupassen. Erlaubte Aufgaben (abhängig vom Texteingabefeld des Nutzers): Möbel neu beziehen (Stoff/Farbe/Material), Möbel ersetzen (z.B. Sessel durch Stuhl, Einsitzer durch Zweisitzer), Möbel gegen eine moderne Variante austauschen, Möbelfarbe ändern, Position im Raum leicht anpassen, Oberflächenmaterial ändern (Holz, Stoff, Leder usw.). WICHTIG: Der Stil des Raumes muss erhalten bleiben. Proportionen dürfen nicht unrealistisch verändert werden. Keine zusätzlichen Möbel hinzufügen außer auf ausdrückliche Anweisung. Keine Verzerrungen oder perspektivischen Fehler erzeugen. Erstelle ein realistisches Foto mit höchster Qualität.`;
        const finalHint = textHint && textHint.trim() ? textHint.trim() : "Bitte Möbel anpassen.";
        return `${baseInstruction} User hint: "${finalHint}"`;
    }
    default:
      basePrompt = "Optimize the interior design of this room based on both images.";
  }

  if (textHint && textHint.trim()) {
      return `${basePrompt} User hint: "${textHint.trim()}"`;
  }

  return basePrompt;
};

const urlToDataUrl = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject(new Error("Failed to convert blob to data URL"));
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error(`Failed to fetch and convert URL ${url}:`, error);
        throw new Error(`Could not load image from URL.`);
    }
};

const getPartsFromDataUrl = (dataUrl: string) => {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
        console.error("Invalid data URL received:", dataUrl.substring(0, 100));
        throw new Error('Invalid data URL format');
    }
    return { mimeType: match[1], data: match[2] };
};

const generateImageFromApi = async (parts: any[]): Promise<string> => {
  let response: any;

  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });
  } catch (error: any) {
    console.error("❌ Gemini API request error:", error);
    throw new Error("Der Bildgenerator ist derzeit nicht erreichbar. Bitte später erneut versuchen.");
  }

  // BASIC STRUCTURE CHECKS
  if (!response || !response.candidates || response.candidates.length === 0) {
    console.error("❌ Leere oder ungültige Gemini-Antwort:", response);
    throw new Error("Die KI hat keine Antwort zurückgegeben.");
  }

  const candidate = response.candidates[0];

  // SAFETY BLOCK CHECK
  if (candidate.finishReason === "SAFETY") {
    console.error("❌ Gemini Safety blockiert die Anfrage:", response);
    throw new Error(
      "Die KI hat diese Visualisierung aus Sicherheitsgründen abgelehnt. Bitte ein anderes Muster / andere Farbe probieren."
    );
  }

  // CONTENT CHECK
  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    console.error("❌ Keine content.parts vorhanden:", response);
    throw new Error("Die KI konnte kein Bild generieren. (Keine parts erhalten)");
  }

  // INLINE DATA CHECK
  const imagePart = candidate.content.parts.find((p: any) => p.inlineData);

  if (!imagePart || !imagePart.inlineData || !imagePart.inlineData.data) {
    console.error("❌ parts vorhanden, aber keine inlineData:", response);
    throw new Error("Die KI hat kein Bild zurückgegeben.");
  }

  // SUCCESS
  return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
};

interface GenerateOptions {
  roomImage: string;
  mode: VisualizationMode | null;
  patternImage?: string;
  preset?: PresetType;
  wallColor?: RALColor;
  textHint?: string;
}

export const generateVisualization = async (options: GenerateOptions): Promise<string> => {
    const { roomImage, mode, patternImage, preset, wallColor, textHint } = options;

    const finalRoomDataUrl = roomImage.startsWith('data:') 
        ? roomImage 
        : await urlToDataUrl(roomImage);

    try {
        const roomParts = getPartsFromDataUrl(finalRoomDataUrl);
        const contentParts: any[] = [{ inlineData: roomParts }];
        let generatedImage: string;

        switch (mode) {
            case 'pattern':
                if (!patternImage || !preset) throw new Error('Pattern image and preset are required for pattern mode.');
                const finalPatternDataUrl = patternImage.startsWith('data:')
                    ? patternImage
                    : await urlToDataUrl(patternImage);
                const patternParts = getPartsFromDataUrl(finalPatternDataUrl);
                contentParts.push({ inlineData: patternParts });
                contentParts.push({ text: getPromptForPreset(preset, textHint) });
                generatedImage = await generateImageFromApi(contentParts);
                break;

            case 'creativeWallColor':
                if (!wallColor) throw new Error('Wall color is required for creative color mode.');
                let creativePrompt = `Streiche die Wände in einem harmonischen ${wallColor.name} (RAL ${wallColor.code}). Passe Licht, Schatten und Atmosphäre natürlich an.`;
                if (textHint) creativePrompt += ` Zusätzlicher Hinweis: "${textHint}"`;
                contentParts.push({ text: creativePrompt });
                generatedImage = await generateImageFromApi(contentParts);
                break;
            
            case 'exactRAL':
                 if (!wallColor) throw new Error('Wall color is required for exact RAL mode.');
                 const maskPrompt = `Erstelle ausschließlich eine BINÄRE Wand-Maske (schwarz/weiß). Keine Farben generieren. Keine Beleuchtung. Keine Texturen. Keine Schatten. Nur eine Maske der Wandflächen im Bild. Die Wandflächen sollen weiß sein, alles andere schwarz.`;
                 contentParts.push({ text: maskPrompt });
                 const maskImageUrl = await generateImageFromApi(contentParts);
                 generatedImage = await applyRALColor(finalRoomDataUrl, maskImageUrl, wallColor.hex);
                 break;

            default:
                throw new Error('Invalid visualization mode selected.');
        }
        
        // Apply the watermark to the generated result
        return await addWatermarkToImage(generatedImage);

    } catch (error) {
        console.error("Error calling Gemini API or processing data:", error);
        throw new Error('Failed to generate visualization.');
    }
};
