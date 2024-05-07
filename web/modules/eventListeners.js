import { toggleInputChoices, changeSearchType, toggleHelpModal, toggleSettingsModal, toggleDownloadQueue, enableLightMode, enableDarkMode } from "./uiHandlers.js";
import { search } from "./fetch.js";
import { updateFilePath } from "./download.js";

// Function to define and initialize eventListeners for the appropriate HTML elements.
export function initListeners() {
  window.addEventListener("contextmenu", function (e) {
    e.preventDefault();
  });

  let inputForm = document.getElementById("input_form");
  inputForm.addEventListener("submit", function(e) {
    e.preventDefault();
    search();
    return false;
  });

  let inputChoiceExpand = document.getElementById("input_choice_expand");
  inputChoiceExpand.addEventListener("click", () => toggleInputChoices() );
  let inputChoiceList = document.getElementById("input_choice_list");
  Array.from(inputChoiceList.children).forEach((child) => {
    child.addEventListener("click", () => {
      changeSearchType(child.innerHTML.toLowerCase());
      toggleInputChoices();
    });
  });

  let inputChoiceText = document.getElementById("input_choice_text");
  inputChoiceText.addEventListener("click", search);

  let downloadQueueImage = document.getElementById("download_queue_image");
  downloadQueueImage.addEventListener("click", toggleDownloadQueue);

  let lightModeButton = document.getElementById("light_mode_button");
  lightModeButton.addEventListener("click", enableLightMode);
  let darkModeButton = document.getElementById("dark_mode_button");
  darkModeButton.addEventListener("click", enableDarkMode);

  let helpButton = document.getElementById("help_button");
  helpButton.onclick = function() {
    toggleHelpModal();
  }

  let settingsButton = document.getElementById("settings_button");
  settingsButton.onclick = function() {
    toggleSettingsModal();
  }

  let fileDialogButton = document.getElementById("file_dialog_button");
  fileDialogButton.addEventListener("click", function () {
    eel.open_file_dialog()(updateFilePath);
  });

  let playlistsHeader = document.getElementById("playlists_header");
  playlistsHeader.addEventListener("click", function () {
    let channelPlaylistsList = document.getElementById("playlists_list");
    let playlistsExpandIcon = document.getElementById("playlists_expand_icon");
    if (channelPlaylistsList.style.display === "none") {
      channelPlaylistsList.style.display = "flex";
      playlistsExpandIcon.style.transform = "rotate(0deg)";
    } else {
      channelPlaylistsList.style.display = "none";
      playlistsExpandIcon.style.transform = "rotate(-90deg)";
    }
  });

  let videosHeader = document.getElementById("videos_header");
  videosHeader.addEventListener("click", function () {
    let channelVideosList = document.getElementById("videos_list");
    let videosExpandIcon = document.getElementById("videos_expand_icon");
    if (channelVideosList.style.display === "none") {
      channelVideosList.style.display = "flex";
      videosExpandIcon.style.transform = "rotate(0deg)";
    } else {
      channelVideosList.style.display = "none";
      videosExpandIcon.style.transform = "rotate(-90deg)";
    }
  });
}
