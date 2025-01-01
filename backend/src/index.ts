import { randomBytes } from "node:crypto";
import { type Server } from "bun";
import { join, normalize } from "node:path";
import { cwd } from "node:process";

type WebSocketData = {
  channelId: string;
};

const server = Bun.serve<WebSocketData>({
  async fetch(request, server) {
    const url = new URL(request.url);

    if (url.pathname == "/connect") {
      const id = randomBytes(8).toString("base64url");
      const upgradeSuccessful = server.upgrade(request, {
        data: {
          channelId: id,
        },
      });
      if (upgradeSuccessful) {
        return;
      }

      return new Response(null, { status: 500 });
    }

    if (url.pathname.startsWith("/r/")) {
      return await handleMessage(request, url, server);
    }

    const path = url.pathname == "/" ? "/index.html" : url.pathname;

    const currentDir = cwd();
    const absolutePath = normalize(join(currentDir, "public", path));

    if (!absolutePath.startsWith(currentDir)) {
      return new Response(null, { status: 404 });
    }

    const file = Bun.file(absolutePath);
    if (!(await file.exists())) {
      return new Response(null, { status: 404 });
    }

    return new Response(file);
  },
  websocket: {
    message() {
      //stub
    },
    open(ws) {
      ws.send(JSON.stringify({ type: "start", id: ws.data.channelId }));
      ws.subscribe(ws.data.channelId);
    },
    close(ws) {
      ws.unsubscribe(ws.data.channelId);
    },
    idleTimeout: 300,
  },
});

console.log(`Server started on ${server.port}`);

async function handleMessage(request: Request, url: URL, server: Server) {
  const id = url.pathname.substring(3);
  let jsonBody: any = null;
  let formBody: Record<string, any> | null = null;
  let textBody: string | null = null;

  if (
    request.method == "POST" ||
    request.method == "PUT" ||
    request.method == "DELETE" ||
    request.method == "PUT" ||
    request.method == "PATCH"
  ) {
    switch (request.headers.get("Content-Type")?.split(";")[0]) {
      case "application/json": {
        jsonBody = await request.json();
        break;
      }
      case "application/x-www-form-urlencoded":
      case "multipart/form-data": {
        const formData = await request.formData();
        formBody = {};
        formData.forEach((value, key) => {
          if (value instanceof Blob) {
            formBody![key] = "<<<binary data>>>";
            return;
          }
          formBody![key] = value;
        });
        break;
      }
      case "text/plain":
      case "text/html": {
        textBody = await request.text();
        break;
      }
    }
  }

  const headers: Record<string, any> = {};
  request.headers.forEach((value, key) => {
    if (/^(cdn-loop|cf-|host$)/.test(key)) return;
    headers[key] = value;
  });

  server.publish(
    id,
    JSON.stringify({
      type: "request",
      data: {
        method: request.method,
        headers: headers,
        body: {
          json: jsonBody,
          form: formBody,
          text: textBody,
        },
      },
    })
  );
  return new Response(null);
}
