import { serve } from "https://deno.land/std/http/server.ts";
// const sockets = new Set<WebSocket>();
// const conn = await Deno.listen({ port: 80 });
// const httpConn = Deno.serveHttp(await conn.accept());
// const e = await httpConn.nextRequest();

serve((request) => {
    console.log("socket connected!");
  
    // この`socket`変数はクライアント側のWebSocketオブジェクトと同様に扱える
    const { socket, response } = Deno.upgradeWebSocket(request);
  
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
  
    return response;
  }, {
    port: 80, // ポート番号80を使用（デフォルトは8000）
  });