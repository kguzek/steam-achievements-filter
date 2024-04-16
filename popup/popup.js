const log = (...args) => void console.log("[STAFI] [UI]", ...args);

const fsEts2 = document.getElementById("fs-ets2");
const form = document.querySelector("form");
const cbDlcAll = document.getElementById("cb-dlc-all");

const ETS2_CARGO = [
  "High Power Cargo Pack",
  "Heavy Cargo Pack",
  "Special Transport",
];

const ETS2_EXPANSIONS = [
  "Going East",
  "Scandinavia",
  "Vive la France !",
  "Italia",
  "Beyond the Baltic Sea",
  "Road to the Black Sea",
  "Iberia",
  "West Balkans",
  "Greece",
  "Nordic Horizons",
];

const NUMBER_OF_DLCS = ETS2_CARGO.length + ETS2_EXPANSIONS.length;

const btnApply = document.querySelector("button");
let lastSelectedFilters = [];

const getCurrentTab = () =>
  browser.tabs.query({ currentWindow: true, active: true });

async function applyFilters(ets2Filters) {
  const tabInfo = await getCurrentTab();
  const [{ id: tabId }] = tabInfo;
  const filters = { ets2: ets2Filters };
  browser.tabs.sendMessage(tabId, {
    trigger: "applyFilters",
    filters,
  });
  browser.storage.local.set({ filters });
  onFormChange();
}

function createCheckbox(dlcName, filters) {
  const checkbox = document.createElement("input");
  checkbox.name = dlcName;
  checkbox.type = "checkbox";
  checkbox.checked = !filters?.ets2?.includes(dlcName);
  const label = document.createElement("label");
  label.textContent = dlcName;
  label.appendChild(checkbox);
  fsEts2.appendChild(label);
}

async function init() {
  const { filters } = await browser.storage.local.get("filters");

  ETS2_CARGO.forEach((dlcName) => createCheckbox(dlcName, filters));
  fsEts2.appendChild(document.createElement("hr"));
  ETS2_EXPANSIONS.forEach((dlcName) => createCheckbox(dlcName, filters));

  onFormChange();
}

const getSelectedFilters = () =>
  [...new FormData(form).keys()].filter((key) => key != "all");

function onFormChange() {
  const selectedFilters = getSelectedFilters();
  cbDlcAll.checked = selectedFilters.length == NUMBER_OF_DLCS;
  const updated = selectedFilters != lastSelectedFilters;
  if (updated) {
    btnApply.classList.add("updated");
    btnApply.disabled = false;
  } else {
    btnApply.classList.remove("updated");
    btnApply.disabled = true;
  }
}

form.onsubmit = () => {
  const selectedFilters = getSelectedFilters();
  lastSelectedFilters = selectedFilters;
  const invertedFilters = ETS2_EXPANSIONS.concat(ETS2_CARGO).filter(
    (dlcName) => !selectedFilters.includes(dlcName)
  );
  applyFilters(invertedFilters);
  return false;
};

form.onchange = onFormChange;

cbDlcAll.onchange = () => {
  document
    .querySelectorAll("input[type=checkbox]")
    .forEach((elem) => (elem.checked = cbDlcAll.checked));
};

init();

