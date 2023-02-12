namespace ws {
    let connection: WebSocket | undefined = undefined;

    export function connect(userID: string) {
        const url = new URL(window.location.href);
        url.protocol = url.protocol.replace("http", "ws");
        url.pathname = "ws/speech";

        url.searchParams.set("userid", userID);

        initialise(url);
    }

    function initialise(url: URL) {
        connection = new WebSocket(url);
        connection.addEventListener("open", () => {
            connectionStatusInfo.innerText = "Connected.";

            connectButton.innerText = "Disconnect";
            connectButton.disabled = false;
            connectButton.classList.add("btn-pressed");
        });
        connection.addEventListener("close", (e) => {
            switch (e.code) {
                case 1005:
                    connectionStatusInfo.innerText = `Not connected.`;
                    break;

                default:
                    connectionStatusInfo.innerText = `Disconnected. (Code: ${e.code}, Message: ${e.reason})`;
            }

            connection?.close();
            connection = undefined;

            connectButton.innerText = "Connect";
            connectButton.classList.remove("btn-pressed");
        });
        connection.addEventListener("error", (e) => {
            connectionStatusInfo.innerText = `Websocket error, see console for more details.`;
            console.error("Websocket error:", e);

            connection?.close();
            connection = undefined;
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
                    infoLog(data.msg);
                    break;

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
        if (!isConnected()) {
            return;
        }

        connection?.send(
            JSON.stringify({
                type: "partialRecognition",
                text: text,
            } as WSPacketPartialRecognition)
        );
    }

    export async function sendFinal(text: string) {
        if (!isConnected()) {
            return;
        }

        const translatedText = await translateText(
            text,
            langFromEntry.value as Language,
            langToEntry.value as Language
        );

        connection?.send(
            JSON.stringify({
                type: "finalRecognition",
                origanal: text,
                translated: translatedText,
            } as WSPacketFinalRecognition)
        );

        return translatedText;
    }

    export function disconnect() {
        if (!isConnected()) {
            return;
        }

        connection?.close();
    }
}
