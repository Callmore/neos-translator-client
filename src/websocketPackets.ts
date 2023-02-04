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

interface WSPacketHeartBeat {
    type: "heartBeat";
}

type WSPacket =
    | WSPacketPartialRecognition
    | WSPacketFinalRecognition
    | WSPacketChangeLanguage
    | WSPacketHeartBeat;
