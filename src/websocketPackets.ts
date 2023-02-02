interface WSPacket {
    type: string;
}

interface WSPacketPartialRecognition {
    type: "partialRecognition";
    text: string;
}

interface WSPacketFinalRecognition {
    type: "finalRecognition";
    text: string;
}

interface WSPacketChangeLanguage {
    type: "changeLanguage";
    langFrom: string;
    langTo: string;
}
