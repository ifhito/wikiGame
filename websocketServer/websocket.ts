// import { listenAndServe } from "https://deno.land/std/http/mod.ts";
// import {
//   acceptWebSocket,
//   acceptable,
//   WebSocket,
//   isWebSocketCloseEvent,
// } from "https://deno.land/std/ws/mod.ts";
const sockets = new Set<WebSocket>();
const conn = await Deno.listen({ port: 80 });
const httpConn = Deno.serveHttp(await conn.accept());
const e = await httpConn.nextRequest();
if (e) {
  const { socket, response } = Deno.upgradeWebSocket(e.request);
  socket.onopen = () => {
  };
  socket.onmessage = async (e) => {
      const data = JSON.parse(e.data)
      console.log(data)
    const res = await fetch(data.url);
    const html = await res.text();
    console.log(data.url)
    socket.send(JSON.stringify(html));
  };
  socket.onclose = () => console.log("WebSocket has been closed.");
  socket.onerror = (e) => console.error("WebSocket error:", e);
  e.respondWith(response);
}
// let sockets: WebSocket[] = new Array();


// listenAndServe({ port: 3000 }, async (req) => {
//     if (req.method === "GET" && req.url === "/") {
//       // 通信をWebSocketにする
//       if (acceptable(req)) {
//         acceptWebSocket({
//           conn: req.conn,
//           bufReader: req.r,
//           bufWriter: req.w,
//           headers: req.headers,
//         })
//           .then((ws: WebSocket) => {
//             // 機能部分
//             sockets.push(ws);
//             for await (const url of ws) {
//                 const res = await fetch(url);
//                 const html = await res.text();
//                 await Promise.all(sockets.map((socket) => socket.send(html)));
//               }

//           });
//       }}});