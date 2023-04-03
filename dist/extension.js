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
    javascript: [`React`, `Vue`, `Angular`, `Next.js`, `Ember.js`, `Meteor.js`]
};
function activate(context) {
    let disposable = vscode.commands.registerCommand(`arseno.WebAppCreate`, async () => {
        console.log(`Command triggered`);
        const folderName = await vscode.window.showInputBox({
            prompt: `Enter folder name`,
            placeHolder: `MyWebApp`,
        });
        console.log(`Folder name:`, folderName);
        if (!folderName) {
            return;
        }
        const languageSelection = await vscode.window.showQuickPick([`PHP`, `JavaScript`], {
            placeHolder: `Select programming language`,
        });
        console.log(`Language selection:`, languageSelection);
        if (!languageSelection) {
            return;
        }
        const frameworkSelection = await vscode.window.showQuickPick(frameworkOptions[languageSelection.toLowerCase()], {
            placeHolder: `Select ${languageSelection} framework`,
        });
        console.log(`Framework selection:`, frameworkSelection);
        if (!frameworkSelection) {
            // remove previous two selections from previousSelections array
            return;
        }
        // Check if Composer is installed for PHP/Laravel projects
        if (languageSelection.toLowerCase() === `php` && [`Laravel`, `CodeIgniter`, `Symfony`].includes(frameworkSelection.toLowerCase())) {
            (0, child_process_1.exec)(`composer -v`, (error, stdout, stderr) => {
                if (error || stderr) {
                    const message = `Composer not found, do you want to install it?`;
                    const options = [`Yes`, `No`];
                    vscode.window.showQuickPick(options, { placeHolder: message }).then((response) => {
                        if (response === `Yes`) {
                            (0, child_process_1.exec)(`php -r "copy(\`https://getcomposer.org/installer\`, \`composer-setup.php\`);" && php composer-setup.php && php -r "unlink(\`composer-setup.php\`);"`);
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
                        terminal.sendText(`composer create-project --prefer-dist laravel/laravel ${folderName}`);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`Error: ${err.message}`);
                    }
                    break;
                case `codeigniter`:
                    try {
                        terminal.sendText(`composer create-project codeigniter4/appstarter ${folderName}`);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`Error: ${err.message}`);
                    }
                    break;
                case `symfony`:
                    try {
                        terminal.sendText(`composer create-project symfony/website-skeleton ${folderName}`);
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
                        terminal.sendText(`npx create-react-app ${folderName}`);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`Error: ${err.message}`);
                    }
                    break;
                case `vue`:
                    try {
                        // Install Vue CLI
                        terminal.sendText(`npm install -g @vue/cli`);
                        // Create new Vue project
                        terminal.sendText(`vue create ${folderName}`);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`Error: ${err.message}`);
                    }
                    break;
                case `angular`:
                    try {
                        terminal.sendText(`npm install -g @angular/cli`);
                        terminal.sendText(`ng new ${folderName}`);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`Error: ${err.message}`);
                    }
                    break;
                case `next.js`:
                    try {
                        terminal.sendText(`npx create-next-app ${folderName}`);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`Error: ${err.message}`);
                    }
                    break;
                case `ember.js`:
                    try {
                        terminal.sendText(`ember new ${folderName}`);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`Error: ${err.message}`);
                    }
                    break;
                case `meteor.js`:
                    try {
                        terminal.sendText(`meteor create ${folderName}`);
                    }
                    catch (err) {
                        vscode.window.showErrorMessage(`Error: ${err.message}`);
                    }
                    break;
            }
        }
        terminal.show();
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map