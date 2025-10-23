// TEMPORÆR FEILSØKINGS-KODE
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Hent nøkkelen
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

module.exports = async (req, res) => {
  try {
    // Denne koden starter ikke en chat.
    // Den spør Google: "Hvilke modeller har du?"
    console.log("Forsøker å liste modeller...");

    const modelInfo = await genAI.listModels();
    const models = modelInfo.models; // Hent ut listen

    // Lag en enkel tekstliste av modellene
    let modellListe = "Gratulerer! Betalingen fungerer!\n\nTilgjengelige modeller:\n";
    for (const m of models) {
      // Vi vil bare se "generative" modeller
      if (m.name.includes("models/")) {
         modellListe += `\n- ${m.name}`;
      }
    }

    // Send denne listen som et "svar"
    res.status(200).json({ svar: modellListe });

  } catch (error) {
    console.error("Feil ved listing av modeller:", error);
    // Send selve feilmeldingen tilbake så vi kan se den
    res.status(500).json({ svar: `Klarte ikke hente modeller: ${error.message}` });
  }
};
