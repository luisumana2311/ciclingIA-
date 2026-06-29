const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generarAnalisisIA = async ({
  perfil,
  objetivoPrincipal,
  semana,
  perfilDinamicoV2,
}) => {
  try {
    const prompt = `
Eres un entrenador digital especializado en ciclismo.

Analiza la información y responde únicamente en formato JSON válido.

No inventes datos.
No cambies el plan.
No diagnostiques lesiones.
Sé breve y profesional.

Datos del atleta:
${JSON.stringify(perfil, null, 2)}

Objetivo principal:
${JSON.stringify(objetivoPrincipal, null, 2)}

Semana actual:
${JSON.stringify(semana, null, 2)}

Perfil dinámico:
${JSON.stringify(perfilDinamicoV2, null, 2)}

Formato de respuesta:

{
  "resumen": "",
  "interpretacion": "",
  "recomendacion": "",
  "alerta": ""
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error IA:", error.message);

    return {
      resumen: "No fue posible generar el análisis.",
      interpretacion: "",
      recomendacion: "",
      alerta: "Servicio IA no disponible.",
    };
  }
};

module.exports = {
  generarAnalisisIA,
};
