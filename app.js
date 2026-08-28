import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

/*
  Byt filnamn här om PDF-filen heter något annat.
  Lägg PDF-filen i samma mapp som index.html.
*/
const PDF_FILE = "./document.pdf";

/*
  Ändra gärna titeln som visas högst upp.
*/
const DOCUMENT_TITLE = "Kurslitteratur";

const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const pageWrap = document.getElementById("pageWrap");
const message = document.getElementById("message");

const prevButton = document.getElementById("prevPage");
const nextButton = document.getElementById("nextPage");
const zoomOutButton = document.getElementById("zoomOut");
const zoomInButton = document.getElementById("zoomIn");
const pageInfo = document.getElementById("pageInfo");
const zoomInfo = document.getElementById("zoomInfo");
const documentTitle = document.getElementById("documentTitle");

documentTitle.textContent = DOCUMENT_TITLE;

let pdfDoc = null;
let currentPage = 1;
let scale = 1.15;
let rendering = false;
let pendingPage = null;

function setMessage(text, isError = false) {
  message.hidden = false;
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function updateControls() {
  if (!pdfDoc) return;

  pageInfo.textContent = `Sida ${currentPage} / ${pdfDoc.numPages}`;
  zoomInfo.textContent = `${Math.round(scale * 100)} %`;

  prevButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= pdfDoc.numPages;
  zoomOutButton.disabled = scale <= 0.65;
  zoomInButton.disabled = scale >= 2.5;
}

async function renderPage(pageNumber) {
  rendering = true;

  try {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    const outputScale = window.devicePixelRatio || 1;

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const renderContext = {
      canvasContext: ctx,
      viewport,
      transform:
        outputScale !== 1
          ? [outputScale, 0, 0, outputScale, 0, 0]
          : null
    };

    await page.render(renderContext).promise;

    message.hidden = true;
    pageWrap.hidden = false;
    updateControls();
  } catch (error) {
    console.error(error);
    setMessage("Dokumentet kunde inte visas. Kontrollera att document.pdf finns i samma mapp.", true);
  } finally {
    rendering = false;

    if (pendingPage !== null) {
      const pageToRender = pendingPage;
      pendingPage = null;
      renderPage(pageToRender);
    }
  }
}

function queueRender(pageNumber) {
  if (rendering) {
    pendingPage = pageNumber;
  } else {
    renderPage(pageNumber);
  }
}

function goToPage(pageNumber) {
  if (!pdfDoc) return;
  if (pageNumber < 1 || pageNumber > pdfDoc.numPages) return;

  currentPage = pageNumber;
  queueRender(currentPage);
}

prevButton.addEventListener("click", () => goToPage(currentPage - 1));
nextButton.addEventListener("click", () => goToPage(currentPage + 1));

zoomOutButton.addEventListener("click", () => {
  scale = Math.max(0.65, +(scale - 0.15).toFixed(2));
  queueRender(currentPage);
});

zoomInButton.addEventListener("click", () => {
  scale = Math.min(2.5, +(scale + 0.15).toFixed(2));
  queueRender(currentPage);
});

/*
  Best-effort skydd mot vanliga sätt att kopiera/spara/skriva ut.
  Detta är inte DRM och kan inte stoppa en tekniskt kunnig användare.
*/
document.addEventListener("contextmenu", (event) => event.preventDefault());
document.addEventListener("dragstart", (event) => event.preventDefault());
document.addEventListener("copy", (event) => event.preventDefault());
document.addEventListener("cut", (event) => event.preventDefault());

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const mod = event.ctrlKey || event.metaKey;

  if (mod && ["c", "s", "p", "u"].includes(key)) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  if (event.key === "PrintScreen") {
    /*
      Webbläsare kan inte tillförlitligt blockera skärmbilder på OS-nivå.
      Vi tömmer clipboard som en liten extra åtgärd där det stöds.
    */
    navigator.clipboard?.writeText("").catch(() => {});
  }

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    goToPage(currentPage - 1);
  }

  if (event.key === "ArrowRight" || event.key === "PageDown") {
    event.preventDefault();
    goToPage(currentPage + 1);
  }
});

window.addEventListener("beforeprint", () => {
  document.body.dataset.printAttempt = "blocked";
});

async function init() {
  try {
    setMessage("Laddar dokument…");

    const loadingTask = pdfjsLib.getDocument({
      url: PDF_FILE,
      disableAutoFetch: false,
      disableStream: false
    });

    pdfDoc = await loadingTask.promise;
    updateControls();
    await renderPage(currentPage);
  } catch (error) {
    console.error(error);
    setMessage(
      "PDF-filen kunde inte laddas. Lägg filen i samma mapp och döp den till document.pdf.",
      true
    );
  }
}

init();
