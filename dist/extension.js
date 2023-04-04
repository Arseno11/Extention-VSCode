/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = void 0;
const vscode = __webpack_require__(1);
const child_process_1 = __webpack_require__(2);
const frameworkOptions = {
    php: [`Laravel`, `CodeIgniter`, `Symfony`],
    javascript: [`React`, `Vue`, `Angular`, `Next.js`]
};
function activate(context) {
    // Create status bar item for loading animation
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
    statusBarItem.text = "$(sync~spin) Creating Web App...";
    context.subscriptions.push(statusBarItem);
    let disposable = vscode.commands.registerCommand(`arseno.WebAppCreate`, async () => {
        console.log(`Command triggered`);
        // Show loading animation on status bar
        statusBarItem.show();
        const folderName = await vscode.window.showInputBox({
            prompt: `Please enter a project name`,
            placeHolder: `MyWebApp`,
            validateInput: (value) => {
                return !value ? 'Please enter a project name' : null;
            },
        });
        console.log(`Folder name:`, folderName);
        if (!folderName) {
            // Hide loading animation on status bar
            statusBarItem.hide();
            return;
        }
        let previousSelections = [];
        try {
            while (true) {
                const languageSelection = await vscode.window.showQuickPick([...previousSelections, `PHP`, `JavaScript`, `Back`], {
                    placeHolder: `Select programming language`,
                });
                console.log(`Language selection:`, languageSelection);
                if (!languageSelection) {
                    // Hide loading animation on status bar
                    statusBarItem.hide();
                    return;
                }
                if (languageSelection === `Back`) {
                    previousSelections.pop();
                    continue;
                }
                const frameworkSelection = await vscode.window.showQuickPick([...frameworkOptions[languageSelection.toLowerCase()], `Back`], {
                    placeHolder: `Select ${languageSelection} framework`,
                });
                console.log(`Framework selection:`, frameworkSelection);
                if (!frameworkSelection) {
                    // Hide loading animation on status bar
                    statusBarItem.hide();
                    previousSelections.pop();
                    continue;
                }
                if (frameworkSelection === `Back`) {
                    continue;
                }
                previousSelections.push(languageSelection);
                previousSelections.push(frameworkSelection);
                // Check if Composer is installed for PHP/Laravel projects
                if (languageSelection.toLowerCase() === `php` && [`Laravel`, `CodeIgniter`, `Symfony`].includes(frameworkSelection.toLowerCase())) {
                    (0, child_process_1.exec)(`composer -v`, (error, stdout, stderr) => {
                        if (error || stderr) {
                            const message = `Composer not found, do you want to install it?`;
                            const options = [`Yes`, `No`];
                            vscode.window.showQuickPick(options, { placeHolder: message }).then((response) => {
                                if (response === `Yes`) {
                                    (0, child_process_1.exec)(`php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && php -r "if (hash_file('sha384', 'composer-setup.php') === '55ce33d7678c5a611085589f1f3ddf8b3c52d662cd01d4ba75c0ee0459970c2200a51f492d557530c71c15d8dba01eae') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" && php composer-setup.php && php -r "unlink('composer-setup.php');"`, (error, stdout, stderr) => {
                                        if (error || stderr) {
                                            vscode.window.showErrorMessage(`Composer installation failed. Please install manually.`);
                                        }
                                        else {
                                            vscode.window.showInformationMessage(`Composer successfully installed.`);
                                        }
                                    });
                                }
                                else if (response === `Back`) {
                                    previousSelections.pop();
                                    previousSelections.pop();
                                }
                            });
                        }
                    });
                }
                // Check if npm, npx, and node are installed for JavaScript projects
                if (languageSelection.toLowerCase() === `javascript` && [`react`, `vue`, `angular`, `next.js`, `ember.js`, `meteor.js`].includes(frameworkSelection.toLowerCase())) {
                    (0, child_process_1.exec)(`npm -v && npx -v && node -v`, (error, stdout, stderr) => {
                        if (error || stderr) {
                            const missingPackages = [];
                            if (error && error.message && error.message.includes(`npm`)) {
                                missingPackages.push(`npm`);
                            }
                            if (error && error.message && error.message.includes(`npx`)) {
                                missingPackages.push(`npx`);
                            }
                            if (error && error.message && error.message.includes(`node`)) {
                                missingPackages.push(`node`);
                            }
                            const message = `${missingPackages.join(`, `)} not found, do you want to install them?`;
                            const options = [`Yes`, `No`];
                            vscode.window.showQuickPick(options, { placeHolder: message }).then((response) => {
                                if (response === `Yes`) {
                                    (0, child_process_1.exec)(`curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - && sudo apt-get install -y nodejs`, () => {
                                        (0, child_process_1.exec)(`npm install -g npm`);
                                        (0, child_process_1.exec)(`npm install -g npx`);
                                    });
                                }
                            });
                        }
                    });
                }
                // Create folder and initialize project
                const terminal = vscode.window.createTerminal();
                terminal.sendText(`mkdir ${folderName} && cd ${folderName}`);
                if (languageSelection.toLowerCase() === `php`) {
                    switch (frameworkSelection.toLowerCase()) {
                        case `laravel`:
                            try {
                                await vscode.window.withProgress({
                                    location: vscode.ProgressLocation.Notification,
                                    title: `Installing ${frameworkSelection}...`,
                                    cancellable: false
                                }, async (progress) => {
                                    let increment = 0;
                                    const interval = setInterval(() => {
                                        increment += 10;
                                        if (increment > 80) {
                                            increment = 0;
                                        }
                                        progress.report({ increment });
                                    }, 80);
                                    await terminal.sendText(`composer create-project --prefer-dist laravel/laravel ${folderName}`);
                                    clearInterval(interval);
                                    progress.report({ increment: 80 });
                                    vscode.window.showInformationMessage(`${frameworkSelection} installed successfully!`);
                                });
                            }
                            catch (err) {
                                vscode.window.showErrorMessage(`Error: ${err.message}`);
                            }
                            break;
                        case `codeigniter`:
                            try {
                                await vscode.window.withProgress({
                                    location: vscode.ProgressLocation.Notification,
                                    title: `Installing ${frameworkSelection}...`,
                                    cancellable: false
                                }, async (progress) => {
                                    let increment = 0;
                                    const interval = setInterval(() => {
                                        increment += 10;
                                        if (increment > 80) {
                                            increment = 0;
                                        }
                                        progress.report({ increment });
                                    }, 80);
                                    await terminal.sendText(`composer create-project codeigniter4/appstarter ${folderName}`);
                                    clearInterval(interval);
                                    progress.report({ increment: 80 });
                                    vscode.window.showInformationMessage(`${frameworkSelection} installed successfully!`);
                                });
                            }
                            catch (err) {
                                vscode.window.showErrorMessage(`Error: ${err.message}`);
                            }
                            break;
                        case `symfony`:
                            try {
                                await vscode.window.withProgress({
                                    location: vscode.ProgressLocation.Notification,
                                    title: `Installing ${frameworkSelection}...`,
                                    cancellable: false
                                }, async (progress) => {
                                    let increment = 0;
                                    const interval = setInterval(() => {
                                        increment += 10;
                                        if (increment > 80) {
                                            increment = 0;
                                        }
                                        progress.report({ increment });
                                    }, 80);
                                    await terminal.sendText(`composer create-project symfony/website-skeleton ${folderName}`);
                                    clearInterval(interval);
                                    progress.report({ increment: 80 });
                                    vscode.window.showInformationMessage(`${frameworkSelection} installed successfully!`);
                                });
                            }
                            catch (err) {
                                vscode.window.showErrorMessage(`Error: ${err.message}`);
                            }
                            break;
                    }
                }
                else if (languageSelection.toLowerCase() === `javascript`) {
                    switch (frameworkSelection.toLowerCase()) {
                        case `react`:
                            try {
                                await vscode.window.withProgress({
                                    location: vscode.ProgressLocation.Notification,
                                    title: `Installing ${frameworkSelection}...`,
                                    cancellable: false
                                }, async (progress) => {
                                    let increment = 0;
                                    const interval = setInterval(() => {
                                        increment += 10;
                                        if (increment > 80) {
                                            increment = 0;
                                        }
                                        progress.report({ increment });
                                    }, 80);
                                    await terminal.sendText(`npx create-react-app ${folderName}`);
                                    clearInterval(interval);
                                    progress.report({ increment: 80 });
                                    vscode.window.showInformationMessage(`${frameworkSelection} installed successfully!`);
                                });
                            }
                            catch (err) {
                                vscode.window.showErrorMessage(`Error: ${err.message}`);
                            }
                            break;
                        case `vue`:
                            try {
                                await vscode.window.withProgress({
                                    location: vscode.ProgressLocation.Notification,
                                    title: `Installing ${frameworkSelection}...`,
                                    cancellable: false
                                }, async (progress) => {
                                    let increment = 0;
                                    const interval = setInterval(() => {
                                        increment += 10;
                                        if (increment > 80) {
                                            increment = 0;
                                        }
                                        progress.report({ increment });
                                    }, 80);
                                    await terminal.sendText(`npm install -g @vue/cli`);
                                    await terminal.sendText(`vue create ${folderName}`);
                                    clearInterval(interval);
                                    progress.report({ increment: 80 });
                                    vscode.window.showInformationMessage(`${frameworkSelection} installed successfully!`);
                                });
                            }
                            catch (err) {
                                vscode.window.showErrorMessage(`Error: ${err.message}`);
                            }
                            break;
                        case `angular`:
                            try {
                                await vscode.window.withProgress({
                                    location: vscode.ProgressLocation.Notification,
                                    title: `Installing ${frameworkSelection}...`,
                                    cancellable: false
                                }, async (progress) => {
                                    let increment = 0;
                                    const interval = setInterval(() => {
                                        increment += 10;
                                        if (increment > 80) {
                                            increment = 0;
                                        }
                                        progress.report({ increment });
                                    }, 80);
                                    await terminal.sendText(`npm install -g @angular/cli`);
                                    await terminal.sendText(`ng new ${folderName}`);
                                    clearInterval(interval);
                                    progress.report({ increment: 80 });
                                    vscode.window.showInformationMessage(`${frameworkSelection} installed successfully!`);
                                });
                            }
                            catch (err) {
                                vscode.window.showErrorMessage(`Error: ${err.message}`);
                            }
                            break;
                        case `next.js`:
                            try {
                                await vscode.window.withProgress({
                                    location: vscode.ProgressLocation.Notification,
                                    title: `Installing ${frameworkSelection}...`,
                                    cancellable: false
                                }, async (progress) => {
                                    let increment = 0;
                                    const interval = setInterval(() => {
                                        increment += 10;
                                        if (increment > 80) {
                                            increment = 0;
                                        }
                                        progress.report({ increment });
                                    }, 80);
                                    await terminal.sendText(`npx create-next-app ${folderName}`);
                                    clearInterval(interval);
                                    progress.report({ increment: 80 });
                                    vscode.window.showInformationMessage(`${frameworkSelection} installed successfully!`);
                                });
                            }
                            catch (err) {
                                vscode.window.showErrorMessage(`Error: ${err.message}`);
                            }
                            break;
                    }
                }
                terminal.show();
                break;
            }
            statusBarItem.hide();
        }
        catch (err) {
            vscode.window.showErrorMessage(`Error: ${err.message}`);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map