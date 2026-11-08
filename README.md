# 🍽️ Middagsmaskinen

En mobil-PWA på svenska som svarar på den eviga frågan **"vad ska vi äta?"**
Inget login, inga servrar – allt sparas i telefonen och funkar offline.

## Funktioner
- **Recept** – 40 vardagsrätter (max 30 min) med taggarna snabb / billig / veg / matlåda, sök och filter.
- **Middagsdejt 💘** – Tinder för middagar. Swipea höger = gilla (receptet visas direkt), vänster = nej.
  Gillade rätter blir favoriter och dyker oftare upp i veckomenyn och "Överraska mig".
- **Mitt kylskåp 🧊** – skriv ("ägg, pasta, lök") eller bocka i vad du har. Appen visar recepten som använder mest av det.
- **Veckans erbjudanden 🏷️** – klistra in erbjudanden (t.ex. från ICA Kvantum Teleborg i ICA-appen,
  även Stammis-erbjudanden). Appen känner igen råvarorna och tipsar om recept.
- **Veckomeny 📅** – en knapptryckning ger 7 rätter. Swipea en dag åt sidan (eller tryck 🔄) för att byta.
- **Inköpslista 🛒** – skapas automatiskt från veckomenyn, summerar mängder, sorteras efter butiksavdelning,
  markerar vad du redan har hemma och vad som är på erbjudande. Bocka av i butiken.
- **🎲 Överraska mig** – enarmad bandit med konfetti. Slå på **📳 skaka-läge** och skaka mobilen som en magisk åtta-boll.
- **👥 Portioner** – välj 1–12 portioner, alla mängder och inköpslistan räknas om.
- **💰 Budgetmätare** – ungefärliga normalpriser per råvara ger kostnad per rätt, portion och vecka.
  Råvaror på erbjudande räknas med ca 25 % rabatt.
- **👩‍🍳 Matlagningsläge** – stora steg, swipea framåt, skärmen hålls vaken, timer som piper och vibrerar
  (läser själv av "15 min" ur steget).
- **🎧 Veckans DJ** – musiktips per kök med Spotify-sökningar, plus ett soundtrack för hela veckan.

## Kör
```bash
python3 -m http.server 8000
```
Öppna `http://<datorns-ip>:8000` i mobilen och välj "Lägg till på hemskärmen".
(Service worker kräver https eller localhost – lägg den t.ex. på GitHub Pages för riktig installation.)

## Utveckla
- Recepten, priserna och DJ-listorna genereras med kontroller (≤30 min, veg utan kött, billig ≤100 kr/4 port osv): `python3 tools/build_recipes.py`
- Test (Playwright, mobilvy + offline): `node tests/e2e.js`
- Höj `VERSION` i `sw.js` när filer ändras, så får mobilen nya versionen.

## Varför hämtas inte ICA-erbjudanden automatiskt?
ICA har inget öppet API, webbläsaren blockerar anrop från appen till ica.se (CORS) och Stammis kräver
inloggning. Klistra-in-lösningen funkar offline och utan att lämna ut ditt konto.
