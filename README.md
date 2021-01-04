<p align="center">
	<h1 align="center">
		LionPanel For FiveM [End Of Support (For Now)]
	</h1>
	<h4 align="center">
		<!-- FiveM Forum thread: &nbsp; <a href="https://forum.fivem.net/t/530475"><img src="https://img.shields.io/badge/dynamic/json.svg?color=green&label=txAdmin&query=views&suffix=%20views&url=https%3A%2F%2Fforum.fivem.net%2Ft%2F530475.json"></img></a>  <br/> -->
		Join our Discord Server: &nbsp; <a href="https://discord.gg/ZDmgnzW"><img src="https://discordapp.com/api/guilds/705539678740414465/widget.png?style=shield"></img></a>
	</h4>
	<p align="center">
		<b>LionPanel</b> is fivem server management webpanel <b>forked</b> from txAdmin.
	</p>
</p>

<br/>



## Features
- Start/Stop/Restart your server instance or resources
- Access control via multiple credentials and action logging
- Discord Integration:
	- Server status command (`/status`)
	- Custom static commands
	- Command spam prevention
- Monitor server’s CPU/RAM consumption
- Real-time playerlist with ping + steam-linked accounts (when available)
- OneSync Support (more than 32 slots server)
- Linux Support
- Live Console
- Auto Restart on failure detection or schedule
- Password brute-force protection
- FXServer process priority setter
- Hitch Detection
- New settings page
- Save console to file
- Restart warning announcements
- Admin Management system
- Permissions system
- SSL Support
- Translation Support
- Server Activity Log (connections/disconnections, kills, chat, explosions and [custom commands]
- Ban System
- FiveM's Server CFG editor

## Changes / More Information
- This version of the panel has new yellow design theme. There will be others soon, when they are released i'll make tutorial how you can change the theme.
- Removed integrated updater currently for more performance, if you want update for now you can only git pull it.
- Add Extensions feature got removed, because its useless and no one need it. This panel its created for management, not for some extensions which will destroy the performance.


## Installing (Windows/Linux)

**Video Tutorial for Windows**: [soon]

**Requirements**:
- NodeJS v10 LTS (or newer)
- FXServer build 1543+ [(or newer)](https://runtime.fivem.net/artifacts/fivem/)
- One TCP listen port opened for the web server (default is 40120)
- Git (only for installs and updates)

**1 -** In the terminal (cmd, bash, powershell & etc) execute the following commands:
```bash
# Download LionPanel, Enter folder and Install dependencies
git clone https://ar.ar
cd LionPanel
npm i

# Add admin to the panel
node src/scripts/admin-add.js

# Setup default server profile for use
node src/scripts/setup.js default

# Start default fivem server
node src/index.js default

# Start default fivem server (trick for linux)
If you want your server to work without closing your connection to your machine, you can use download and use screen.
Steps :
cd LionPanel
screen -S lionpanel
node src/index.js default

And to leave the screen without closing it press CTRL + A + D
```
**If you use Windows, you can run LionPanel by executing `start_<profilename>.bat` in your panel folder (ex `LionPanel/start.bat`).**  

**2 -** Connect to your panel from your ip `http://yourip:40120/` in your browser.  

**Important Notes:**  
> **Note:** You MUST run FXServer **through** LionPanel, and not in parallel.  

> **Note2:** To configure your Discord bot, follow these two guides:  [Setting up a bot application](https://discordjs.guide/preparations/setting-up-a-bot-application.html) and [Adding your bot to servers](https://discordjs.guide/preparations/adding-your-bot-to-servers.html).  

> **Note3:** You can run multiple LionPanel instances in the same installation folder.  
> To create more server profiles, execute `node src/scripts/setup.js <profile name>`.

## Troubleshooting  
If you are having trouble starting the FXServer via txAdmin, run `node src/scripts/config-tester.js default` and see which test is failing.  

## Updating
To **UPDATE** LionPanel execute the following commands inside LionPanel's folder:
```bash
git pull
npm i
``` 
> **Note:** This will only work if you downloaded LionPanel using the `git clone` command, not downloading it from the github page.

## License
- This project is licensed under the [MIT License](https://github.com/martink1337/LionPanel/blob/master/LICENSE).

## Test Line