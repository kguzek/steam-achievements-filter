const log = (...args) => void console.log("[STAFI] [LOG]", ...args);
const debug = (...args) => void console.debug("[STAFI] [DEBUG]", ...args);
const info = (...args) => void console.info("[STAFI] [INFO]", ...args);
const warn = (...args) => void console.warn("[STAFI] [WARN]", ...args);

const txtSummary = document.querySelector("#topSummaryAchievements>div");
const sliderSummary = document.querySelector(".achieveBarProgress");

const cardElements = Array.from(document.getElementsByClassName("achieveRow"));

const metadata = {
  unlockedAchievements: 0,
  totalAchievements: 100,
};

/**
 *  Removes the child elements which contain `searchString`.
 *  */
function filter(searchString) {
  let touchedCount = 0;

  cardElements.forEach((cardElement) => {
    if (
      cardElement
        .querySelector(".achieveTxt h5")
        .textContent.includes(searchString)
    ) {
      if (
        cardElement.classList.contains("stafi-hidden") &&
        cardElement.style.display === "none"
      )
        return;
      cardElement.classList.add("stafi-hidden");
      cardElement.style.display = "none";
      touchedCount++;
    }
  });
  debug("Removed", touchedCount, "achievements matching", searchString);
  return touchedCount;
}

function restore() {
  const cardElements = document.querySelectorAll(".stafi-hidden");
  cardElements.forEach((cardElement) => {
    cardElement.classList.remove("stafi-hidden");
    cardElement.style.display = "";
  });
  debug("Restored", cardElements.length, "cards.");
}

function processFilters(data) {
  switch (data.trigger) {
    case "loadFilters":
    case "applyFilters":
      restore();

      let numAchievements = metadata.totalAchievements;

      Object.values(data.filters).forEach((filters) => {
        filters.forEach((dlcName) => {
          numAchievements -= filter(dlcName);
        });
      });
      const achievementPercentage =
        Math.round(
          Math.min(metadata.unlockedAchievements / numAchievements, 1) * 100
        ) + "%";
      if (metadata.page === "personal") {
        txtSummary.textContent = `${metadata.unlockedAchievements} of ${numAchievements} (${achievementPercentage}) achievements earned:`;
        sliderSummary.style.width = achievementPercentage;
      }
      break;
    default:
      break;
  }
}

async function main() {
  // info("---");
  // info("Extension activated!");

  if (location.hostname !== "steamcommunity.com") {
    warn("Not on Steam Community website. Aborting.");
  }

  const { filters } = await browser.storage.local.get("filters");

  const numHiddenAchievements =
    document.querySelectorAll(".stafi-hidden").length;
  const match = txtSummary.textContent.match(/(\d+) of (\d+) (.+)/);
  if (match) {
    metadata.page = "personal";
    metadata.unlockedAchievements = +match[1];
    metadata.totalAchievements = +match[2] + numHiddenAchievements;
  }

  processFilters({ trigger: "loadFilters", filters });
}

main();

browser.runtime.onMessage.addListener(processFilters);

