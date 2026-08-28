# INSU PDF-läsare

En enkel GitHub Pages-läsare för PDF-kursmaterial.

## Vad den gör

- Visar PDF:en via PDF.js i en egen läsare.
- Ingen synlig nedladdningsknapp.
- Ingen synlig utskriftsknapp.
- Ingen text-layer, vilket gör vanlig textmarkering/kopiering otillgänglig.
- Blockerar högerklick.
- Blockerar vanliga kortkommandon för kopiera, spara, skriva ut och visa källkod.
- Gör utskrift från sidan blank via CSS.
- Har endast sidbyte och zoom.

## Viktigt

Detta är ett användargränssnittsskydd, inte DRM.

En tekniskt kunnig användare kan fortfarande hitta själva PDF-anropet via webbläsarens utvecklarverktyg om PDF-filen ligger publikt i samma GitHub Pages-repo. Skärmbilder kan inte heller blockeras pålitligt från en vanlig webbsida.

För ert användningsfall är detta främst tänkt att ta bort de normala, synliga möjligheterna att ladda ner, skriva ut och kopiera.

## Lägg in PDF-filen

1. Lägg PDF-filen i samma mapp som `index.html`.
2. Döp den till:

   `document.pdf`

   Alternativt ändrar du raden:

   `const PDF_FILE = "./document.pdf";`

   i `app.js`.

## Ändra dokumenttitel

Öppna `app.js` och ändra:

`const DOCUMENT_TITLE = "Kurslitteratur";`

## Publicera på GitHub Pages

1. Skapa ett nytt GitHub-repo.
2. Ladda upp:
   - `index.html`
   - `style.css`
   - `app.js`
   - `document.pdf`
3. Gå till **Settings → Pages**.
4. Under **Build and deployment**, välj **Deploy from a branch**.
5. Välj `main` och `/ (root)`.
6. Spara.
7. GitHub visar sedan adressen till sidan.

## Rekommenderat

Använd ett separat repo för varje dokument eller utbildning om ni vill hålla filstrukturen enkel.

Lägg gärna till `noindex` och undvik att länka GitHub-repots råa filsida till studenterna. `index.html` innehåller redan en `robots`-tagg som ber sökmotorer att inte indexera sidan, men det är ingen åtkomstkontroll.
