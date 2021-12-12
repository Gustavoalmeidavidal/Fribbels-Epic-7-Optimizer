const { ipcRenderer } = require('electron');
global.ipcRenderer = ipcRenderer;
const currentVersion = "1.8.0-beta.4";

global.TEST = true;
/********************************************************************************************
    Release checklist:
    - update changelog
    - set TEST = false
    - package jar
    - update version here
    - update version in app package.json
    - update repo in project package.json
    - yarn package
*********************************************************************************************/

/********************************************************************************************
    TODO:
    - Update grid initialization with languages
*********************************************************************************************/

module.exports = {

    getCurrentVersion: () => {
        return currentVersion;
    },
/*
- Hero tab double click
- Magnifying glass
*/
    showNewFeatures: (text) => {
        Dialog.showNewFeatures(
`
<h2>
    New in v1.8
</h2>
<ul class="newFeatures">
    <li>Enhancing tab with item analyzer</li>
    <li>Click on the magnifying glass to load item details</li>
    <li>Can now double click a hero on the Heroes tab to load them on Optimizer tab</li>
    <li>Added item attribute to disable modifications on the item</li>
    <li>Added custom dark theme colors</li>
    <li>Customizeable gear archetypes in settings file</li>
    <li>Ehp and Mcd preview in filters</li>
    <li>5 star hero indicator</li>
    <li>Penetration set used in dmg calculation & target defense setting</li>
    <li>Enhance limit optimizer setting</li>
    <li>Scores now use reforged values</li>
    <li>Added per-unit score evaluation</li>
    <li>Increasing optimization threads based on CPU core count</li>
</ul>
`
        );
    },

    checkForUpdates: async () => {
        //
        // try {
        //     const latestData = await fetch('https://api.github.com/repos/fribbels/Fribbels-Epic-7-Optimizer/releases/latest')
        //     const latestDataText = await latestData.text();
        //     const latestDataJson = JSON.parse(latestDataText);
        //     const latestVersion = latestDataJson.tag_name;

        //     if (latestVersion != currentVersion) {
        //         const shell = require('electron').shell;

        //         // assuming $ is jQuery
        //         $(document).on('click', 'a[href^="http"]', function(event) {
        //             event.preventDefault();
        //             shell.openExternal(this.href);
        //         });

        //         Dialog.htmlSuccessDisableOutsideClick(i18next.t("New version available: <a href='https://github.com/fribbels/Fribbels-Epic-7-Optimizer/releases'>") + latestVersion + "<a>");
        //     }

        //     // console.error(latestDataJson);
        // } catch (e) {
        //     console.error(e)
        // }

        const version = document.getElementById('version');
        const versionPrefixText = i18next.t("Current version");
        version.innerText = versionPrefixText + ": v" + currentVersion;

        ipcRenderer.on('update_available', () => {
            Notifier.info(i18next.t("New version available, downloading now"));
        });
        ipcRenderer.on('update-not-available', () => {
        });
        ipcRenderer.on('test', (arg1, arg2) => {
            console.log("test", arg1, arg2)
        });
        ipcRenderer.on('check', (arg1, arg2) => {
            console.log("check", arg1, arg2)
            try {
                if (typeof arg2 === 'string' || arg2 instanceof String) {
                    const response = JSON.parse(arg2);
                    console.log(response);
                    const updateVersion = response.updateInfo.version;

                    if (currentVersion == updateVersion) {
                        Notifier.info(i18next.t("No new updates found"));
                    }
                } else {
                    const response = arg2;
                    console.log(response);
                    const updateVersion = response.updateInfo.version;

                    if (currentVersion == updateVersion) {
                        Notifier.info(i18next.t("No new updates found"));
                    }
                }
            } catch (e) {
                console.warn("Failed to parse IPC response", e)
                Notifier.info(i18next.t("No new updates found"));
            }
        });
        ipcRenderer.on('update_downloaded', async (arg1, arg2) => {
            console.log("update_downloaded", arg1, arg2)
            var response = await Dialog.updatePrompt("Update downloaded. It will be installed on restart. Restart app now?")

            if (response == 'restart') {
                await Subprocess.kill();
                restartApp();
            }
        });

        function restartApp() {
            ipcRenderer.send('restart_app');
        }


        document.getElementById('checkForUpdatesSubmit').addEventListener("click", async () => {
            Notifier.info(i18next.t("Checking for updates"));

            try {
                await HeroData.initialize();
            } catch (e) {
                console.error("Error refreshing hero data " + e)
            }

            ipcRenderer.send('check');
        });
    }
}