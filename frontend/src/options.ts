const app = document.getElementById("app") as HTMLDivElement;
const requests = document.getElementById("data") as HTMLDivElement;
const newestFirst = document.getElementById("newest-first") as HTMLInputElement;
const fullWidth = document.getElementById("full-width") as HTMLInputElement;
const expanded = document.getElementById("expanded") as HTMLInputElement;
const wrap = document.getElementById("wrap") as HTMLInputElement;

function setNewestFirst(v: boolean) {
  if (v) {
    requests.classList.add("flex-col-reverse");
    requests.classList.remove("flex-col");
  } else {
    requests.classList.remove("flex-col-reverse");
    requests.classList.add("flex-col");
  }
  localStorage.setItem("newestFirst", v.toString());
}

function setFullWidth(v: boolean) {
  if (v) {
    app.classList.remove("max-w-2xl");
  } else {
    app.classList.add("max-w-2xl");
  }
  localStorage.setItem("fullWidth", fullWidth.checked.toString());
}

newestFirst.addEventListener("change", () =>
  setNewestFirst(newestFirst.checked)
);

fullWidth.addEventListener("change", () => setFullWidth(fullWidth.checked));

expanded.addEventListener("change", () => {
  localStorage.setItem("expanded", expanded.checked.toString());
});

wrap.addEventListener("change", () => {
  const textareas = document.querySelectorAll("textarea");
  for (const area of textareas) {
    if (wrap.checked) {
      area.classList.add("text-wrap");
      area.classList.remove("text-nowrap");
    } else {
      area.classList.add("text-nowrap");
      area.classList.remove("text-wrap");
    }
  }
});

const fullWidthValue = localStorage.getItem("fullWidth");
const newestFirstValue = localStorage.getItem("newestFirst");
const expandedValue = localStorage.getItem("expanded");
const wrapValue = localStorage.getItem("wrap");

if (fullWidthValue === "true") {
  fullWidth.checked = true;
  setFullWidth(true);
}

if (newestFirstValue === "true") {
  newestFirst.checked = true;
  setNewestFirst(true);
}

if (expandedValue === "true") {
  expanded.checked = true;
}

if (wrapValue === "true") {
  wrap.checked = true;
}
