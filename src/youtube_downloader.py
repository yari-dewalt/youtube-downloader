# youtube_downloader.py
# Functionality relating to PyTube and the overall flow of the program.

# Imports
from gevent.event import Event
import gevent.monkey
gevent.monkey.patch_all()
import eel
from pytube import YouTube, Channel, Playlist, Stream, exceptions
from pytube.__main__ import InnerTube
from urllib import error
from datetime import datetime
import re
import os

# timeago library caused issues when building, so we use this function instead
def pretty_date(time: datetime | None = None):
    """
    Get a datetime object or a int() Epoch timestamp and return a
    pretty string like 'an hour ago', 'Yesterday', '3 months ago',
    'just now', etc
    """
    now = datetime.now()
    if type(time) is int:
        diff = now - datetime.fromtimestamp(time)
    elif isinstance(time, datetime):
        diff = now - time
    elif not time:
        diff = 0
    second_diff = diff.seconds
    day_diff = diff.days

    if day_diff < 0:
        return ''

    if day_diff == 0:
        if second_diff < 10:
            return "just now"
        if second_diff < 60:
            return str(second_diff) + " seconds ago"
        if second_diff < 120:
            return "a minute ago"
        if second_diff < 3600:
            return str(second_diff // 60) + " minutes ago"
        if second_diff < 7200:
            return "an hour ago"
        if second_diff < 86400:
            return str(second_diff // 3600) + " hours ago"
    if day_diff == 1:
        return "Yesterday"
    if day_diff < 7:
        return str(day_diff) + " days ago"
    if day_diff < 31:
        return str(day_diff // 7) + " weeks ago"
    if day_diff < 365:
        return str(day_diff // 30) + " months ago"
    return str(day_diff // 365) + " years ago"

# Global variable to track sign-in status.
signed_in = False

# Initialize InnerTube with OAuth.
innertube = InnerTube(use_oauth=True)

# Set up threads.
playlists_thread = None
videos_thread = None
greenlets = []

# Event to signal stopping fetching info.
stop_fetching = Event()
should_stop_downloading = False

def set_signed_in(value: bool):
    """Set the signed-in status."""
    global signed_in
    signed_in = value

def stop_fetching_info():
    """Stop fetching information."""
    stop_fetching.set()
    # Send kill command to all threads.
    gevent.killall(greenlets, block=True)

def stop_downloading():
    """Stop downloading."""
    global should_stop_downloading
    should_stop_downloading = True

def fetch_video(video_link: str) -> dict[str, str] | None:
    """Fetch video information."""
    try:
        video = YouTube(video_link)
        channel = fetch_channel(video.channel_url)
        video_object = {
                        "type": "video",
                        "title": video.title,
                        "channel": channel,
                        "description": video.description,
                        "date": pretty_date(video.publish_date),
                        "length": video.length,
                        "views": video.views,
                        "thumbnail_url": video.thumbnail_url,
                        "link": video.watch_url
                       }
        return video_object
    except (exceptions.RegexMatchError, error.HTTPError, KeyError, exceptions.VideoUnavailable, exceptions.VideoPrivate, exceptions.VideoRegionBlocked):
        eel.reportError("Could not fetch video.")

def fetch_playlist(playlist_link: str) -> dict[str, str] | None:
    """Fetch playlist information."""
    try:
        playlist = Playlist(playlist_link)
        channel = fetch_channel(playlist.owner_url)
        thumbnail_url = ""
        for video_url in playlist.url_generator():
            video = YouTube(video_url)
            thumbnail_url = video.thumbnail_url
            break

        playlist_object = {
                           "type": "playlist",
                           "title": playlist.title,
                           "channel": channel,
                           "link": playlist_link,
                           "length": playlist.length,
                           "views": playlist.views,
                           "thumbnail_url": thumbnail_url,
                           "link": playlist_link
                           }
        return playlist_object
    except (exceptions.RegexMatchError, error.HTTPError, KeyError):
        eel.reportError("Could not fetch playlist.")

def fetch_channel(link: str) -> dict[str, str] | None:
    """Fetch channel information."""
    try:
        channel = Channel(link)
        subscribers_pattern = r"(\d+,?\.?\d+\w?) subscribers"
        subscribers_match = re.search(subscribers_pattern, channel.html)
        videos_pattern = r"(\d+,?\.?\d+\w?) videos"
        videos_match = re.search(videos_pattern, channel.about_html)

        channel_info = {
                        "type": "channel",
                        "name": channel.channel_name,
                        "link": link,
                        "description": channel.description,
                        "image": channel.thumbnail_url,
                        "num_videos": videos_match.group(1) if videos_match else '-',
                        "num_subscribers": subscribers_match.group(1) if subscribers_match else '-'
                       }
        return channel_info
    except (exceptions.RegexMatchError, error.HTTPError, KeyError):
        eel.reportError("Could not fetch channel.")

def fetch_videos_async(link: str, event: Event, amount: int = 10) -> list[dict[str, str]]:
    """Fetch videos asynchronously from a given channel link."""
    channel = Channel(link)
    videos = []
    for video in channel.videos_generator():
        if stop_fetching.is_set():
            if videos_thread is not None:
                videos_thread.kill()
            return videos
        video_object = fetch_video(video.watch_url)
        eel.addVideo(video_object, "channel")
        videos.append(video_object)
        if len(videos) == amount:
            event.set()
            return videos

    event.set()
    return videos

# Function that waits return from async function, no return value
def fetch_videos(link: str, amount: int = 10) -> None:
    global videos_thread
    event = Event()
    if stop_fetching.is_set():
        stop_fetching.clear()
    videos_thread = gevent.spawn(fetch_videos_async, link, event, amount)
    greenlets.append(videos_thread)
    videos_thread.start()
    event.wait()

def fetch_playlists_async(channel_link: str, event: Event) -> list[dict[str, str]]:
    """Fetch playlists asynchronously from a given channel link."""
    channel = Channel(channel_link)
    playlists_urls = set()
    playlists_pattern = r'"playlistId":"[A-Za-z0-9_-]+"'
    playlists_match = re.findall(playlists_pattern, channel.playlists_html)
    for playlist in playlists_match:
        playlist_id = playlist.split(':')[1][1:-1]
        playlists_urls.add("https://www.youtube.com/playlist?list=" + playlist_id)

    playlists = []
    for url in playlists_urls:
        if stop_fetching.is_set():
            if playlists_thread is not None:
                playlists_thread.kill()
            return playlists
        playlist_object = fetch_playlist(url)
        playlists.append(playlist_object)
        eel.addPlaylist(playlist_object)

    event.set()
    return playlists

# Function that waits return from async function, no return value
def fetch_playlists(channel_link: str) -> None:
    global playlists_thread
    event = Event()
    if stop_fetching.is_set():
        stop_fetching.clear()
    playlists_thread = gevent.spawn(fetch_playlists_async, channel_link, event)
    greenlets.append(playlists_thread)
    playlists_thread.start()
    event.wait()

def fetch_playlist_videos_async(playlist_link: str, event: Event, amount: int=1000) -> list[dict[str, str]]:
    """Fetch videos from a playlist asynchronously from a given playlist link."""
    playlist = Playlist(playlist_link)
    videos = []
    for video in playlist.videos_generator():
        if stop_fetching.is_set():
            if videos_thread is not None:
                videos_thread.kill()
            return videos
        video_object = fetch_video(video.watch_url)
        eel.addVideo(video_object, "playlist")
        videos.append(video_object)
        if len(videos) == amount:
            event.set()
            return videos
    event.set()
    return videos

# Function that waits return from async function, no return value
def fetch_playlist_videos(playlist_link: str, amount: int=1000) -> None:
    global videos_thread
    event = Event()
    if stop_fetching.is_set():
        stop_fetching.clear()
    videos_thread = gevent.spawn(fetch_playlist_videos_async, playlist_link, event, amount)
    videos_thread.start()
    event.wait()

# --- Callbacks ---
def on_progress(stream: Stream, chunk: bytes, bytes_remaining: int) -> None:
    """Update download progress."""
    total_size_MB = stream.filesize // 1000 // 1000
    remaining_MB = bytes_remaining // 1000 // 1000
    downloaded_MB = total_size_MB - remaining_MB
    percentage = (downloaded_MB / total_size_MB) * 100
    eel.updateDownloadProgressBar(total_size_MB - remaining_MB, total_size_MB)
    eel.updateDownloadProgress(percentage)

def on_complete(stream: Stream, file_path: str | None) -> None:
    """Handle download completion for a single video."""
    eel.finishDownload("video")

def on_playlist_video_complete(stream: Stream, file_path: str | None) -> None:
    """Handle download completion for a playlist video."""
    eel.finishDownload("playlist")

def on_audio_complete(stream: Stream, file_path: str | None) -> None:
    """Handle download completion for a single video's audio."""
    eel.finishDownload("video")
    if file_path is not None:
        base = file_path.split('.')[0]
        os.rename(file_path, base + ".mp3")

def on_playlist_audio_complete(stream: Stream, file_path: str | None) -> None:
    """Handle download completion for a playlist video's audio."""
    eel.finishDownload("playlist")
    if file_path is not None:
        base = file_path.split('.')[0]
        os.rename(file_path, base + ".mp3")
# ------

def download_playlist_videos(playlist_link: str, directory: str, download_option: str) -> None:
    """Download all videos in a playlist."""
    playlist = Playlist(playlist_link)
    global should_stop_downloading
    should_stop_downloading = False
    for video in playlist.videos_generator():
        if should_stop_downloading:
            return
        channel = fetch_channel(video.channel_url)
        video_object = {
                        "type": "video",
                        "channel": channel,
                        "title": video.title,
                        "description": video.description,
                        "date": pretty_date(video.publish_date),
                        "length": video.length,
                        "views": video.views,
                        "thumbnail_url": video.thumbnail_url,
                        "link": video.watch_url
                       }
        eel.updateCurrentlyDownloadingVideo(video_object)
        download_playlist_video(video.watch_url, directory, download_option)

def download_video(link: str, directory: str, download_option: str) -> None:
    """Download a single video."""
    try:
        stream = None
        match download_option:
            case "video":
                video = YouTube(url=link, on_progress_callback=on_progress, on_complete_callback=on_complete, use_oauth=signed_in)
                stream = video.streams.get_highest_resolution()
            case "audio":
                video = YouTube(url=link, on_progress_callback=on_progress, on_complete_callback=on_audio_complete, use_oauth=signed_in)
                stream = video.streams.get_audio_only()
        if stream:
            stream.download(output_path=directory if directory else None)
    except exceptions.PytubeError: # In future can add in different ways of handling specific errors.
        eel.errorDownloading("video")

def download_playlist_video(video_link: str, directory: str, download_option: str) -> None:
    """Download a single video from a playlist."""
    try:
        stream = None
        match download_option:
            case "video":
                video = YouTube(url=video_link, on_progress_callback=on_progress, on_complete_callback=on_playlist_video_complete, use_oauth=signed_in)
                stream = video.streams.get_highest_resolution()
            case "audio":
                video = YouTube(url=video_link, on_progress_callback=on_progress, on_complete_callback=on_playlist_audio_complete, use_oauth=signed_in)
                stream = video.streams.get_audio_only()
        if stream:
            stream.download(output_path=directory if directory else None)
    except exceptions.PytubeError: # In future can add in different ways of handling specific errors.
        eel.errorDownloading("playlist")
