import { loadSettings } from "./modules/settings.js";
import { initListeners } from "./modules/eventListeners.js";

async function main() {
  loadSettings();
  initListeners();
}

main();
