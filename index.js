import { createBareServer } from "@tomphttp/bare-server-node";
import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicPath = join(__dirname, "static");

const bare = createBareServer("/bare/", {
	logErrors: false,
});

const app = express();

app.use(express.static(publicPath));

// 存在しないパスは本家同様 Express 標準の 404 (Cannot GET ...) を返す

const server = createServer();

server.on("request", (req, res) => {
	if (bare.shouldRoute(req)) {
		return bare.routeRequest(req, res);
	}
	app(req, res);
});

server.on("upgrade", (req, socket, head) => {
	if (bare.shouldRoute(req)) {
		return bare.routeUpgrade(req, socket, head);
	}
	socket.end();
});

const port = Number(process.env.PORT) || 3000;

server.on("listening", () => {
	console.log(`改造版JWP server listening on http://0.0.0.0:${port}/`);
});

server.listen({ port });

process.on("SIGINT", () => {
	console.log("SIGINT received, closing...");
	bare.closeServer();
	server.close(() => process.exit());
});

process.on("SIGTERM", () => {
	console.log("SIGTERM received, closing...");
	bare.closeServer();
	server.close(() => process.exit());
});
