# Middagsmaskinen – plan

Mobil-PWA på svenska som svarar på "vad ska vi äta?".

- [x] 1. Projektskelett: index.html, style.css, app.js, flikar (Recept, Kylskåp, Veckomeny, Inköp)
- [x] 2. recipes.json med 40 vardagsrecept (≤30 min, taggar snabb/billig/veg/matlåda, avdelning per ingrediens)
- [x] 3. Receptlista med taggfilter + receptvy (ingredienser & steg)
- [x] 4. Mitt kylskåp: skriv eller bocka i ingredienser
- [x] 5. Kylskåpsmatchning: recept sorterade efter hur mycket du har
- [x] 6. Veckomeny med ett klick (7 olika rätter)
- [x] 7. Byt rätt i veckomenyn med swipe
- [x] 8. Inköpslista automatiskt, summerad och sorterad efter butiksavdelning
- [x] 9. Bocka av i butiken (+ "har hemma" från kylskåpet)
- [x] 10. "Överraska mig"-knapp med rolig animation
- [x] 11. Allt sparas lokalt (localStorage)
- [x] 12. Offline: manifest + service worker + ikoner
- [x] 13. Snygg mobil-först-design och polish
- [x] 14. End-to-end-test i Playwright (mobilvy, offline)
- [x] 15. README med hur man kör
- [x] 16. Middagsdejt (Tinder-läge): swipea höger/vänster på rätter, gillade -> recept + favoriter
- [x] 17. Erbjudanden (ICA Kvantum Teleborg): klistra in veckans erbjudanden -> appen känner igen råvaror och tipsar om recept

## Problem / anteckningar
- ica.se är blockerat av nätverket i byggmiljön (403), och en PWA kan inte hämta ica.se direkt (CORS).
  Stammis-erbjudanden kräver inloggning. Lösning: klistra in erbjudandetext -> automatisk igenkänning.

## Status
Alla uppgifter klara. `node tests/e2e.js` → 25/25 gröna (iPhone 13-vy, offline, sparning).

## Omgång 2
- [x] 18. Portionsskala: välj antal portioner, mängder + inköpslista räknas om
- [x] 19. Budgetmätare: ungefärliga priser per råvara, kostnad per rätt/vecka/portion, erbjudanden −25 %
- [x] 20. Skaka mobilen = Överraska mig (magisk åtta-boll-stil)
- [x] 21. Matlagningsläge: stora steg, swipe, skärmen hålls vaken, timer som piper
- [x] 22. Veckans DJ: musiktips per kök (Spotify-sök), soundtrack för veckan
- [x] 23. Utöka e2e-testet för allt ovan
- Chromium kräver numera tillstånd för rörelsesensorer (som iOS) -> skaka-läget slås på via knapp (användargest).
- Shakshuka tappade taggen "billig" – kostar ~109 kr/4 port enligt prislistan. Gräns för billig: ≤100 kr/4 port.
- Status omgång 2: `node tests/e2e.js` -> 44/44 gröna, 6 körningar i rad.
