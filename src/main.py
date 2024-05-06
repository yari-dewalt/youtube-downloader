# main.py

import eel
from eel_helpers import get_codes, verify_account, fetch_settings, update_setting, open_file_dialog
from youtube_downloader import set_signed_in, stop_fetching_info, stop_downloading, fetch_video, fetch_playlist, fetch_channel, fetch_videos, fetch_playlists, fetch_playlist_videos, download_playlist_videos, download_video

if __name__ == "__main__":
    # Initialize.
    eel.init("web")
    
    # Expose functions.

    # From eel_helpers.py.
    eel.expose(set_signed_in)
    eel.expose(get_codes)
    eel.expose(verify_account)
    eel.expose(fetch_settings)
    eel.expose(update_setting)
    eel.expose(open_file_dialog)

    # From youtube_downloader.py.
    eel.expose(stop_fetching_info)
    eel.expose(stop_downloading)
    eel.expose(fetch_video)
    eel.expose(fetch_playlist)
    eel.expose(fetch_channel)
    eel.expose(fetch_videos)
    eel.expose(fetch_playlists)
    eel.expose(fetch_playlist_videos)
    eel.expose(download_playlist_videos)
    eel.expose(download_video)

    # Start.
    eel.start("index.html", size=(800, 600), position=(560, 240)) # Positioned for 1920x1080.

