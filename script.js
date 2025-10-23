document.addEventListener('DOMContentLoaded', () => {
    // Hent alle elementene vi trenger
    const yrkeGrid = document.querySelector('.yrke-grid');
    const chatContainer = document.getElementById('chat-container');
    const chatLogg = document.getElementById('chat-logg');
    const chatTittel = document.getElementById('chat-tittel');
    const chatInput = document.getElementById('chat-input');
    const sendKnapp = document.getElementById('send-knapp');
    const tilbakeKnapp = document.getElementById('tilbake-knapp');

    // Denne variabelen holder styr på hvilket yrke vi snakker med
    let aktivtYrke = null; 

    // Funksjon når noen klikker på et yrkeskort
    yrkeGrid.addEventListener('click', (e) => {
        // Finn det kortet som ble klikket, selv om man traff bildet
        const kort = e.target.closest('.yrke-kort'); 
        if (kort) {
            aktivtYrke = kort.dataset.yrke; // F.eks. "snekker"
            
            // Vis chat-vinduet og skjul rutenettet
            yrkeGrid.classList.add('skjult');
            chatContainer.classList.remove('skjult');
            
            // Sett riktig tittel
            chatTittel.innerText = `Du snakker med: ${aktivtYrke}`;
            chatLogg.innerHTML = ''; // Tøm chatten
            chatInput.value = ''; // Tøm input
        }
    });

    // Funksjon for å gå tilbake
    tilbakeKnapp.addEventListener('click', () => {
        yrkeGrid.classList.remove('skjult');
        chatContainer.classList.add('skjult');
        aktivtYrke = null;
    });

    // Funksjon når "Send" klikkes
    sendKnapp.addEventListener('click', () => {
        sendMeldingTilBackend();
    });

    // Funksjon for å sende med Enter-tasten
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMeldingTilBackend();
        }
    });

    // DEN VIKTIGSTE FUNKSJONEN: Send melding til "Vaktmesteren" (Backend)
    async function sendMeldingTilBackend() {
        const melding = chatInput.value;
        if (melding.trim() === '' || !aktivtYrke) return;

        // 1. Vis brukerens melding i chatten
        leggTilMelding(melding, 'bruker');
        chatInput.value = ''; // Tøm inputfeltet
        sendKnapp.disabled = true; // Deaktiver knappen mens vi venter
        leggTilMelding("...", 'ai'); // Vis "tenker"-prikker

        try {
            // 2. Send meldingen til VÅR EGEN backend (Vaktmesteren)
            // Vi sender til '/api/snakk', som Vercel automatisk ruter
            const respons = await fetch('/api/snakk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    yrke: aktivtYrke,
                    melding: melding,
                }),
            });

            // Fjern "tenker"-prikkene
            chatLogg.removeChild(chatLogg.lastChild);

            if (!respons.ok) {
                throw new Error('Nettverksfeil fra server');
            }

            const data = await respons.json();

            // 3. Vis svaret fra AI-en i chatten
            leggTilMelding(data.svar, 'ai');

        } catch (error) {
            // Hvis noe feiler, fjern prikkene og gi feilmelding
            if(chatLogg.lastChild.innerText === "...") {
                 chatLogg.removeChild(chatLogg.lastChild);
            }
            leggTilMelding('Beklager, noe gikk galt. Prøv igjen.', 'ai');
            console.error(error); // For feilsøking
        } finally {
            sendKnapp.disabled = false; // Aktiver knappen igjen
            chatInput.focus(); // Sett fokus tilbake på inputfeltet
        }
    }

    // Hjelpefunksjon for å vise meldinger i loggen
    function leggTilMelding(tekst, avsender) {
        const meldingDiv = document.createElement('div');
        // Gjør om \n (linjeskift) til <br>
        meldingDiv.innerHTML = tekst.replace(/\n/g, '<br>'); 
        meldingDiv.className = avsender === 'bruker' ? 'melding-bruker' : 'melding-ai';
        chatLogg.appendChild(meldingDiv);
        chatLogg.scrollTop = chatLogg.scrollHeight; // Rull til bunnen
    }
});
