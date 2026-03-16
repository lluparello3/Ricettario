export const analyzeRecipeLink = async (url) => {
  const payload = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [
      {
        role: "user",
        content: `Visita questo link e analizza la ricetta: ${url}. Restituisci un JSON con questi campi: { riassunto: '3-5 righe', ingredienti_principali: ['...'], tecnica_chiave: '...', note_culturali: '...' }`
      }
    ]
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true' // Helpful for direct browser calls
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("AI analysis failed", error);
    throw error;
  }
};
