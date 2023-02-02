namespace ws {
    let connection: WebSocket | undefined = undefined;

    // TODO: Sanitise languages to make sure the correct language format is sent
    export function connect(
        userID: string,
        langFrom: Language,
        langTo: Language
    ) {
        const url = new URL("ws://localhost:8080/speech");
        url.searchParams.set("langfrom", languageToTranslationLang[langFrom]);
        url.searchParams.set("langto", languageToTranslationLang[langTo]);
        url.searchParams.set("userid", userID);

        initialise(url);
    }

    function initialise(url: URL) {
        connection = new WebSocket(url);
        connection.addEventListener("open", () => {
            connectionStatusInfo.innerText = "Connected.";
        });
        connection.addEventListener("close", (e) => {
            connectionStatusInfo.innerText = `Disconnected. (Code: ${e.code}, Message: ${e.reason})`;

            connection?.close();
            connection = undefined;
        });
        connection.addEventListener("error", (e) => {
            connectionStatusInfo.innerText = `Websocket error, see console for more details.`;
            console.error("Websocket error:", e);

            connection?.close();
            connection = undefined;
        });
    }

    export function isConnected() {
        return (
            connection != undefined &&
            connection.readyState != WebSocket.CLOSED &&
            connection.readyState != WebSocket.CLOSING
        );
    }

    export function sendPartial(text: string) {
        if (connection == undefined) {
            return;
        }

        connection.send(
            JSON.stringify({
                type: "partialRecognition",
                text: text,
            } as WSPacketPartialRecognition)
        );
    }

    export function sendFinal(text: string) {
        if (connection == undefined) {
            return;
        }

        connection.send(
            JSON.stringify({
                type: "finalRecognition",
                text: text,
            } as WSPacketFinalRecognition)
        );
    }

    // TODO: Sanitise languages to make sure the correct language format is sent
    export function changeLang(langFrom: Language, langTo: Language) {
        if (connection == undefined) {
            return;
        }

        connection.send(
            JSON.stringify({
                type: "changeLanguage",
                langFrom: langFrom,
                langTo: langTo,
            } as WSPacketChangeLanguage)
        );
    }
}
