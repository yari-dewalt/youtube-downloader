import { changeSetting } from "./settings.js";
import { verifyAccount, setUpAccountVerification } from "./account.js";
import { queueDownload } from "./download.js";

// Global variables to track the current view and search type.
let globalCurrentView = "channel";
let globalSearchType = "channel";

// DOM elements for channel, video, and playlist content.
let channelContent = document.getElementById("channel_content");
let videoContent = document.getElementById("video_content");
let playlistContent = document.getElementById("playlist_content");

// Loading GIF element for showing loading state.
let loadingGif = document.createElement("img");
loadingGif.src = "./images/loading.gif";
loadingGif.className = "loading_gif";

// Clone the loading GIF for different loading elements.
let loadingChannel = loadingGif.cloneNode(true);
loadingChannel.id = "loading_channel";
let loadingChannelPlaylist = loadingGif.cloneNode(true);
loadingChannelPlaylist.id = "loading_channel_playlist";
let loadingChannelVideo = loadingGif.cloneNode(true);
loadingChannelVideo.id = "loading_channel_video";
let loadingLargeVideo = loadingGif.cloneNode(true);
loadingLargeVideo.id = "loading_large_video";
let loadingSinglePlaylist = loadingGif.cloneNode(true);
loadingSinglePlaylist.id = "loading_single_playlist";
let loadingPlaylistVideo = loadingGif.cloneNode(true);
loadingPlaylistVideo.id = "loading_playlist_video";

// Function to toggle the download queue display.
export function toggleDownloadQueue() {
  let downloadQueue = document.getElementById("download_queue");
  if (downloadQueue.style.display == "none" || !downloadQueue.style.display == true) {
    downloadQueue.style.display = "flex";
  } else {
    downloadQueue.style.display = "none";
  }
}

// Function to toggle the help modal display.
export function toggleHelpModal() {
  let helpModalBackground = document.getElementById("help_modal_background");
  helpModalBackground.onclick = function() {
    toggleHelpModal();
  }
  let helpModal = document.getElementById("help_modal");
  helpModal.onclick = function(e) {
    e.stopPropagation();
  }

  if (helpModalBackground.style.display == "none" || !helpModalBackground.style.display == true) {
    helpModalBackground.style.display = "flex";
  } else {
    helpModalBackground.style.display = "none";
  }
}

// Function to toggle the settings modal display.
export async function toggleSettingsModal() {
  let settings = await eel.fetch_settings()();
  let settingsModalBackground = document.getElementById("settings_modal_background");
  settingsModalBackground.onclick = function() {
    toggleSettingsModal();
  }
  let settingsModal = document.getElementById("settings_modal");
  settingsModal.onclick = function(e) {
    e.stopPropagation();
  }

  // Update the UI to reflect the settings.
  if (settingsModalBackground.style.display == "none" || !settingsModalBackground.style.display == true) {
    settingsModalBackground.style.display = "flex";
    let visualMode = document.getElementById("visual_mode");
    if (settings.visual_mode)
      visualMode.innerText = settings.visual_mode.charAt(0).toUpperCase() + settings.visual_mode.slice(1);
    else
      visualMode.innerText = "Light";
    switch (settings.visual_mode) {
      case "light": {
        let lightModeIcon = document.getElementById("light_mode_icon");
        lightModeIcon.src = "./images/lightModeFilled.svg";
        break;
      }
      case "dark": {
        let darkModeIcon = document.getElementById("dark_mode_icon");
        darkModeIcon.src = "./images/darkModeFilled.svg";
        break;
      }
    }

    switch (settings.account_linked) {
      case "true": {
        let unlinkedAccount = document.getElementById("unlinked_account");
        unlinkedAccount.style.display = "none";
        verifyAccount();
        break;
      }
      case "false": {
        let unlinkAccountButton = document.getElementById("unlink_account");
        unlinkAccountButton.style.display = "none";
        break;
      }
    }

    setUpAccountVerification();
  } else {
    settingsModalBackground.style.display = "none";
  }
}

// Variable to store the current download options DOM element as we only want one at a time.
let downloadOptions = null;

// Function to show download options for a video or playlist.
export function showDownloadOptions(e, item, downloadButton) {
  // Remove previous download options.
  if (downloadOptions) {
    downloadOptions.remove();
    downloadOptions = null;
  }

  // Create download options prompt / modal.
  let modal = document.createElement("div");
  modal.className = "download_options";

  // Position the modal relative to the mouse.
  modal.style.top = (e.clientY + window.scrollY) + "px";
  modal.style.left = (e.clientX + window.scrollX) + "px";
  modal.style.transform = "translateX(-100%)";

  // Button to downlod as video (.mp4).
  let videoOption = document.createElement("button");
  videoOption.innerText = "Video (.mp4)";
  videoOption.className = "download_option_button";
  videoOption.onclick = function() {
    queueDownload(item, "video");
    modal.remove();
  }
  modal.appendChild(videoOption);

  // Button to downlod as audio (.mp3).
  let audioOption = document.createElement("button");
  audioOption.innerText = "Audio (.mp3)";
  audioOption.className = "download_option_button";
  audioOption.onclick = function() {
    queueDownload(item, "audio");
    modal.remove();
  }
  modal.appendChild(audioOption);

  // Append the modal to the body.
  document.body.appendChild(modal);

  // Update the state of downloadOptions.
  downloadOptions = modal;

  // Close the modal when clicking outside of it.
  document.addEventListener("click", function closeModal(e) {
    if (!modal.contains(e.target)) {
      modal.remove();
      document.removeEventListener("click", closeModal);
    }
  });
}

// Function to enable dark mode.
export async function enableDarkMode() {
  // Add dark mode class on the body
  document.body.classList.add("dark");

  // Get all elements in the DOM
  const allElements = document.getElementsByTagName('*');

  // Loop through each element
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    
    // Add dark mode class on each element
    element.classList.add("dark");
  }

  // Update the text and icons in settings.
  let visualMode = document.getElementById("visual_mode");
  visualMode.innerText = "Dark";
  let darkModeButton = document.getElementById("dark_mode_button");
  darkModeButton.classList.add("selected");
  let darkModeIcon = document.getElementById("dark_mode_icon");
  darkModeIcon.src = "./images/darkModeFilled.svg";
  darkModeIcon.classList.add("selected");
  let lightModeButton = document.getElementById("light_mode_button");
  lightModeButton.classList.remove("selected");
  let lightModeIcon = document.getElementById("light_mode_icon");
  lightModeIcon.src = "./images/lightMode.svg";
  lightModeIcon.classList.remove("selected");

  // Change the setting.
  changeSetting("visual_mode", "dark");
}

// Function to enable light mode.
export async function enableLightMode() {
  // Remove dark mode class on the body
  document.body.classList.remove("dark");

  // Get all elements in the DOM
  const allElements = document.getElementsByTagName('*');

  // Loop through each element
  for (let i = 0; i < allElements.length; i++) {
    const element = allElements[i];
    
    // Remove dark mode class on each element
    element.classList.remove("dark");
  }

  // Update the text and icons in settings.
  let visualMode = document.getElementById("visual_mode");
  visualMode.innerText = "Light";
  let lightModeButton = document.getElementById("light_mode_button");
  lightModeButton.classList.add("selected");
  let lightModeIcon = document.getElementById("light_mode_icon");
  lightModeIcon.src = "./images/lightModeFilled.svg";
  lightModeIcon.classList.add("selected");
  let darkModeButton = document.getElementById("dark_mode_button");
  darkModeButton.classList.remove("selected");
  let darkModeIcon = document.getElementById("dark_mode_icon");
  darkModeIcon.src = "./images/darkMode.svg";
  darkModeIcon.classList.remove("selected");

  // Change the setting.
  changeSetting("visual_mode", "light");
}

// Function to swap to channel view.
export function showChannelView() {
  globalCurrentView = "channel";
  videoContent.style.display = "none";
  playlistContent.style.display = "none";
  channelContent.style.display = "flex";
}

// Swap to video view.
export function showVideoView() {
  globalCurrentView = "video";
  channelContent.style.display = "none";
  playlistContent.style.display = "none";
  videoContent.style.display = "flex";
}

// Swap to playlist view.
export function showPlaylistView() {
  globalCurrentView = "playlist";
  channelContent.style.display = "none";
  videoContent.style.display = "none";
  playlistContent.style.display = "flex";
}

// Function that returns the current search type.
export function getCurrentSearchType() {
  return globalSearchType;
}

// Returns the current view.
export function getCurrentView() {
  return globalCurrentView;
}

// Function to remove errors from the UI.
export function removeErrors() {
  let existingErrors = document.getElementsByClassName("error_container");
  Array.from(existingErrors).forEach((error) => {
    error.remove();
  });
}

// Function to update the channel info elements.
export function updateChannelInfo(channel) {
  let channelName = document.getElementById("channel_name");
  let channelHeader = document.getElementById("channel_header");
  let channelDescription = document.getElementById("channel_description");
  let channelImage = document.getElementById("channel_image");
  let channelVideosLength = document.getElementById("channel_videos_length");
  let channelNumSubscribers = document.getElementById("num_subscribers");
  let channelImageLink = document.getElementById("channel_image_link");
  channelName.innerHTML = channel.name;
  channelName.href = channel.link;
  channelDescription.innerHTML = channel.description;
  channelImage.src = channel.image;
  channelHeader.style.opacity = 100;
  channelVideosLength.innerHTML = `${channel.num_videos} videos`;
  channelNumSubscribers.innerHTML = `${channel.num_subscribers} subscribers`;
  channelImageLink.href = channel.link;
}

// Function to update the video info elements.
export function updateVideoInfo(video) {
  let singleVideo = document.getElementById("single_video");
  singleVideo.innerHTML = "";

  let videoInfo = document.createElement("div");
  videoInfo.className = "large_video_info";

  let videoHeader = document.createElement("div");
  videoHeader.className = "large_video_header";

  let titleLink = document.createElement("a");
  titleLink.href = video.link;
  titleLink.setAttribute("target", "_blank");
  let title = document.createElement("h3");
  title.innerHTML = video.title;
  title.className = "video_title";
  titleLink.appendChild(title);
  videoHeader.appendChild(titleLink);

  let download = document.createElement("button");
  download.className = "large_video_download_button";
  let downloadImage = document.createElement("img");
  downloadImage.src = "./images/download.svg";
  download.appendChild(downloadImage);
  let downloadText = document.createElement("p");
  downloadText.innerHTML = "Download";
  download.appendChild(downloadText);
  download.onclick = function(e) {
    e.stopPropagation();
    showDownloadOptions(e, video, download);
  }

  videoHeader.appendChild(download);

  videoInfo.appendChild(videoHeader);

  let channelInfo = document.createElement("div");
  channelInfo.className = "large_video_channel_info";

  let channelImage = document.createElement("img");
  channelImage.src = video.channel.image;
  channelImage.className = "small_channel_image";
  channelImage.onclick = function() {
    viewChannel(video.channel);
  }
  channelInfo.appendChild(channelImage);

  let channelInfoText = document.createElement("div");
  channelInfoText.className ="small_channel_info_text";

  let channelName = document.createElement("p");
  channelName.innerHTML = video.channel.name;
  channelName.className = "large_video_channel_name";
  channelName.onclick = function() {
    viewChannel(video.channel);
  }
  channelInfoText.appendChild(channelName);

  let channelSubscribers = document.createElement("p");
  channelSubscribers.innerHTML = `${video.channel.num_subscribers} subscribers`;
  channelSubscribers.className = "large_video_channel_subscribers";
  channelInfoText.appendChild(channelSubscribers);

  channelInfo.appendChild(channelInfoText);

  videoInfo.appendChild(channelInfo);

  let thumbnailContainer = document.createElement("a");
  thumbnailContainer.className = "video_thumbnail_container_large";
  thumbnailContainer.href = video.link;
  thumbnailContainer.setAttribute("target", "_blank");
  let thumbnail = document.createElement("img");
  thumbnail.src = video.thumbnail_url;
  thumbnail.className = "video_thumbnail_large";
  thumbnailContainer.appendChild(thumbnail);

  let lengthContainer = document.createElement("div");
  lengthContainer.className = "video_length_container";
  let lengthText = document.createElement("p");
  lengthText.innerHTML = `${Math.trunc(parseInt(video.length) / 60)}:${String(parseInt(video.length) % 60).padStart(2, '0')}`;
  lengthText.className = "video_length_text";
  lengthContainer.appendChild(lengthText);
  thumbnailContainer.appendChild(lengthContainer);

  singleVideo.appendChild(thumbnailContainer);
  
  let descriptionInfo = document.createElement("div");
  descriptionInfo.className = "large_video_description_info";

  let descriptionHeader = document.createElement("div");
  descriptionHeader.className = "description_header";

  let viewsText = document.createElement("p");
  viewsText.innerHTML = `${video.views.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} views`;
  viewsText.className = "video_views_text";
  descriptionHeader.appendChild(viewsText);

  let date = document.createElement("p");
  date.innerHTML = video.date;
  date.className = "large_video_date";
  descriptionHeader.appendChild(date);

  descriptionInfo.appendChild(descriptionHeader);

  let description = document.createElement("p");
  description.innerHTML = video.description.replace(/\\n/g, "<br>");
  description.className = "large_video_description";
  descriptionInfo.appendChild(description);

  videoInfo.appendChild(descriptionInfo);

  singleVideo.appendChild(videoInfo);
}

// Function update the playlist info elements.
export function updatePlaylistInfo(playlist) {
  let singlePlaylist = document.getElementById("single_playlist");
  singlePlaylist.innerHTML = "";

  let playlistHead = document.createElement("div");
  playlistHead.className = "large_playlist_head";

  let playlistThumbnailLink = document.createElement("a");
  playlistThumbnailLink.href = playlist.link;
  playlistThumbnailLink.setAttribute("target", "_blank");
  let playlistThumbnail = document.createElement("img");
  playlistThumbnail.src = playlist.thumbnail_url;
  playlistThumbnail.className = "large_playlist_thumbnail";
  playlistThumbnailLink.appendChild(playlistThumbnail);
  playlistHead.appendChild(playlistThumbnailLink);

  let playlistInfo = document.createElement("div");
  playlistInfo.className = "large_playlist_info";

  let playlistTitleLink = document.createElement("a");
  playlistTitleLink.href = playlist.link;
  playlistTitleLink.setAttribute("target", "_blank");
  let playlistTitle = document.createElement("h1");
  playlistTitle.innerHTML = playlist.title;
  playlistTitle.className="large_playlist_title";
  playlistTitleLink.appendChild(playlistTitle);
  playlistInfo.appendChild(playlistTitleLink);

  let channelName = document.createElement("h3");
  channelName.innerHTML = playlist.channel.name;
  channelName.className = "large_playlist_channel_name";
  channelName.onclick = function() {
    viewChannel(playlist.channel);
  }
  playlistInfo.appendChild(channelName);

  let videosViews = document.createElement("div");
  videosViews.className = "large_playlist_videos_views";
  let lengthText = document.createElement("p");
  lengthText.innerHTML = `${playlist.length} videos`;
  lengthText.className = "large_playlist_length_text";
  videosViews.appendChild(lengthText);
  let viewsText = document.createElement("p");
  viewsText.innerHTML = `${playlist.views.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} views`;
  viewsText.className = "large_playlist_views_text";
  videosViews.appendChild(viewsText);
  playlistInfo.appendChild(videosViews);

  playlistHead.appendChild(playlistInfo);
  singlePlaylist.appendChild(playlistHead);

  let downloadAllButton = document.createElement("button");
  downloadAllButton.className = "large_playlist_download_all";
  downloadAllButton.onclick = function(e) {
    e.stopPropagation();
    showDownloadOptions(e, playlist, downloadAllButton);
  }
  let downloadImage = document.createElement("img");
  downloadImage.src = "./images/download.svg";
  downloadImage.className = "download_all_image";
  downloadAllButton.appendChild(downloadImage);
  let downloadText = document.createElement("p");
  downloadText.innerHTML = "Download all";
  downloadText.className = "download_all_text";
  downloadAllButton.appendChild(downloadText);
  singlePlaylist.appendChild(downloadAllButton);
}

// Function to view a channel (swaps to channelView, updates the info, and starts fetching playlists and videos).
export async function viewChannel(channel) {
  eel.stop_fetching_info();
  showChannelView();
  updateChannelInfo(channel);
  let playlistsContainer = document.getElementById("playlists_container");
  playlistsContainer.style.display = "block";
  let videosContainer = document.getElementById("videos_container");
  videosContainer.style.display = "block";
  let channelVideosList = document.getElementById("videos_list");
  let channelPlaylistsList = document.getElementById("playlists_list");
  channelPlaylistsList.innerHTML = "";
  channelVideosList.innerHTML = "";
  channelPlaylistsList.appendChild(loadingChannelPlaylist);
  channelVideosList.appendChild(loadingChannelVideo);
  
  // Fetch playlists.
  eel.fetch_playlists(channel.link)(() => {
    channelPlaylistsList.removeChild(loadingChannelPlaylist);
  });
  // Fetch videos.
  eel.fetch_videos(channel.link, 10)(() => {
    channelVideosList.removeChild(loadingChannelVideo);
  });
}

// Function to view a specific video.
export async function viewVideo(video) {
  eel.stop_fetching_info();
  showVideoView();
  updateVideoInfo(video);
}

// Function to view a specific playlist.
export async function viewPlaylist(playlist) {
  eel.stop_fetching_info();
  // Update the UI.
  showPlaylistView();
  updatePlaylistInfo(playlist);
  let playlistVideos = document.getElementById("playlist_videos");
  playlistVideos.innerHTML = "";
  playlistVideos.appendChild(loadingPlaylistVideo);
  
  // Fetch the playlist's videos.
  await eel.fetch_playlist_videos(playlist.link)(() => {
    playlistVideos.removeChild(loadingPlaylistVideo)
  });
}

// Function to toggle the search input choices.
export function toggleInputChoices() {
  let inputChoiceExpandIcon = document.getElementById("input_choice_expand_icon");
  let inputChoiceList = document.getElementById("input_choice_list");
  if (inputChoiceList.style.display == "none" || !inputChoiceList.style.display == true) {
    inputChoiceList.style.display = "flex";
    inputChoiceExpandIcon.style.transform = "rotate(0deg)";
  } else {
    inputChoiceList.style.display = "none";
    inputChoiceExpandIcon.style.transform = "rotate(-90deg)";
  }
}

// Function that handles changing the search type.
export function changeSearchType(newType) {
  // Update the UI.
  let inputLink = document.getElementById("input_link");
  inputLink.placeholder = `Insert ${newType} link`;
  let inputChoiceText = document.getElementById("input_choice_text");
  inputChoiceText.innerHTML = newType.charAt(0).toUpperCase() + newType.slice(1);
  let inputChoiceList = document.getElementById("input_choice_list");
  Array.from(inputChoiceList.children).forEach((child) => {
    if (child.innerHTML.toLowerCase() == newType)
      child.classList.add("selected");
    else
      child.classList.remove("selected");
  });

  // Update globalSearchType variable.
  globalSearchType = newType;
}
