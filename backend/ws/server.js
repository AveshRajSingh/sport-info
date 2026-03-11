import { WebSocketServer, WebSocket } from "ws";

export function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

export function broadcast(wss, payload) {
    if (wss.clients.size === 0) return;

    wss.clients.forEach(client => {
        sendJson(client, payload);
    });
}

export const attachWebSocketServer = (server) => {
    const wss = new WebSocketServer({
        server,
        path: "/ws",
        maxPayload: 1024 * 1024
    });

    wss.on("connection", (socket) => {

        sendJson(socket, { type: "Welcome" });

        socket.on("error", (error) => {
            console.error("WebSocket error:", error);
        });

    });

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: "Match_created", data: match });

     }

     return {
        broadcastMatchCreated
     }
};