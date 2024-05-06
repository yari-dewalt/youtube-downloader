<div align="center">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png" height="100"</img>
</div>
<h1 align="center">YouTube Downloader</h1>
<p align="center">A local app with a modernized GUI to view and download YouTube channels, playlists, and videos.</p>

<h2>About</h2>
<p>YouTube Downloader is made with <a href="https://github.com/python-eel/Eel">Eel</a> and <a href="https://github.com/pytube/pytube">PyTube</a>.</p>
<p><a href="https://github.com/python-eel/Eel">Eel</a> allows for an HTML/CSS/JS GUI with "full access to Python capabilities and libraries", and easy communication with the backend.</p>
<p>The backend utilizes the <a href="https://github.com/pytube/pytube">PyTube</a> API to handle the fetching and downloading of YouTube content through its own YouTube API wrapper.</p>

<h2>Features</h2>
<ul>
<li>View channels, playlists, and videos.</li>
<li>Download full video and/or audio of YouTube videos and playlists.
<li>Fully functioning download queue for multiple download types.</li>
<li>Modifiable download directory</li>
<li>YouTube account linking</li>
<li>Customizable settings</li>
</ul>

<h2>Installation</h2>
<p>YouTube Downloader is local app meant to be run from a single executable. However, if one wishes they can clone the repository and run the code locally (this is <b>not</b> recommended as modifications to PyTube were required to be made to fix some issues, and an individual's experience may not work as expected if those same issues aren't fixed locally).</p>
<h4>Local App Download</h4>
<p>YouTube downloader can be downloaded <a href="https://github.com/yari-dewalt/youtube-downloader/releases">here</a>. Once downloaded, unzip the directory into your preferred location. The app can then be launched by navigating into the directory and running <b>YouTube Downloader.exe</b></p>
<h4>GitHub</h4>
<ol>
<li>Clone the repository: <code>git clone https://github.com/yari-dewalt/youtube-downloader.git</code></li>
<li>Navigate into the cloned repository: <code>cd youtube-downloader</code>
<li>(Optional) Set up and activate a virtual environment:</li><code>python -m venv venv</code>
Windows: <code>venv\Scripts\activate</code>
macOS/Linux: <code>source venv/bin/activate</code>
</li>
<li>Install the project dependencies from the requirements.txt file: <code>pip install -r requirements.txt</code></li>
<li>Run the project: <code>python src/main.py</code></li>
</ol>

<h2>FAQ</h2>
<p><b>Q. Why does it take so long to load videos and playlists?</b><br>A- It takes time for PyTube to communicate with YouTube and return the packaged data. This is unfortunately kind of slow which is why it is recommended to input a specific video if you are looking for something in specific.</br></p>
<p><b>Q. Why do I not see some videos/playlists?</b><br>A- Only items that are publicly available are able to be fetched. Furthermore, some media may be age restricted or geographically locked. This can be solved by linking your YouTube account in the settings.</br></p>
<p><b>Q. Why am I getting an error when inputting a channel/video/playlist link?</b><br>A- This may be due to an incorrect link. Double check that the link is correct. It might also be because you don't have access to that specific piece of media (i.e. age restriction and/or not being available in your country). Try linking your YouTube account in the settings to solve this.</br></p>
<p><b>Q. Why am I getting an error when downloading a video/playlist?</b><br>A- If you are able to view and queue a download for a video/playlist and it results in an error, this is most likely due to an age restriction or geographical restriction. Linking your YouTube account in the settings can help solve this. This can also help due to a bad internet connection. Try making sure that your connection is good and restart the app if issues continue.</br></p>
