import "./style.css";
import "./options";
import ArrowDown from "./assets/arrow-down.svg";

type Config = {
  base: string;
  connect: string;
};

type CatchAllEvent =
  | {
      type: "start";
      id: string;
    }
  | {
      type: "request";
      data: RequestData;
    };

type RequestData = {
  method: string;
  headers: Record<string, any>;
  body: {
    json: any | null;
    form: Record<string, any> | null;
    text: string | null;
  };
};

const inputUrl = document.getElementById("input-url") as HTMLInputElement;
const requests = document.getElementById("data") as HTMLDivElement;
const noRequestsYet = document.getElementById(
  "no-requests"
) as HTMLParagraphElement;
const copyLink = document.getElementById("copy-link") as HTMLButtonElement;
const expanded = document.getElementById("expanded") as HTMLInputElement;
const wrap = document.getElementById("wrap") as HTMLInputElement;

// @ts-ignore
const config = window._env as Config;

const socket = new WebSocket(config.connect);

socket.onopen = () => {
  console.log("Websocket open");
};

socket.onmessage = (event) => {
  console.log(event.data);
  const evt = JSON.parse(event.data) as CatchAllEvent;
  switch (evt.type) {
    case "start": {
      inputUrl.value = `${config.base}/${evt.id}`;
      copyLink.disabled = false;
      copyLink.addEventListener("click", () => {
        navigator.clipboard.writeText(inputUrl.value);
      });
      break;
    }
    case "request": {
      handleData(evt.data);
      break;
    }
  }
};

socket.onclose = () => {
  console.log("Websocket closed");
  clearInterval(interval);
  alert("Connection to the server was lost");
  location.reload();
};

const interval = setInterval(() => {
  socket.send("ping");
}, 240);

function handleData(data: RequestData) {
  noRequestsYet.remove();
  const node = document.createElement("div");
  node.className = "py-2 border-b";

  const button = document.createElement("button");
  button.className = "flex justify-between w-full";

  const main = document.createElement("div");
  main.className = "text-start";
  const date = new Date();
  // prettier-ignore
  const dateNode = createPNode(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`)
  dateNode.className = "font-bold";
  main.appendChild(dateNode);

  const requestTitleNode = createPNode(`${data.method}`);
  main.appendChild(requestTitleNode);

  button.appendChild(main);

  const arrowDownImg = document.createElement("img");
  arrowDownImg.src = ArrowDown;
  arrowDownImg.className = "transition-transform";

  button.appendChild(arrowDownImg);

  node.appendChild(button);

  const requestData = document.createElement("div");
  if (expanded.checked) {
    arrowDownImg.classList.add("rotate-180");
  } else {
    requestData.className = "hidden";
  }

  button.addEventListener("click", () => {
    requestData.classList.toggle("hidden");
    arrowDownImg.classList.toggle("rotate-180");
  });

  const headersTable: [string, string][] = [];
  Object.keys(data.headers).forEach((header) => {
    headersTable.push([header, data.headers[header]]);
  });
  requestData.appendChild(createTable("Headers", headersTable));

  if (
    data.body.form !== null ||
    data.body.json != null ||
    data.body.text !== null
  ) {
    if (data.body.form !== null) {
      const formTable: [string, string][] = [];
      Object.keys(data.body.form).forEach((title) => {
        formTable.push([title, data.body.form![title]]);
      });
      requestData.appendChild(createTable("Form Data", formTable));
    }

    if (data.body.json !== null) {
      requestData.appendChild(createPNode("JSON"));
      const textarea = document.createElement("textarea");
      textarea.innerHTML = JSON.stringify(data.body.json, null, 2);
      // prettier-ignore
      textarea.className = `font-mono w-full h-36 ${wrap.checked ? 'text-wrap' : 'text-nowrap'}`;
      requestData.appendChild(textarea);
    }

    if (data.body.text !== null) {
      requestData.appendChild(createPNode("Body"));
      const textarea = document.createElement("textarea");
      textarea.innerHTML = data.body.text;
      // prettier-ignore
      textarea.className = `font-mono w-full h-36 ${wrap.checked ? 'text-wrap' : 'text-nowrap'}`;
      requestData.appendChild(textarea);
    }
  }

  node.appendChild(requestData);

  requests.appendChild(node);
}

function createPNode(text: string) {
  const node = document.createElement("p");
  node.innerText = text;
  return node;
}

function createTable(caption: string, data: [string, string][]) {
  const table = document.createElement("table");
  table.className = "border-x border-t w-full my-4";

  const captionTag = document.createElement("caption");
  captionTag.innerText = caption;
  captionTag.className = "text-start";
  table.appendChild(captionTag);

  let i = 0;
  for (const [key, value] of data) {
    const tr = document.createElement("tr");
    // prettier-ignore
    tr.className = `border-b [&>*]:px-3 [&>*]:py-2 ${i % 2 == 0 ? 'bg-zinc-50' : ''}`;

    const k = document.createElement("td");
    k.className = "border-r w-1/4";
    k.innerText = key;

    const v = document.createElement("td");
    v.className = "font-mono";
    v.innerText = value;

    tr.appendChild(k);
    tr.appendChild(v);

    table.appendChild(tr);
    i++;
  }
  return table;
}
