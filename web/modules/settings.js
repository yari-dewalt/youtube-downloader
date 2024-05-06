import { enableLightMode, enableDarkMode } from "./uiHandlers.js";

// Function to load the settings from settings.txt using the eel function.
export async function loadSettings() {
  await eel.fetch_settings()(async (info) => {
    let settings = info;

    // Get the program in a state mirroring those found in the settings.
    if (settings.visual_mode == "light")
      enableLightMode();
    else if (settings.visual_mode == "dark")
      enableDarkMode();
    if (settings.account_linked == "true")
      await eel.set_signed_in(true)();
    else if (settings.account_linked == "false")
      await eel.set_signed_in(false)();

    return settings;
  });
}

// Function to change a specific setting and its value.
export async function changeSetting(key, value) {
  await eel.fetch_settings()(async (info) => {
    let settings = info;
    settings[key] = value;
    await eel.update_setting(key, value)();
  })
}
