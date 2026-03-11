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

        socket.isAlive = true;
        socket.on("pong", () => { socket.isAlive = true; });

        sendJson(socket, { type: "Welcome" });

        socket.on("error", (error) => {
            console.error("WebSocket error:", error);
        });

    });

    const interval = setInterval(() => {
        wss.clients.forEach(ws => {
            if(ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();

        })
    },30000)

    wss.on('close' ,() => {
        clearInterval(interval);
    })

    function broadcastMatchCreated(match) {
        broadcast(wss, { type: "Match_created", data: match });

     }

     return {
        broadcastMatchCreated
     }
};