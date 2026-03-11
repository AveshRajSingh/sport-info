import { WebSocketServer, WebSocket } from "ws";

export function sendJson(socket, payload) {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify(payload));
}

export function broadcastToAll(wss, payload) {
    if (wss.clients.size === 0) return;

    wss.clients.forEach(client => {
        sendJson(client, payload);
    });
}

const matchSubscribers = new Map();

function subscribe(matchId, socket) {
    if (!socket.subscriptions) {
        socket.subscriptions = new Set();
    }
    
    socket.subscriptions.add(matchId);

    if (matchSubscribers.has(matchId)) {
        matchSubscribers.get(matchId).add(socket);
    } else {
        matchSubscribers.set(matchId, new Set([socket]));
    }
}

function unsubscribe(matchId, socket) {
    const subscribers = matchSubscribers.get(matchId);

    if (!subscribers) return;

    subscribers.delete(socket);

    if (subscribers.size === 0) {
        matchSubscribers.delete(matchId);
    }

    if (socket.subscriptions) {
        socket.subscriptions.delete(matchId);
    }
}

function cleanupSubscriptions(socket) {
    if (!socket.subscriptions) return;

    for (const matchId of socket.subscriptions) {
        unsubscribe(matchId, socket);
    }
    socket.subscriptions.clear();
}

function broadcastToMatch(matchId, payload) {
    const subscribers = matchSubscribers.get(matchId);

    if (!subscribers || subscribers.size === 0) return;

    for (const client of subscribers) {
        sendJson(client, payload);
    }
}

function handleMessage(socket, data) {
    let message;
    try {
        message = JSON.parse(data.toString());
    } catch (error) {
        console.error("Invalid JSON message received:", data);
        sendJson(socket, { type: "error", message: "Invalid JSON format" });
        return;
    }

    const { type, matchId } = message;

    switch (type) {
        case "subscribe":
            if (!matchId) {
                sendJson(socket, { type: "error", message: "matchId is required" });
                return;
            }
            subscribe(matchId, socket);
            socket.subscriptions.add(matchId);
            sendJson(socket, { type: "subscribed", matchId });
            break;

        case "unsubscribe":
            if (!matchId) {
                sendJson(socket, { type: "error", message: "matchId is required" });
                return;
            }
            unsubscribe(matchId, socket);
            socket.subscriptions.delete(matchId);
            sendJson(socket, { type: "unsubscribed", matchId });
            break;

        case "ping":
            sendJson(socket, { type: "pong" });
            break;

        default:
            sendJson(socket, { type: "error", message: `Unknown message type: ${type}` });
    }
}

export const attachWebSocketServer = (server) => {
    const wss = new WebSocketServer({
        server,
        path: "/ws",
        maxPayload: 1024 * 1024
    });

    wss.on("connection", (socket) => {
        socket.isAlive = true;
        socket.subscriptions = new Set();

        socket.on("pong", () => {
            socket.isAlive = true;
        });

        socket.on("message", (data) => {
            handleMessage(socket, data);
        });

        socket.on("close", () => {
            cleanupSubscriptions(socket);
        });

        socket.on("error", (error) => {
            console.error("WebSocket error:", error);
        });

        sendJson(socket, { type: "welcome" });
    });

    const interval = setInterval(() => {
        wss.clients.forEach(ws => {
            if (ws.isAlive === false) {
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on("close", () => {
        clearInterval(interval);
    });

    function broadcastMatchCreated(match) {
        broadcastToAll(wss, { type: "match_created", data: match });
    }

    function broadcastCommentary(matchId, commentary) {
        broadcastToMatch(matchId, { type: "commentary", data: commentary });
    }

    return {
        broadcastMatchCreated,
        broadcastCommentary
    };
};