import { DownloadQueue } from "./queue.js";

// Initialize global download queue.
const downloadQueue = new DownloadQueue();
let currentDownloadType = null;

/// Function to download the next item in the queue.
export async function downloadNextItem() {
  let item = downloadQueue.peek();
  let type = item.type;
  let downloadType = item.downloadType;
  switch (type) {
    case "video": {
      currentDownloadType = "video";
      let video = downloadQueue.peek();
      if (video == "Underflow")
        return;

      // Update UI.
      let downloadQueueContainer = document.getElementById("download_queue_container");
      let itemElements = downloadQueueContainer.children;
      let currentVideo = itemElements.item(downloadQueueContainer.childElementCount - downloadQueue.length());
      currentVideo.classList.add("downloading");
      let currentState = itemElements.item(downloadQueueContainer.childElementCount - downloadQueue.length()).firstChild.lastChild;
      let downloadPercentageElement = document.createElement("p");
      downloadPercentageElement.className = "video_download_percentage";
      downloadPercentageElement.innerText = "0%";
      currentState.appendChild(downloadPercentageElement);
      updateCurrentlyDownloadingVideo(video);
      // Start downloading.
      let filePath = document.getElementById("file_path");
      await eel.download_video(video.link, filePath.innerHTML, downloadType);
      break;
    }
    case "playlist": {
      currentDownloadType = "playlist";
      let playlist = downloadQueue.peek();
      if (playlist == "Underflow")
        return;

      // Update UI.
      let downloadQueueContainer = document.getElementById("download_queue_container");
      let itemElements = downloadQueueContainer.children;
      let currentPlaylist = itemElements.item(downloadQueueContainer.childElementCount - downloadQueue.length());
      currentPlaylist.classList.add("downloading");
      let currentState = itemElements.item(downloadQueueContainer.childElementCount - downloadQueue.length()).firstChild.lastChild;
      let videosDownloaded = document.createElement("p");
      videosDownloaded.className = "playlist_download_videos_downloaded";
      videosDownloaded.innerText = `1 / ${playlist.length}`;
      currentState.appendChild(videosDownloaded);
      
      // Start downloading.
      let filePath = document.getElementById("file_path");
      await eel.download_playlist_videos(playlist.link, filePath.innerHTML, downloadType);
      break;
    }
    default: {
      currentDownloadType = null;
      break;
    }
  }
}

// Function to queue a download item.
export function queueDownload(item, downloadType) {
  // Give downloadType attribute.
  item.downloadType = downloadType;
  // Add to download queue and update queue container UI.
  downloadQueue.enqueue(item);
  addToQueueContainer(item, downloadType);
  // If it is only item in the queue, start downloading.
  if (downloadQueue.length() == 1)
    downloadNextItem();
}

// Function to show that there was an error downloading.
eel.expose(errorDownloading);
export function errorDownloading(type) {
  // Update visually to show error, then proceed like download finished.
  switch (type) {
    case "video": {
      // Update UI.
      hideCurrentlyDownloading();
      hideDownloadProgressBar();

      let downloadQueueContainer = document.getElementById("download_queue_container");
      let itemElements = downloadQueueContainer.children;
      let currentVideo = itemElements.item(downloadQueueContainer.childElementCount - downloadQueue.length());
      // Safeguard.
      if (currentVideo.classList.contains("playlist_download_view")) {
        downloadNextItem();
        return;
      }
      // Update visually to show that it had an error.
      currentVideo.classList.remove("downloading");
      currentVideo.classList.add("error");
      let currentState = itemElements.item(downloadQueueContainer.childElementCount - downloadQueue.length()).firstChild.lastChild;
      currentState.lastChild.remove(); // Remove percentage.
      let currentProgressBar = currentVideo.lastChild;
      currentProgressBar.style.width = "0%";
      
      let errorIcon = document.createElement("img");
      errorIcon.src = "./images/error.svg";
      errorIcon.className = "video_download_error";
      currentState.appendChild(errorIcon);

      // Update queue.
      downloadQueue.dequeue();
      // Start downloading next video.
      downloadNextItem();
      break;
    }
    case "playlist": {
      // Currently no special treatment for error in playlist video except for orange color of progress bar.
      // Update UI.
      hideCurrentlyDownloading();
      hideDownloadProgressBar();

      let downloadQueueContainer = document.getElementById("download_queue_container");
      let itemElements = downloadQueueContainer.children;
      let currentPlaylist = itemElements.item(downloadQueueContainer.childElementCount - downloadQueue.length());
      // This means the rest of the playlist download has been cancelled. Prevents errors.
      if (currentPlaylist == null)
        return;
      // Safeguard.
      if (currentPlaylist.classList.contains("video_download_view")) {
        downloadNextItem();
        return;
      }
      // Update visually to show that it downloaded.
      let currentState = itemElements.item(downloadQueueContainer.childElementCount - downloadQueue.length()).firstChild.lastChild;
      let videosDownloadedElement = currentState.lastChild;
      let currentProgressBar = currentPlaylist.lastChild;
      // Orange color indicates that an error has occured at some point.
      currentProgressBar.style.backgroundColor = "orange";
      // Check to see if all videos are downloaded or if cancelled.
      if (videosDownloadedElement.innerText.split(' / ')[0] == videosDownloadedElement.innerText.split(' / ')[1]) {
        currentPlaylist.classList.remove("downloading");
        currentPlaylist.classList.add("downloaded");
        videosDownloadedElement.lastChild.remove(); // Remove videos downloaded progress.
        currentProgressBar.style.width = "0%";
        
        let doneIcon = document.createElement("img");
        doneIcon.src = "./images/done.svg";
        doneIcon.className = "video_download_done";
        currentState.appendChild(doneIcon);

        // Update queue
        downloadQueue.dequeue();
        // Start downloading next video
        downloadNextItem();
      } else { // Still downloading
        let [current, total] = videosDownloadedElement.innerText.split(' / ');
        videosDownloadedElement.innerText = `${parseInt(current) + 1} / ${total}`;
        currentProgressBar.style.width = `${((parseInt(current)) / total) * 100}%`;
        hideCurrentlyDownloading();
        hideDownloadProgressBar();
      }
      break;
    }
  }
}

// Function to handle completion of download.
eel.expose(finishDownload);
export function finishDownload(type) {
  switch (type) {
    case "video": {
      // Update UI.
      hideCurrentlyDownloading();
      hideDownloadProgressBar();

      let downloadQueueContainer = document.getElementById("download_queue_container");
      let itemElements = downloadQueueContainer.children;
      let currentVideo = itemElements.item(downloadQueueContainer.childElementCount - downloadQueue.length());
      // Safeguard.
      if (currentVideo.classList.contains("playlist_download_view")) {
        downloadNextItem();
        return;
      }
      // Update visually to show that it downloaded.
      currentVideo.classList.remove("downloading");
      currentVideo.classList.add("downloaded");
      let currentState = itemElements.item(downloadQueueContainer.childElementCount - downloadQueue.length()).firstChild.lastChild;
      currentState.lastChild.remove(); // Remove percentage.
      let currentProgressBar = currentVideo.lastChild;
      currentProgressBar.style.width = "0%";
      
      let doneIcon = document.createElement("img");
      doneIcon.src = "./images/done.svg";
      doneIcon.className = "video_download_done";
      currentState.appendChild(doneIcon);

      // Update queue.
      downloadQueue.dequeue();
      // Start downloading next video.
      downloadNextItem();
      break;
    }
    case "playlist": {
      // Update UI.
      hideCurrentlyDownloading();
      hideDownloadProgressBar();

      let downloadQueueContainer = document.getElementById("download_queue_container");
      let itemElements = downloadQueueContainer.children;
      let currentPlaylist = itemElements.item(downloadQueueContainer.childElementCount - downloadQueue.length());
      // This means the rest of the playlist download has been cancelled. Prevents errors.
      if (currentPlaylist == null)
        return;
      // Safeguard.
      if (currentPlaylist.classList.contains("video_download_view")) {
        downloadNextItem();
        return;
      }
      // Update visually to show that it downloaded.
      let currentState = itemElements.item(downloadQueueContainer.childElementCount - downloadQueue.length()).firstChild.lastChild;
      let videosDownloadedElement = currentState.lastChild;
      let currentProgressBar = currentPlaylist.lastChild;
      // Check to see if all videos are downloaded or if cancelled.
      if (videosDownloadedElement.innerText.split(' / ')[0] == videosDownloadedElement.innerText.split(' / ')[1]) {
        currentPlaylist.classList.remove("downloading");
        currentPlaylist.classList.add("downloaded");
        videosDownloadedElement.lastChild.remove(); // Remove videos downloaded progress.
        currentProgressBar.style.width = "0%";
        
        let doneIcon = document.createElement("img");
        doneIcon.src = "./images/done.svg";
        doneIcon.className = "video_download_done";
        currentState.appendChild(doneIcon);

        // Update queue
        downloadQueue.dequeue();
        // Start downloading next video
        downloadNextItem();
      } else { // Still downloading
        let [current, total] = videosDownloadedElement.innerText.split(' / ');
        videosDownloadedElement.innerText = `${parseInt(current) + 1} / ${total}`;
        currentProgressBar.style.width = `${((parseInt(current)) / total) * 100}%`;
        hideCurrentlyDownloading();
        hideDownloadProgressBar();
      }
      break;
    }
  }
}

// Function to update the UI of the currently downloading video.
eel.expose(updateCurrentlyDownloadingVideo);
export function updateCurrentlyDownloadingVideo(video) {
  showCurrentlyDownloading();
  let videoTitle = document.getElementById("currently_downloading_video_title");
  videoTitle.innerText = video.title;
  videoTitle.onclick = function() {
    viewVideo(video);
  }
}

// Show the currentlyDownloading info.
export function showCurrentlyDownloading() {
  let currentlyDownloading = document.getElementById("currently_downloading");
  currentlyDownloading.style.display = "flex";
}

// Hide the currentlyDownloading info.
export function hideCurrentlyDownloading() {
  let currentlyDownloading = document.getElementById("currently_downloading");
  currentlyDownloading.style.display = "none";
}

// Function to update the download progress inside the download queue.
eel.expose(updateDownloadProgress);
export function updateDownloadProgress(percentage) {
  let downloadingElement = document.getElementsByClassName("downloading")[0];
  // Playlist download progress is handled differently. (Found inside finishDownload())
  if (downloadingElement && downloadingElement.classList.contains("playlist_download_view") || currentDownloadType == "playlist") {
    return;
  }

  let downloadQueueContainer = document.getElementById("download_queue_container");
  let progressBars = document.getElementsByClassName("video_download_progress_bar");
  let states = document.getElementsByClassName("video_download_state");

  // Update progress bar.
  let currentProgressBar = progressBars.item(downloadQueueContainer.childElementCount - downloadQueue.length());
  currentProgressBar.style.width = `${percentage}%`;

  // Update percentage text.
  let currentState = states.item(downloadQueueContainer.childElementCount - downloadQueue.length());
  if (currentState.lastChild && currentState.lastChild.className == "video_download_percentage") {
    currentState.lastChild.innerText = `${Math.trunc(percentage)}%`;
  } else {
    let downloadPercentageElement = document.createElement("p");
    downloadPercentageElement.className = "video_download_percentage";
    currentState.appendChild(downloadPercentageElement);
  }
}

// Function to handle removal from downloadQueueContainer UI.
export function removeFromQueueContainer(node) {
  let downloadQueueContainer = document.getElementById("download_queue_container");
  downloadQueueContainer.removeChild(node);

  // Update the item numbers. It's done like this to avoid conflicting with other "video_number" class elements.
  let items = document.getElementById("download_queue_container").children;
  Array.from(items).forEach((item, index) => {
    item.firstChild.firstChild.innerText = index + 1; // The item number
  });
}

// Function to handle adding item to downloadQueueContainer.
export function addToQueueContainer(item, downloadType) {
  let downloadQueueContainer = document.getElementById("download_queue_container");
  let type = item.type;

  // Create the layouts and handlers for the downloadType.
  switch (type) {
    case "video": {
      let videoDownloadView = document.createElement("div");
      videoDownloadView.className = "video_download_view";
      videoDownloadView.onclick = function() {
        viewVideo(item);
      }

      let videoDownloadInfo = document.createElement("div");
      videoDownloadInfo.className = "video_download_info";

      let videoNumber = document.createElement("p");
      videoNumber.innerHTML = downloadQueueContainer.childElementCount + 1;
      videoNumber.className = "video_number";
      videoDownloadInfo.appendChild(videoNumber);

      let thumbnail = document.createElement("img");
      thumbnail.src = item.thumbnail_url;
      thumbnail.className = "video_download_thumbnail";
      videoDownloadInfo.appendChild(thumbnail);

      let videoDownloadSideInfo = document.createElement("div");
      videoDownloadSideInfo.className = "video_download_side_info";

      let title = document.createElement("h3");
      title.innerText = item.title;
      title.className = "video_download_title";
      videoDownloadSideInfo.appendChild(title);

      let type = document.createElement("p");
      type.innerText = downloadType.charAt(0).toUpperCase() + downloadType.slice(1);
      type.className = "download_type_text";
      videoDownloadSideInfo.appendChild(type);

      videoDownloadInfo.appendChild(videoDownloadSideInfo);

      let state = document.createElement("div");
      state.className = "video_download_state";
      
      let closeIcon = document.createElement("img");
      closeIcon.src = "./images/close.svg";
      closeIcon.className = "video_download_close";
      closeIcon.onclick = function(e) {
        e.stopPropagation();
        removeFromQueueContainer(videoDownloadView);
        downloadQueue.remove(item);
      }
      state.appendChild(closeIcon);

      videoDownloadInfo.appendChild(state);

      videoDownloadView.appendChild(videoDownloadInfo);

      let progressBar = document.createElement("div");
      progressBar.className = "video_download_progress_bar";

      videoDownloadView.appendChild(progressBar);

      downloadQueueContainer.appendChild(videoDownloadView);
      break;
    }
    case "playlist": {
      let playlistDownloadView = document.createElement("div");
      playlistDownloadView.className = "playlist_download_view";
      playlistDownloadView.onclick = function() {
        viewPlaylist(item);
      }

      let playlistDownloadInfo = document.createElement("div");
      playlistDownloadInfo.className = "playlist_download_info";

      let number = document.createElement("p");
      number.innerHTML = downloadQueueContainer.childElementCount + 1;
      number.className = "video_number";
      playlistDownloadInfo.appendChild(number);

      let thumbnail = document.createElement("img");
      thumbnail.src = item.thumbnail_url;
      thumbnail.className = "video_download_thumbnail";
      playlistDownloadInfo.appendChild(thumbnail);

      let playlistDownloadSideInfo = document.createElement("div");
      playlistDownloadSideInfo.className = "playlist_download_side_info";

      let title = document.createElement("h3");
      title.innerText = item.title;
      title.className = "video_download_title";
      playlistDownloadSideInfo.appendChild(title);

      let type = document.createElement("p");
      type.innerText = `Playlist (${downloadType})`;
      type.className = "download_type_text";
      playlistDownloadSideInfo.appendChild(type);

      playlistDownloadInfo.appendChild(playlistDownloadSideInfo);

      let state = document.createElement("div");
      state.className = "playlist_download_state";

      let closeIcon = document.createElement("img");
      closeIcon.src = "./images/close.svg";
      closeIcon.className = "video_download_close";
      closeIcon.onclick = function(e) {
        e.stopPropagation();
        removeFromQueueContainer(playlistDownloadView);
        downloadQueue.remove(item);
        eel.stop_downloading();
      }
      state.appendChild(closeIcon);

      playlistDownloadInfo.appendChild(state);

      playlistDownloadView.appendChild(playlistDownloadInfo);

      let progressBar = document.createElement("div");
      progressBar.className = "playlist_download_progress_bar";

      playlistDownloadView.appendChild(progressBar);

      downloadQueueContainer.appendChild(playlistDownloadView);
      break;
    }
  }
}

// Function update the big downloadProgressBar at the bottom.
eel.expose(updateDownloadProgressBar);
export function updateDownloadProgressBar(newDownloadedAmount, totalAmount) {
  let downloadProgress = document.getElementById("download_progress");
  downloadProgress.style.opacity = 100;
  let downloadedAmount = document.getElementById("downloaded_amount");
  downloadedAmount.innerHTML = `${newDownloadedAmount} MB`;
  let downloadTotalAmount = document.getElementById("download_total_amount");
  downloadTotalAmount.innerHTML = `${totalAmount} MB`;

  let percent = (newDownloadedAmount / totalAmount) * 100;

  let progressBar = document.getElementById("progress_bar");
  progressBar.style.width = `${percent}%`;
  let percentage = document.getElementById("percentage");
  percentage.innerHTML = `${Math.trunc(percent)}%`;
}

// Hide the downloadProgressBar.
export function hideDownloadProgressBar() {
  let progressBar = document.getElementById("download_progress");
  progressBar.style.opacity = 0;
}

// Update the filePath visually.
export function updateFilePath(path) {
  let filePath = document.getElementById("file_path");
  filePath.innerHTML = path;
}
