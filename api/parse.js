const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

const SYSTEM_PROMPT = `Sos un asistente especializado en extraer materiales de planificaciones de peulot (actividades educativas judías).

Dado el texto de una planificación, extraé TODOS los materiales mencionados y devolvé ÚNICAMENTE un objeto JSON válido (sin markdown, sin texto extra), con exactamente esta estructura:

{
  "rows": [
    {
      "momento": "nombre del momento (ej: Apertura, Instancia 1, Cierre)",
      "material": "nombre del material o elemento principal",
      "cantidad": "cantidad como string (ej: '1', '6', '12 pares')",
      "quienNombre": "nombre propio de quien lo trae, o null",
      "como": ["sub-material 1", "paso 2"],
      "links": [{"url": "https://...", "label": "dominio.com"}],
      "estado": "porhacer"
    }
  ]
}

Reglas:
- Cada material de cada momento es una fila separada
- "material": el objeto principal, no sus componentes (ej: "Tablero de juego", no "marcadores")
- "como": componentes o pasos para armar/conseguir el material principal
- "quienNombre": solo nombre propio (ej: "Sofi"), null si no se menciona
- "links": solo URLs explícitas en el texto, con "label" = dominio sin www
- "estado": siempre "porhacer"
- Si no hay materiales claros, devolvé {"rows": []}`;

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text } = req.body || {};
  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Extraé los materiales de esta planificación:\n\n${text}`,
        },
      ],
    });

    const raw = message.content[0].text;
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in model response");

    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed.rows)) throw new Error("Missing rows array");

    return res.status(200).json({ rows: parsed.rows });
  } catch (err) {
    console.error("parse error:", err.message);
    return res.status(500).json({ error: "Failed to parse planning", details: err.message });
  }
};
