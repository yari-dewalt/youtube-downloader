import { getCurrentView, getCurrentSearchType, showDownloadOptions, showChannelView, showPlaylistView, showVideoView, updateChannelInfo, updatePlaylistInfo, updateVideoInfo, viewChannel, viewPlaylist, viewVideo, removeErrors } from "./uiHandlers.js";

// Get input element for link.
let inputLink = document.getElementById("input_link");

// Create loading GIF elements for different loading states.
let loadingGif = document.createElement("img");
loadingGif.src = "./images/loading.gif";
loadingGif.className = "loading_gif";

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

// Function to perform a search based on the current search type.
export function search() {
  eel.stop_fetching_info();
  let globalSearchType = getCurrentSearchType();
  switch (globalSearchType) {
    case "channel": fetchChannel(); break;
    case "video":  fetchVideo(); break;
    case "playlist": fetchPlaylist(); break;
    default: return;
  }
}

// Function to fetch and display channel information.
export async function fetchChannel() {
  eel.stop_fetching_info();
  // Update UI.
  let channelContent = document.getElementById("channel_content");
  showChannelView();
  removeErrors();
  let channel = document.getElementById("channel");
  channel.style.display = "none";
  let playlistsContainer = document.getElementById("playlists_container");
  playlistsContainer.style.display = "none";
  let videosContainer = document.getElementById("videos_container");
  videosContainer.style.display = "none";
  let channelVideosList = document.getElementById("videos_list");
  let channelPlaylistsList = document.getElementById("playlists_list");
  channelContent.appendChild(loadingChannel);
  
  // Fetch the information.
  await eel.fetch_channel(inputLink.value)(async (info) => {
    channelContent.removeChild(loadingChannel);
    updateChannelInfo(info);
    channel.style.display = "flex";
    playlistsContainer.style.display = "block";
    videosContainer.style.display = "block";
    channelPlaylistsList.appendChild(loadingChannelPlaylist);
    channelVideosList.appendChild(loadingChannelVideo);

    await eel.fetch_playlists(inputLink.value)(() => {
      channelPlaylistsList.removeChild(loadingChannelPlaylist);
    });
    await eel.fetch_videos(inputLink.value, 10)((info) => {
      channelVideosList.removeChild(loadingChannelVideo);
    });
  });
  channelVideosList.innerHTML = "";
  channelPlaylistsList.innerHTML = "";
}

// Function to fetch and display a video.
export async function fetchVideo() {
  eel.stop_fetching_info();
  // Update UI.
  showVideoView();
  removeErrors();
  let singleVideo = document.getElementById("single_video");
  singleVideo.innerHTML = "";
  singleVideo.appendChild(loadingLargeVideo);

  // Fetch the information.
  await eel.fetch_video(inputLink.value)((info) => {
    singleVideo.removeChild(loadingLargeVideo);
    updateVideoInfo(info);
  });
}

// Function to fetch and display a playlist.
export async function fetchPlaylist() {
  eel.stop_fetching_info();
  // Update UI.
  showPlaylistView();
  removeErrors();
  let singlePlaylist = document.getElementById("single_playlist");
  singlePlaylist.innerHTML = "";
  singlePlaylist.style.setProperty("min-width", "100%");
  singlePlaylist.appendChild(loadingSinglePlaylist);
  let playlistVideos = document.getElementById("playlist_videos");
  playlistVideos.innerHTML = "";

  // Fetch the information.
  await eel.fetch_playlist(inputLink.value)(async (info) => {
    singlePlaylist.removeChild(loadingSinglePlaylist);
    singlePlaylist.style.setProperty("min-width", "fit-content");
    updatePlaylistInfo(info);

    playlistVideos.appendChild(loadingPlaylistVideo);
    await eel.fetch_playlist_videos(inputLink.value)(() => {
      playlistVideos.removeChild(loadingPlaylistVideo)}
    );
  });
}

// Function to add a video to the UI.
eel.expose(addVideo);
function addVideo(video, viewType) {
    let div = document.createElement("div");
    div.className = "video";

    if (viewType == "playlist") {
      let playlistVideos = document.getElementById("playlist_videos");
      let videoNumber = document.createElement("p");
      videoNumber.innerHTML = playlistVideos.childElementCount; // Normally would have + 1 here because of zero index but there is the loading gif.
      videoNumber.className = "video_number";
      div.appendChild(videoNumber);
    }

    let header = document.createElement("div");
    header.className = "video_header";

    let title = document.createElement("h3");
    title.innerHTML = video.title;
    title.className = "video_title"
    header.appendChild(title);

    let authorViewsDate = document.createElement("div");
    authorViewsDate.className = "video_author_views_date";

    let authorLink = document.createElement("a");
    authorLink.href = video.channel.link;
    authorLink.setAttribute("target", "_blank");
    let author = document.createElement("p");
    author.innerHTML = video.channel.name;
    author.className = "video_author";
    if (viewType == "channel") {
      authorLink.appendChild(author);
      authorLink.onclick = function(e) {
        e.stopPropagation();
      }
      authorViewsDate.appendChild(authorLink);
    } else {
      author.onclick = function(e) {
        e.stopPropagation();
        viewChannel(video.channel);
      }
      authorViewsDate.appendChild(author);
    }

    let dot = document.createElement("p");
    dot.innerHTML = "•";
    dot.className = "video_info_separator";
    authorViewsDate.appendChild(dot);

    let viewsText = document.createElement("p");
    viewsText.innerHTML = `${video.views.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} views`;
    viewsText.className = "video_views_text";
    authorViewsDate.appendChild(viewsText);

    authorViewsDate.appendChild(dot.cloneNode(true));

    let date = document.createElement("p");
    date.innerHTML = video.date;
    date.className = "video_date";
    authorViewsDate.appendChild(date);

    header.appendChild(authorViewsDate);

    let thumbnailContainer = document.createElement("div");
    thumbnailContainer.className = "video_thumbnail_container";
    let thumbnail = document.createElement("img");
    thumbnail.src = video.thumbnail_url;
    thumbnail.className = "video_thumbnail";
    thumbnailContainer.appendChild(thumbnail);

    let lengthContainer = document.createElement("div");
    lengthContainer.className = "video_length_container";
    let lengthText = document.createElement("p");
    lengthText.innerHTML = `${Math.trunc(parseInt(video.length) / 60)}:${String(parseInt(video.length) % 60).padStart(2, '0')}`;
    lengthText.className = "video_length_text";
    lengthContainer.appendChild(lengthText);
    thumbnailContainer.appendChild(lengthContainer);

    div.appendChild(thumbnailContainer);

    let download = document.createElement("button");
    download.className = "video_download_button";
    let downloadImage = document.createElement("img");
    downloadImage.src = "./images/download.svg";
    downloadImage.className = "video_download_img";
    download.appendChild(downloadImage);
    download.onclick = function(e) {
      e.stopPropagation();
      showDownloadOptions(e, video, download);
    }

    div.appendChild(header);
    div.appendChild(download);
    div.onclick = function() {
      viewVideo(video);
    }

    if (viewType == "channel") {
      let loadingChannelVideo = document.getElementById("loading_channel_video");
      let channelVideosList = document.getElementById("videos_list");
      channelVideosList.insertBefore(div, loadingChannelVideo);
    }
    else if (viewType == "playlist") {
      let playlistVideos = document.getElementById("playlist_videos");
      let loadingPlaylistVideo = document.getElementById("loading_playlist_video");
      playlistVideos.insertBefore(div, loadingPlaylistVideo);
    }
}

// Function to add a playlist to the UI.
eel.expose(addPlaylist);
function addPlaylist(playlist) {
    let div = document.createElement("div");
    div.className = "playlist";

    let details = document.createElement("div");
    details.className = "playlist_details";

    let title = document.createElement("h3");
    title.innerHTML = playlist.title;
    title.className = "playlist_title"
    title.onclick = function() {
      viewPlaylist(playlist);
    }
    details.appendChild(title);

    let viewsText = document.createElement("p");
    viewsText.innerHTML = `${playlist.views.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")} views`;
    viewsText.className = "playlist_views_text";

    details.appendChild(viewsText);

    let thumbnailContainer = document.createElement("div");
    thumbnailContainer.className = "playlist_thumbnail_container";
    thumbnailContainer.onclick = function() {
      viewPlaylist(playlist);
    }
    let thumbnail = document.createElement("img");
    thumbnail.src = playlist.thumbnail_url;
    thumbnail.className = "playlist_thumbnail";
    thumbnailContainer.appendChild(thumbnail);

    let lengthContainer = document.createElement("div");
    lengthContainer.className = "playlist_length_container";
    let lengthImage = document.createElement("img");
    lengthImage.src = "./images/videos.png";
    lengthImage.className = "playlist_length_image";
    lengthContainer.appendChild(lengthImage);
    let lengthText = document.createElement("p");
    lengthText.innerHTML = `${playlist.length} videos`;
    lengthText.className = "playlist_length_text";
    lengthContainer.appendChild(lengthText);

    thumbnailContainer.appendChild(lengthContainer);

    div.appendChild(thumbnailContainer);

    div.appendChild(details);

    let loadingChannelPlaylist = document.getElementById("loading_channel_playlist");
    let channelPlaylistsList = document.getElementById("playlists_list");
    channelPlaylistsList.insertBefore(div, loadingChannelPlaylist);
}

// Function report and display an error.
eel.expose(reportError);
function reportError(errorText) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error_container";
  const errorIcon = document.createElement("img");

  errorIcon.className = "error_icon";
  errorIcon.src = "./images/error.svg";
  errorDiv.appendChild(errorIcon);

  const text = document.createElement("h3");
  text.className = "error_text";
  text.innerHTML = errorText;
  errorDiv.appendChild(text);

  removeErrors();
  let globalCurrentView = getCurrentView();
  switch (globalCurrentView) {
    case "channel": {
      const channelContent = document.getElementById("channel_content");
      channelContent.appendChild(errorDiv);
      break;
    }
    case "video": {
      const videoContent = document.getElementById("video_content");
      if (!errorText.includes("channel")) { // because of the usage of fetch_channel which also reports errors.
        videoContent.appendChild(errorDiv);
      }
      break;
    }
    case "playlist": {
      const playlistContent = document.getElementById("playlist_content");
      //playlistContent.appendChild(errorDiv);
      playlistContent.insertBefore(errorDiv, playlistContent.firstChild);
      break;
    }
    default: return;
  }
}

