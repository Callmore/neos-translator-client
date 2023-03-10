const startTranslator = document.getElementById(
    "start-translator-btn"
) as HTMLButtonElement;
const previewContainer = document.getElementById(
    "preview-container"
) as HTMLDivElement;
const previewHide = document.getElementById(
    "hide-preview-btn"
) as HTMLButtonElement;
const connectButton = document.getElementById(
    "connect-btn"
) as HTMLButtonElement;
const connectionStatusInfo = document.getElementById(
    "connection-status"
) as HTMLSpanElement;
const infoContainer = document.getElementById(
    "info-container"
) as HTMLDivElement;

const APIURLEntry = document.getElementById(
    "translateurl-entry"
) as HTMLInputElement;
const userIDEntry = document.getElementById("userid-entry") as HTMLInputElement;
const langFromEntry = document.getElementById(
    "langfrom-entry"
) as HTMLSelectElement;
const langToEntry = document.getElementById(
    "langto-entry"
) as HTMLSelectElement;

const speechRecognition =
    window.SpeechRecognition ?? window.webkitSpeechRecognition;

if (speechRecognition == undefined) {
    startTranslator.disabled = true;

    const app = document.getElementById("app") as HTMLDivElement;
    const unsupportedPopup = document.getElementById(
        "unsupported-popup"
    ) as HTMLDivElement;
    app.style.display = "none";
    unsupportedPopup.style.display = "block";

    throw new Error(
        "Browser does not support SpeechRecognition or webkitSpeechRecognition."
    );
}

APIURLEntry.addEventListener("change", (e) => {
    e.preventDefault();

    if (window.localStorage != undefined) {
        window.localStorage.setItem("APIURL", APIURLEntry.value);
    }
});

if (window.localStorage?.getItem("APIURL") != undefined) {
    APIURLEntry.value = window.localStorage.getItem("APIURL")!;
}

// Prefill the userid with the userid query parameter
const queryParams = new URLSearchParams(window.location.search);
if (queryParams.has("userid")) {
    userIDEntry.value = queryParams.get("userid")!;
}

// Setup the language boxes
// Setup recognition
const recognition = new speechRecognition();

let translatorEnabled = false;
let activePreviewElement: HTMLParagraphElement | undefined = undefined;

let previewHidden = false;

// TODO: allow for a selectable language.
recognition.continuous = true;
recognition.interimResults = true;

recognition.addEventListener("result", (e) => {
    const latestResult = e.results[e.results.length - 1];
    const { isFinal } = latestResult;
    const { transcript } = Array.from(latestResult).sort(
        (a, b) => a.confidence - b.confidence
    )[0];
    let finalTranslatedText: Promise<string | undefined> | undefined =
        undefined;

    // Send the translation off thought the websocket
    if (isFinal) {
        finalTranslatedText = ws.sendFinal(transcript);
    } else {
        ws.sendPartial(transcript);
    }

    if (previewHidden) {
        return;
    }

    if (!isFinal) {
        if (activePreviewElement == undefined) {
            activePreviewElement = document.createElement("p");
            activePreviewElement.classList.add("preview-not-final");
            previewContainer.appendChild(activePreviewElement);
        }

        activePreviewElement.innerText = transcript;
        return;
    }

    if (activePreviewElement == undefined) {
        activePreviewElement = document.createElement("p");
        previewContainer.appendChild(activePreviewElement);
    }

    activePreviewElement.classList.remove("preview-not-final");
    activePreviewElement.classList.add("preview-final");
    activePreviewElement.innerText = `${transcript} \u2192 ...`;

    const preivewElement = activePreviewElement;
    finalTranslatedText
        ?.then(
            (value) => {
                if (value == undefined) {
                    preivewElement.innerText = transcript;
                    return;
                }
                preivewElement.innerText = `${transcript} \u2192 ${value}`;
            },
            () => {}
        )
        .then(() => {
            preivewElement.classList.add("preview-fade-out");
            setTimeout(() => {
                preivewElement.remove();
            }, 10000);
        });

    activePreviewElement = undefined;
});

recognition.addEventListener("end", (e) => {
    e.preventDefault();

    if (translatorEnabled) {
        recognition.start();
    }
});

startTranslator.addEventListener("click", (e) => {
    e.preventDefault();

    translatorEnabled = !translatorEnabled;

    if (translatorEnabled) {
        beginTranslator();
    } else {
        endTranslator();
    }

    startTranslator.disabled = true;
    startTranslator.classList.add("btn-delaying");
    setTimeout(() => {
        startTranslator.disabled = false;
        startTranslator.classList.remove("btn-delaying");
    }, 500);
});

function beginTranslator() {
    startTranslator.classList.add("btn-pressed");
    startTranslator.innerText = "Stop Translator";
    recognition.start();
}

function endTranslator() {
    startTranslator.classList.remove("btn-pressed");
    startTranslator.innerText = "Start Translator";
    recognition.stop();
}

previewHide.addEventListener("click", (e) => {
    e.preventDefault();

    previewHidden = !previewHidden;

    if (previewHidden) {
        hidePreview();
    } else {
        unhidePreview();
    }
});

function hidePreview() {
    previewHide.classList.remove("btn-pressed");
    previewHide.innerText = "Show";

    previewContainer.replaceChildren();
    activePreviewElement?.remove();
    activePreviewElement = undefined;
    previewContainer.style.display = "hidden";
}

function unhidePreview() {
    previewHide.classList.add("btn-pressed");
    previewHide.innerText = "Hide";
}

connectButton.addEventListener("click", () => {
    if (ws.isConnected()) {
        ws.disconnect();
        return;
    }

    connectButton.disabled = true;
    connectButton.innerText = "Connecting...";

    ws.connect(userIDEntry.value);
});

function infoLog(msg: string) {
    const now = new Date();

    const elm = document.createElement("p");
    elm.innerHTML = `${now.toLocaleTimeString()} - ${msg}`;

    infoContainer.appendChild(elm);
    infoContainer.scrollTop = infoContainer.scrollHeight;
}

console.log("Webpage loaded!");
