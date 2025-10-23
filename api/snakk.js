// Importer Google AI-pakken
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Hent den hemmelige nøkkelen Vercel har lagret
// Vi bruker process.env.GOOGLE_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Definer personlighetene
const yrkePrompts = {
  snekker: "Du er en vennlig snekker i Norge. Svar kort og enkelt på norsk. Ikke si du er en AI.",
  lege: "Du er en omsorgsfull lege i Norge. Svar kort og enkelt på norsk. Ikke si du er en AI.",
  // Legg til flere yrker her, f.eks:
  // laerer: "Du er en tålmodig lærer på en barneskole. Svar kort og enkelt på norsk."
};

// Dette er selve vaktmester-funksjonen
module.exports = async (req, res) => {
  try {
    // Hent dataen som "Ansiktet" (frontend) sendte
    // Vi sjekker req.body, men Vercel pakker den noen ganger inn annerledes
    const body = req.body || {};
    const { yrke, melding } = body;

    if (!yrke || !melding) {
      return res.status(400).json({ error: "Mangler yrke eller melding" });
    }

    // Velg riktig personlighet
    const systemPrompt = yrkePrompts[yrke] || "Du er en hjelpsom assistent.";

    // Start modellen
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Lag en "samtale" med riktig personlighet
    const chat = model.startChat({
      history: [
        // Dette er system-instruksjonen
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Ok, jeg er klar." }] } // Et lite triks for å starte samtalen
      ],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    // Send den nye meldingen fra eleven til AI-en
    const result = await chat.sendMessage(melding);
    const response = await result.response;
    const aiSvar = response.text();

    // Send svaret fra AI-en tilbake til "Ansiktet"
    res.status(200).json({ svar: aiSvar });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Noe gikk galt med AI-en" });
  }
};
