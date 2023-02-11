namespace ws {
    let connection: WebSocket | undefined = undefined;

    let connectionLangFrom: Language | undefined = undefined;
    let connectionLangTo: Language | undefined = undefined;

    // TODO: Sanitise languages to make sure the correct language format is sent
    export function connect(
        userID: string,
        langFrom: Language,
        langTo: Language
    ) {
        const url = new URL(window.location.href);
        url.protocol = url.protocol.replace("http", "ws");
        url.pathname = "ws/speech";

        url.searchParams.set("langfrom", languageToTranslationLang[langFrom]);
        url.searchParams.set("langto", languageToTranslationLang[langTo]);
        url.searchParams.set("userid", userID);

        connectionLangFrom = langFrom;
        connectionLangTo = langTo;

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
            connectionLangFrom = undefined;
            connectionLangTo = undefined;
        });
        connection.addEventListener("message", (e) => {
            // Try to parse the JSON
            let data;
            try {
                data = JSON.parse(e.data) as WSPacket;
            } catch (e) {
                connection?.close(4000, "Invalid data packet");
                throw e;
            }

            switch (data.type) {
                case "heartBeat":
                    // Send a heartbeat back
                    connection?.send(
                        JSON.stringify({
                            type: "heartBeat",
                        } as WSPacketHeartBeat)
                    );
                    break;

                // TODO: Make this show up in the window somewhere
                case "info":
                    // Info message!
                    console.log("INFO: ", data.msg);

                default:
                    // what
                    connection?.close(4000, "Invalid data packet");
            }
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

    export async function sendFinal(text: string) {
        if (connection == undefined) {
            return;
        }

        if (connectionLangFrom == undefined || connectionLangTo == undefined) {
            return;
        }

        const translatedText = await translateText(
            text,
            connectionLangFrom,
            connectionLangTo
        );

        connection.send(
            JSON.stringify({
                type: "finalRecognition",
                origanal: text,
                translated: translatedText,
            } as WSPacketFinalRecognition)
        );

        return translatedText;
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

        connectionLangFrom = langFrom;
        connectionLangTo = langTo;
    }
}
