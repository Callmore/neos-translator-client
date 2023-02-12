interface WSPacketPartialRecognition {
    type: "partialRecognition";
    text: string;
}

interface WSPacketFinalRecognition {
    type: "finalRecognition";
    origanal: string;
    translated: string;
}

interface WSPacketHeartBeat {
    type: "heartBeat";
}

interface WSPacketInfo {
    type: "info";
    msg: string;
}

type WSPacket =
    | WSPacketPartialRecognition
    | WSPacketFinalRecognition
    | WSPacketHeartBeat
    | WSPacketInfo;
