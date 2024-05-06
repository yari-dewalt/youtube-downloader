# eel_helpers.py
# Contains all helper functions that communicate via eel.

from pytube.__main__ import InnerTube
from tkinter import Tk, filedialog

signed_in = False

innertube = InnerTube(use_oauth=True)

def get_codes() -> dict[str, str]:
    """Get sign-in and device codes for verification."""
    sign_in_code, device_code = innertube.get_sign_in_code_and_device_code()
    return { "sign_in_code": sign_in_code, "device_code": device_code }

def verify_account(device_code: str) -> bool:
    """Verify the account using the device code."""
    try:
        innertube.assign_and_cache_tokens(device_code)
        return True
    except:
        return False

def fetch_settings() -> dict[str, str]:
    """Fetch settings from settings.txt file."""
    settings = {}
    try:
        with open("settings.txt", 'r') as file:
            for line in file:
                line = line.strip()
                if '=' in line:
                    key, value = line.split('=')
                    settings[key.strip()] = value.strip()
    except FileNotFoundError:
        # Set default settings if file not found.
        default_settings = {
            "visual_mode": "light",
            "account_linked": "false"
        }

        with open("settings.txt", 'w') as file:
            for key, value in default_settings.items():
                file.write(f"{key}={value}\n")
            settings = default_settings

    return settings

def update_setting(key: str, value: str):
    """Update a setting in the settings.txt file."""
    new_settings = fetch_settings()
    new_settings[key] = value

    with open("settings.txt", 'w') as file:
        for key, value in new_settings.items():
            file.write(f"{key}={value}\n")

def open_file_dialog() -> str:
    """Open a file dialog to select a folder."""
    root = Tk()
    root.withdraw()
    root.wm_attributes("-topmost", 1)
    folder = filedialog.askdirectory()
    return folder

