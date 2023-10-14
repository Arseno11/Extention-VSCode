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

/***/ }),
/* 3 */
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "filesize": () => (/* binding */ filesize),
/* harmony export */   "partial": () => (/* binding */ partial)
/* harmony export */ });
/**
 * filesize
 *
 * @copyright 2023 Jason Mulligan <jason.mulligan@avoidwork.com>
 * @license BSD-3-Clause
 * @version 10.0.7
 */
const ARRAY = "array";
const BIT = "bit";
const BITS = "bits";
const BYTE = "byte";
const BYTES = "bytes";
const EMPTY = "";
const EXPONENT = "exponent";
const FUNCTION = "function";
const IEC = "iec";
const INVALID_NUMBER = "Invalid number";
const INVALID_ROUND = "Invalid rounding method";
const JEDEC = "jedec";
const OBJECT = "object";
const PERIOD = ".";
const ROUND = "round";
const S = "s";
const SI_KBIT = "kbit";
const SI_KBYTE = "kB";
const SPACE = " ";
const STRING = "string";
const ZERO = "0";
const STRINGS = {
	symbol: {
		iec: {
			bits: ["bit", "Kibit", "Mibit", "Gibit", "Tibit", "Pibit", "Eibit", "Zibit", "Yibit"],
			bytes: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
		},
		jedec: {
			bits: ["bit", "Kbit", "Mbit", "Gbit", "Tbit", "Pbit", "Ebit", "Zbit", "Ybit"],
			bytes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
		}
	},
	fullform: {
		iec: ["", "kibi", "mebi", "gibi", "tebi", "pebi", "exbi", "zebi", "yobi"],
		jedec: ["", "kilo", "mega", "giga", "tera", "peta", "exa", "zetta", "yotta"]
	}
};function filesize (arg, {
	bits = false,
	pad = false,
	base = -1,
	round = 2,
	locale = EMPTY,
	localeOptions = {},
	separator = EMPTY,
	spacer = SPACE,
	symbols = {},
	standard = EMPTY,
	output = STRING,
	fullform = false,
	fullforms = [],
	exponent = -1,
	roundingMethod = ROUND,
	precision = 0
} = {}) {
	let e = exponent,
		num = Number(arg),
		result = [],
		val = 0,
		u = EMPTY;

	// Sync base & standard
	if (base === -1 && standard.length === 0) {
		base = 10;
		standard = JEDEC;
	} else if (base === -1 && standard.length > 0) {
		standard = standard === IEC ? IEC : JEDEC;
		base = standard === IEC ? 2 : 10;
	} else {
		base = base === 2 ? 2 : 10;
		standard = base === 10 ? JEDEC : standard === JEDEC ? JEDEC : IEC;
	}

	const ceil = base === 10 ? 1000 : 1024,
		full = fullform === true,
		neg = num < 0,
		roundingFunc = Math[roundingMethod];

	if (typeof arg !== "bigint" && isNaN(arg)) {
		throw new TypeError(INVALID_NUMBER);
	}

	if (typeof roundingFunc !== FUNCTION) {
		throw new TypeError(INVALID_ROUND);
	}

	// Flipping a negative number to determine the size
	if (neg) {
		num = -num;
	}

	// Determining the exponent
	if (e === -1 || isNaN(e)) {
		e = Math.floor(Math.log(num) / Math.log(ceil));

		if (e < 0) {
			e = 0;
		}
	}

	// Exceeding supported length, time to reduce & multiply
	if (e > 8) {
		if (precision > 0) {
			precision += 8 - e;
		}

		e = 8;
	}

	if (output === EXPONENT) {
		return e;
	}

	// Zero is now a special case because bytes divide by 1
	if (num === 0) {
		result[0] = 0;
		u = result[1] = STRINGS.symbol[standard][bits ? BITS : BYTES][e];
	} else {
		val = num / (base === 2 ? Math.pow(2, e * 10) : Math.pow(1000, e));

		if (bits) {
			val = val * 8;

			if (val >= ceil && e < 8) {
				val = val / ceil;
				e++;
			}
		}

		const p = Math.pow(10, e > 0 ? round : 0);
		result[0] = roundingFunc(val * p) / p;

		if (result[0] === ceil && e < 8 && exponent === -1) {
			result[0] = 1;
			e++;
		}

		u = result[1] = base === 10 && e === 1 ? bits ? SI_KBIT : SI_KBYTE : STRINGS.symbol[standard][bits ? BITS : BYTES][e];
	}

	// Decorating a 'diff'
	if (neg) {
		result[0] = -result[0];
	}

	// Setting optional precision
	if (precision > 0) {
		result[0] = result[0].toPrecision(precision);
	}

	// Applying custom symbol
	result[1] = symbols[result[1]] || result[1];

	if (locale === true) {
		result[0] = result[0].toLocaleString();
	} else if (locale.length > 0) {
		result[0] = result[0].toLocaleString(locale, localeOptions);
	} else if (separator.length > 0) {
		result[0] = result[0].toString().replace(PERIOD, separator);
	}

	if (pad && Number.isInteger(result[0]) === false && round > 0) {
		const x = separator || PERIOD,
			tmp = result[0].toString().split(x),
			s = tmp[1] || EMPTY,
			l = s.length,
			n = round - l;

		result[0] = `${tmp[0]}${x}${s.padEnd(l + n, ZERO)}`;
	}

	if (full) {
		result[1] = fullforms[e] ? fullforms[e] : STRINGS.fullform[standard][e] + (bits ? BIT : BYTE) + (result[0] === 1 ? EMPTY : S);
	}

	// Returning Array, Object, or String (default)
	return output === ARRAY ? result : output === OBJECT ? {
		value: result[0],
		symbol: result[1],
		exponent: e,
		unit: u
	} : result.join(spacer);
}

// Partial application for functional programming
function partial ({
	bits = false,
	pad = false,
	base = -1,
	round = 2,
	locale = EMPTY,
	localeOptions = {},
	separator = EMPTY,
	spacer = SPACE,
	symbols = {},
	standard = EMPTY,
	output = STRING,
	fullform = false,
	fullforms = [],
	exponent = -1,
	roundingMethod = ROUND,
	precision = 0
} = {}) {
	return arg => filesize(arg, {
		bits,
		pad,
		base,
		round,
		locale,
		localeOptions,
		separator,
		spacer,
		symbols,
		standard,
		output,
		fullform,
		fullforms,
		exponent,
		roundingMethod,
		precision
	});
}

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = JSON.parse('{"name":"arseno","displayName":"Simple Web Create Using Framework","description":"This extension is used for those of you who want to create a website using a framework \\n from the PHP & JavaScript programming languages ​​which will make it easier for you in web development.","price":"free","version":"1.5.9","publisher":"MrShadow2511","license":"MIT","repository":{"type":"git","url":"https://github.com/Arseno11/Extention-VSCode.git"},"engines":{"vscode":"^1.77.0"},"categories":["Programming Languages","Education"],"activationEvents":[],"main":"./dist/extension.js","contributes":{"commands":[{"command":"arseno.WebAppCreate","title":"Web Create Using Framework PHP & JavaScript"}],"icon":{"path":"./icon/icon.png"}},"scripts":{"vscode:prepublish":"npm run package","compile":"webpack","watch":"webpack --watch","package":"webpack --mode production --devtool hidden-source-map","compile-tests":"tsc -p . --outDir out","watch-tests":"tsc -p . -w --outDir out","pretest":"npm run compile-tests && npm run compile && npm run lint","lint":"eslint src --ext ts","test":"node ./out/test/runTest.js"},"devDependencies":{"@types/cross-spawn":"^6.0.2","@types/glob":"^8.1.0","@types/mocha":"^10.0.1","@types/node":"^16.18.23","@types/vscode":"^1.77.0","@typescript-eslint/eslint-plugin":"^5.56.0","@typescript-eslint/parser":"^5.56.0","@vscode/test-electron":"^2.3.0","eslint":"^8.36.0","glob":"^8.1.0","mocha":"^10.2.0","ts-loader":"^9.4.2","typescript":"^4.9.5","webpack":"^5.76.3","webpack-cli":"^5.0.1"},"dependencies":{"filesize":"^10.0.7","semver":"^7.3.8"}}');

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
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
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
const filesize_1 = __webpack_require__(3);
const path = __webpack_require__(4);
const fs = __webpack_require__(5);
const extensionId = (__webpack_require__(6).name);
const EXTENSION_ID = `${extensionId}`;
const frameworkOptions = {
    php: [`Laravel`, `CodeIgniter`, `Symfony`],
    javascript: [`React`, `Vue`, `Angular`, `Next.js`]
};
const frameworkSizes = {
    laravel: 80 * 1024 * 1024,
    codeigniter: 70 * 1024 * 1024,
    symfony: 60 * 1024 * 1024,
    react: 50 * 1024 * 1024,
    vue: 40 * 1024 * 1024,
    angular: 30 * 1024 * 1024,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'next.js': 20 * 1024 * 1024,
};
function activate(context) {
    const extensionName = (__webpack_require__(6).name);
    console.log(`Congratulations, your extension "${extensionName}" is now active!`);
    // Create status bar item for loading animation
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    statusBarItem.text = "$(sync~spin) Creating Web App...";
    context.subscriptions.push(statusBarItem);
    let disposable = vscode.commands.registerCommand(`arseno.WebAppCreate`, async () => {
        console.log(`Command triggered`);
        // Show loading animation on status bar
        statusBarItem.show();
        const folderName = await vscode.window.showInputBox({
            prompt: `Please enter a folder name`,
            placeHolder: `MyWebApp`,
            validateInput: (value) => {
                if (!value) {
                    return 'Please enter a folder name';
                }
                else if (fs.existsSync(value)) {
                    return 'Folder already exists, please enter a different name';
                }
                else {
                    return null;
                }
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
                const projectName = await vscode.window.showInputBox({
                    prompt: `Please enter a project name`,
                    placeHolder: `MyProjectName`,
                    validateInput: (value) => {
                        if (!value) {
                            return 'Please enter a project name';
                        }
                        else {
                            return null;
                        }
                    },
                    ignoreFocusOut: true // prevent input box from closing on focus out
                });
                console.log(`Project name:`, projectName);
                if (!projectName) { // Check if projectName is empty or cancelled
                    vscode.window.showErrorMessage(`Do you want to exit?😢`);
                    const result = await vscode.window.showQuickPick(['Yes', 'No'], {
                        placeHolder: 'Do you want to exit?',
                    });
                    if (result === 'Yes') {
                        vscode.window.showInformationMessage(`See you again. 👋`);
                        statusBarItem.hide();
                        return;
                    }
                    else if (result === 'No') {
                        vscode.window.showInformationMessage(`Welcome Back. 🤗`);
                        return await vscode.commands.executeCommand('arseno.WebAppCreate');
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
                    // Mendapatkan path folder saat ini
                    const folderPath = path.resolve(__dirname);
                    // Mendapatkan drive letter dari folder saat ini
                    const rootPath = path.parse(folderPath).root;
                    const driveLetter = rootPath.slice(0, -1);
                    // Mendapatkan informasi ruang disk dari drive letter
                    const drivespace = fs.statSync(`${driveLetter}\\`);
                    const totalDisk = drivespace.blocks * drivespace.blksize;
                    const freeDisk = drivespace.blocks * drivespace.bfree;
                    console.log(`Sisa ruang disk di drive ${driveLetter}: ${freeDisk} bytes`);
                    if (!(frameworkSelection.toLowerCase() in frameworkSizes)) {
                        vscode.window.showErrorMessage(`Error: Framework ${frameworkSelection} is not supported!`);
                        return;
                    }
                    const frameworkSizeBytes = frameworkSizes[frameworkSelection.toLowerCase()];
                    const frameworkSizeReadable = (0, filesize_1.filesize)(frameworkSizeBytes);
                    if (freeDisk < frameworkSizeBytes) {
                        vscode.window.showErrorMessage(`Error: Not enough disk space to install ${frameworkSelection}. Required: ${frameworkSizeReadable}`);
                        return;
                    }
                    const terminal = vscode.window.createTerminal();
                    async function installFramework(command, frameworkName) {
                        if (fs.existsSync(folderName)) {
                            await vscode.window.showErrorMessage(`Error: Folder ${folderName} already exists!`);
                            return;
                        }
                        terminal.sendText(`mkdir ${folderName} && cd ${folderName}`);
                        try {
                            await vscode.window.withProgress({
                                location: vscode.ProgressLocation.Notification,
                                title: `Installing ${frameworkName}...`,
                                cancellable: false
                            }, async (progress) => {
                                let increment = 0;
                                const interval = setInterval(() => {
                                    increment += 10;
                                    if (increment > 60) {
                                        increment = 0;
                                    }
                                    progress.report({ increment });
                                }, 60);
                                await terminal.sendText(command);
                                clearInterval(interval);
                                progress.report({ increment: 100 });
                                setTimeout(() => {
                                    vscode.window.showInformationMessage(`${frameworkName} created successfully!`);
                                }, 2000); // tambahkan delay 1000 milidetik (1 detik) sebelum menampilkan pesan sukses
                            });
                        }
                        catch (err) {
                            vscode.window.showErrorMessage(`Error: ${err.message}`);
                        }
                    }
                    if (languageSelection.toLowerCase() === `php`) {
                        switch (frameworkSelection.toLowerCase()) {
                            case `laravel`:
                                await installFramework(`composer create-project --prefer-dist laravel/laravel ${projectName}`, `Laravel`);
                                break;
                            case `codeigniter`:
                                await installFramework(`composer create-project codeigniter4/appstarter ${projectName}`, `CodeIgniter`);
                                break;
                            case `symfony`:
                                await installFramework(`composer create-project symfony/website-skeleton ${projectName}`, `Symfony`);
                                break;
                        }
                    }
                    else if (languageSelection.toLowerCase() === `javascript`) {
                        switch (frameworkSelection.toLowerCase()) {
                            case `react`:
                                await installFramework(`npx create-react-app ${projectName}`, `React`);
                                break;
                            case `vue`:
                                await installFramework(`npm install -g @vue/cli && vue create ${projectName}`, `Vue`);
                                break;
                            case `angular`:
                                await installFramework(`npm install -g @angular/cli && ng new ${projectName}`, `Angular`);
                                break;
                            case 'next.js':
                                await installFramework(`npx create-next-app ${projectName}`, `next.js`);
                                break;
                        }
                    }
                    terminal.show();
                    break;
                }
                statusBarItem.hide();
            }
            try { }
            catch (err) {
                vscode.window.showErrorMessage(`Error: ${err.message}`);
            }
        }
        finally { }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map