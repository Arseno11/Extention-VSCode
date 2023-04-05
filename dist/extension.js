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
const fs = __webpack_require__(5);
function activate(context) {
    // Create status bar item for loading animation
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
    statusBarItem.text = "$(sync~spin) Creating Web App...";
    context.subscriptions.push(statusBarItem);
    let disposable = vscode.commands.registerCommand(`arseno.WebAppCreate`, async () => {
        /* eslint-disable */ console.log(...oo_oo(`2fc4106a_0`, `Command triggered`));
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
        /* eslint-disable */ console.log(...oo_oo(`2fc4106a_1`, `Folder name:`, folderName));
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
                /* eslint-disable */ console.log(...oo_oo(`2fc4106a_2`, `Language selection:`, languageSelection));
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
                /* eslint-disable */ console.log(...oo_oo(`2fc4106a_3`, `Framework selection:`, frameworkSelection));
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
                /* eslint-disable */ console.log(...oo_oo(`2fc4106a_4`, `Project name:`, projectName));
                if (!projectName) { // Check if projectName is empty or cancelled
                    vscode.window.showErrorMessage(`Do you want to exit?😢`);
                    const result = await vscode.window.showQuickPick(['Yes', 'No'], {
                        placeHolder: 'Do you want to exit?',
                    });
                    if (result === 'Yes') {
                        vscode.window.showInformationMessage(`You have exited the extension. 👋`);
                        statusBarItem.hide();
                        return;
                    }
                    else if (result === 'No') {
                        vscode.window.showInformationMessage(`Welcome Back. 🤗`);
                        return await vscode.commands.executeCommand('arseno.WebAppCreate');
                    }
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
                /* eslint-disable */ console.log(...oo_oo(`2fc4106a_5`, `Sisa ruang disk di drive ${driveLetter}: ${freeDisk} bytes`));
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
        catch (err) {
            vscode.window.showErrorMessage(`Error: ${err.message}`);
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
/* eslint-disable */ ;
function oo_cm() { try {
    return (0, eval)("globalThis._console_ninja") || (0, eval)("/* https://github.com/wallabyjs/console-ninja#how-does-it-work */'use strict';var _0x5de714=_0x42cc;(function(_0x180270,_0xc4b29d){var _0x66eabe=_0x42cc,_0x5dec07=_0x180270();while(!![]){try{var _0x3360a9=-parseInt(_0x66eabe(0x1f2))/0x1*(parseInt(_0x66eabe(0x213))/0x2)+-parseInt(_0x66eabe(0x229))/0x3*(parseInt(_0x66eabe(0x212))/0x4)+parseInt(_0x66eabe(0x21f))/0x5*(parseInt(_0x66eabe(0x1e9))/0x6)+parseInt(_0x66eabe(0x1c4))/0x7*(parseInt(_0x66eabe(0x29c))/0x8)+-parseInt(_0x66eabe(0x224))/0x9+-parseInt(_0x66eabe(0x1ca))/0xa*(-parseInt(_0x66eabe(0x20c))/0xb)+parseInt(_0x66eabe(0x264))/0xc*(-parseInt(_0x66eabe(0x1be))/0xd);if(_0x3360a9===_0xc4b29d)break;else _0x5dec07['push'](_0x5dec07['shift']());}catch(_0x4521e7){_0x5dec07['push'](_0x5dec07['shift']());}}}(_0x9795,0xe2a6c));var ue=Object[_0x5de714(0x1fd)],te=Object['defineProperty'],he=Object[_0x5de714(0x273)],le=Object[_0x5de714(0x21a)],fe=Object[_0x5de714(0x252)],_e=Object[_0x5de714(0x206)]['hasOwnProperty'],pe=(_0x3d77a6,_0x3fafff,_0x2fb998,_0x23619b)=>{var _0x14b9c0=_0x5de714;if(_0x3fafff&&typeof _0x3fafff==_0x14b9c0(0x1d0)||typeof _0x3fafff==_0x14b9c0(0x265)){for(let _0x8be15e of le(_0x3fafff))!_e[_0x14b9c0(0x1fa)](_0x3d77a6,_0x8be15e)&&_0x8be15e!==_0x2fb998&&te(_0x3d77a6,_0x8be15e,{'get':()=>_0x3fafff[_0x8be15e],'enumerable':!(_0x23619b=he(_0x3fafff,_0x8be15e))||_0x23619b[_0x14b9c0(0x28d)]});}return _0x3d77a6;},ne=(_0x5b8ac7,_0x55e256,_0x273199)=>(_0x273199=_0x5b8ac7!=null?ue(fe(_0x5b8ac7)):{},pe(_0x55e256||!_0x5b8ac7||!_0x5b8ac7[_0x5de714(0x245)]?te(_0x273199,_0x5de714(0x239),{'value':_0x5b8ac7,'enumerable':!0x0}):_0x273199,_0x5b8ac7)),Y=class{constructor(_0x18fd3e,_0x518dec,_0x4e07d2,_0x479ba0){var _0x4f8d85=_0x5de714;this[_0x4f8d85(0x200)]=_0x18fd3e,this[_0x4f8d85(0x1cb)]=_0x518dec,this[_0x4f8d85(0x233)]=_0x4e07d2,this[_0x4f8d85(0x22e)]=_0x479ba0,this['_allowedToSend']=!0x0,this[_0x4f8d85(0x1d6)]=!0x0,this[_0x4f8d85(0x2a5)]=!0x1,this[_0x4f8d85(0x2a3)]=[],this[_0x4f8d85(0x25a)]=!0x1,this[_0x4f8d85(0x230)]=!0x1,this[_0x4f8d85(0x24f)]=!!this[_0x4f8d85(0x200)]['WebSocket'],this['_WebSocketClass']=null,this['_connectAttemptCount']=0x0,this[_0x4f8d85(0x280)]=0x14,this[_0x4f8d85(0x28b)]=0x0,this[_0x4f8d85(0x203)]=0x3e8,this['_sendErrorMessage']=this[_0x4f8d85(0x24f)]?_0x4f8d85(0x247):_0x4f8d85(0x246);}async[_0x5de714(0x267)](){var _0x597c3b=_0x5de714;if(this[_0x597c3b(0x25b)])return this[_0x597c3b(0x25b)];let _0x662894;if(this[_0x597c3b(0x24f)])_0x662894=this['global'][_0x597c3b(0x1ff)];else{if(this[_0x597c3b(0x200)][_0x597c3b(0x27b)]?.[_0x597c3b(0x26c)])_0x662894=this[_0x597c3b(0x200)]['process']?.['_WebSocket'];else try{let _0x30682a=await import(_0x597c3b(0x288));_0x662894=(await import((await import(_0x597c3b(0x278)))[_0x597c3b(0x216)](_0x30682a[_0x597c3b(0x1d9)](this[_0x597c3b(0x22e)],_0x597c3b(0x1f0)))['toString']()))[_0x597c3b(0x239)];}catch{try{_0x662894=require(require(_0x597c3b(0x288))['join'](this[_0x597c3b(0x22e)],'ws'));}catch{throw new Error(_0x597c3b(0x24a));}}}return this['_WebSocketClass']=_0x662894,_0x662894;}[_0x5de714(0x1e5)](){var _0x16f586=_0x5de714;this[_0x16f586(0x230)]||this['_connected']||this['_connectAttemptCount']>=this[_0x16f586(0x280)]||(this[_0x16f586(0x1d6)]=!0x1,this[_0x16f586(0x230)]=!0x0,this[_0x16f586(0x1c6)]++,this['_ws']=new Promise((_0x40c381,_0x320656)=>{var _0x14fc2f=_0x16f586;this[_0x14fc2f(0x267)]()[_0x14fc2f(0x1fc)](_0x8517e1=>{var _0x13e29f=_0x14fc2f;let _0x1f8f3f=new _0x8517e1('ws://'+this[_0x13e29f(0x1cb)]+':'+this['port']);_0x1f8f3f[_0x13e29f(0x287)]=()=>{var _0x5d5175=_0x13e29f;this[_0x5d5175(0x294)]=!0x1,this[_0x5d5175(0x21b)](_0x1f8f3f),this[_0x5d5175(0x291)](),_0x320656(new Error(_0x5d5175(0x24c)));},_0x1f8f3f[_0x13e29f(0x202)]=()=>{var _0x3568f5=_0x13e29f;this['_inBrowser']||_0x1f8f3f['_socket']&&_0x1f8f3f[_0x3568f5(0x1ee)][_0x3568f5(0x243)]&&_0x1f8f3f['_socket'][_0x3568f5(0x243)](),_0x40c381(_0x1f8f3f);},_0x1f8f3f['onclose']=()=>{var _0x252d39=_0x13e29f;this[_0x252d39(0x1d6)]=!0x0,this[_0x252d39(0x21b)](_0x1f8f3f),this[_0x252d39(0x291)]();},_0x1f8f3f['onmessage']=_0x21795d=>{var _0x57ff28=_0x13e29f;try{_0x21795d&&_0x21795d[_0x57ff28(0x258)]&&this[_0x57ff28(0x24f)]&&JSON['parse'](_0x21795d['data'])[_0x57ff28(0x1dd)]===_0x57ff28(0x228)&&this[_0x57ff28(0x200)][_0x57ff28(0x295)][_0x57ff28(0x228)]();}catch{}};})['then'](_0x3c12aa=>(this[_0x14fc2f(0x25a)]=!0x0,this[_0x14fc2f(0x230)]=!0x1,this[_0x14fc2f(0x1d6)]=!0x1,this['_allowedToSend']=!0x0,this[_0x14fc2f(0x2a5)]=!0x1,this[_0x14fc2f(0x28b)]=0x0,this[_0x14fc2f(0x1c6)]=0x0,_0x3c12aa))['catch'](_0x1c8ccb=>(this[_0x14fc2f(0x25a)]=!0x1,this['_connecting']=!0x1,_0x320656(new Error('failed\\x20to\\x20connect\\x20to\\x20host:\\x20'+(_0x1c8ccb&&_0x1c8ccb['message'])))));}));}[_0x5de714(0x21b)](_0x1930a9){var _0x5b5707=_0x5de714;this[_0x5b5707(0x25a)]=!0x1,this[_0x5b5707(0x230)]=!0x1;try{_0x1930a9[_0x5b5707(0x27c)]=null,_0x1930a9[_0x5b5707(0x287)]=null,_0x1930a9['onopen']=null;}catch{}try{_0x1930a9['readyState']<0x2&&_0x1930a9[_0x5b5707(0x290)]();}catch{}}['_attemptToReconnectShortly'](){var _0x4e61b6=_0x5de714;clearTimeout(this[_0x4e61b6(0x1bd)]),!(this[_0x4e61b6(0x1c6)]>=this[_0x4e61b6(0x280)])&&(this['_reconnectTimeout']=setTimeout(()=>{var _0x1a507d=_0x4e61b6;this[_0x1a507d(0x25a)]||this['_connecting']||(this[_0x1a507d(0x1e5)](),this['_ws']?.[_0x1a507d(0x242)](()=>this[_0x1a507d(0x291)]()));},0x1f4),this[_0x4e61b6(0x1bd)][_0x4e61b6(0x243)]&&this[_0x4e61b6(0x1bd)][_0x4e61b6(0x243)]());}async[_0x5de714(0x2ab)](_0x2c672d){var _0x116643=_0x5de714;try{if(!this['_allowedToSend'])return;if(this[_0x116643(0x2a5)]){this[_0x116643(0x2a3)]['push'](_0x2c672d);return;}this[_0x116643(0x1d6)]&&this['_connectToHostNow'](),this['_activeConnectionMessageCount']++;let _0x30cbb4=this[_0x116643(0x28b)]>=this[_0x116643(0x203)];_0x30cbb4&&(this[_0x116643(0x2a5)]=!0x0);let _0x36711f=await this[_0x116643(0x23d)];_0x36711f['send'](JSON[_0x116643(0x23c)](_0x2c672d)),this['_connected']&&_0x30cbb4&&(this[_0x116643(0x1d6)]=!0x1,this[_0x116643(0x21b)](_0x36711f),this[_0x116643(0x1e5)](),this[_0x116643(0x23d)]?.[_0x116643(0x1fc)](()=>{var _0x1187ae=_0x116643;if(this[_0x1187ae(0x2a3)]['length']){let _0x3765da=this[_0x1187ae(0x2a3)][_0x1187ae(0x23f)](0x0,this['_maxActiveConnectionMessageCount']);for(let _0x1f7b28=0x0;_0x1f7b28<_0x3765da[_0x1187ae(0x223)];_0x1f7b28++)this[_0x1187ae(0x2ab)](_0x3765da[_0x1f7b28]);}}));}catch(_0x5cb730){console[_0x116643(0x298)](this[_0x116643(0x1d2)]+':\\x20'+(_0x5cb730&&_0x5cb730[_0x116643(0x1e2)])),this[_0x116643(0x294)]=!0x1,this['_attemptToReconnectShortly']();}}};function H(_0x3da308,_0x1146cf,_0x270692,_0x3671ea,_0x9ccb35){var _0x4931ef=_0x5de714;let _0x40102b=_0x270692[_0x4931ef(0x22f)](',')[_0x4931ef(0x27d)](_0x149096=>{var _0x24fbc6=_0x4931ef;try{_0x3da308[_0x24fbc6(0x2a4)]||((_0x9ccb35===_0x24fbc6(0x22b)||_0x9ccb35===_0x24fbc6(0x289))&&(_0x9ccb35+=_0x3da308[_0x24fbc6(0x27b)]?.[_0x24fbc6(0x1da)]?.[_0x24fbc6(0x1d7)]?_0x24fbc6(0x234):_0x24fbc6(0x256)),_0x3da308[_0x24fbc6(0x2a4)]={'id':+new Date(),'tool':_0x9ccb35});let _0x1105fb=new Y(_0x3da308,_0x1146cf,_0x149096,_0x3671ea);return _0x1105fb[_0x24fbc6(0x2ab)][_0x24fbc6(0x299)](_0x1105fb);}catch(_0x1fa6a2){return console['warn'](_0x24fbc6(0x1f7),_0x1fa6a2&&_0x1fa6a2['message']),()=>{};}});return _0x435322=>_0x40102b[_0x4931ef(0x1dc)](_0x5d5cf0=>_0x5d5cf0(_0x435322));}function _0x42cc(_0x43dc8c,_0xd8c54a){var _0x97950c=_0x9795();return _0x42cc=function(_0x42cc4c,_0x525b47){_0x42cc4c=_0x42cc4c-0x1bd;var _0x101f60=_0x97950c[_0x42cc4c];return _0x101f60;},_0x42cc(_0x43dc8c,_0xd8c54a);}function _0x9795(){var _0x259951=['_setNodeId','_connectAttemptCount','level','_hasSetOnItsPath','_propertyName','508090RDjWmO','host','getOwnPropertySymbols',':logPointId:','sort','substr','object','disabledTrace','_sendErrorMessage','array','_cleanNode','_addObjectProperty','_allowedToConnectOnSend','node','nan','join','versions','Error','forEach','method','cappedElements','_isArray','stackTraceLimit','test','message','_propertyAccessor','hostname','_connectToHostNow','timeStamp','sortProps','totalStrLength','6xnYElZ','perf_hooks','Set','127.0.0.1','[object\\x20Array]','_socket','bigint','ws/index.js','autoExpand','218413XFHlCj','_isPrimitiveType','_setNodePermissions','hrtime','resolveGetters','logger\\x20failed\\x20to\\x20connect\\x20to\\x20host','match','rootExpression','call','_getOwnPropertySymbols','then','create','String','WebSocket','global','trace','onopen','_maxActiveConnectionMessageCount','_property','negativeZero','prototype','_isPrimitiveWrapperType','_consoleNinjaAllowedToStart','_console_ninja','_treeNodePropertiesBeforeFullValue','autoExpandMaxDepth','132TPNDJV','cappedProps','_addProperty','_addFunctionsNode','argumentResolutionError','[object\\x20Map]','206208KJHuuW','6sVhwgo','_capIfString','_hasMapOnItsPath','pathToFileURL','toString','setter','_HTMLAllCollection','getOwnPropertyNames','_disposeWebsocket','symbol','props','console','7535100KnWmbp','Boolean','autoExpandPropertyCount','NEGATIVE_INFINITY','length','6988032WFkdSq','expressionsToEvaluate','capped','root_exp','reload','27FFjZiz','undefined','next.js','_processTreeNodeResult','number','nodeModules','split','_connecting','_isUndefined','autoExpandPreviousObjects','port','\\x20server','_setNodeExpandableState','POSITIVE_INFINITY','HTMLAllCollection','disabledLog','default','replace','unshift','stringify','_ws','funcName','splice','_undefined','current','catch','unref','_isSet','__es'+'Module','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20restarting\\x20the\\x20process\\x20may\\x20help','Console\\x20Ninja\\x20failed\\x20to\\x20send\\x20logs,\\x20refreshing\\x20the\\x20page\\x20may\\x20help','time',[\"localhost\",\"127.0.0.1\",\"example.cypress.io\",\"Arseno\",\"192.168.100.48\"],'failed\\x20to\\x20find\\x20and\\x20load\\x20WebSocket','_dateToString','logger\\x20websocket\\x20error','_addLoadNode','now','_inBrowser',\"c:\\\\Users\\\\Arseno\\\\.vscode\\\\extensions\\\\wallabyjs.console-ninja-0.0.105\\\\node_modules\",'string','getPrototypeOf','boolean','constructor','RegExp','\\x20browser','strLength','data','_p_length','_connected','_WebSocketClass','root_exp_id','parent','Map','valueOf','toLowerCase','elements','log','type','12hBGDay','function','expId','getWebSocketClass','_getOwnPropertyDescriptor','value','serialize','_setNodeExpressionPath','_WebSocket','_hasSymbolPropertyOnItsPath','index','reduceLimits','date','allStrLength','[object\\x20Set]','getOwnPropertyDescriptor','_numberRegExp','_getOwnPropertyNames','_treeNodePropertiesAfterFullValue','_objectToString','url','null','_blacklistedProperty','process','onclose','map','slice','1.0.0','_maxConnectAttemptCount','nuxt','getter','get','negativeInfinity','53582','_additionalMetadata','onerror','path','remix','name','_activeConnectionMessageCount','error','enumerable','isArray','count','close','_attemptToReconnectShortly','_isNegativeZero','hits','_allowedToSend','location','push','timeEnd','warn','bind','webpack','concat','16CIbXwK','_setNodeLabel','_setNodeQueryPath','autoExpandLimit','_type','unknown','1680668158995','_messageQueue','_console_ninja_session','_delayMessageSending','performance','_Symbol','Buffer','noFunctions','isExpressionToEvaluate','send','_sortProps','_reconnectTimeout','9780199oSddQO','_p_','Number','_isMap','','depth','5108649RqPOxL'];_0x9795=function(){return _0x259951;};return _0x9795();}function V(_0x245436){var _0x36cecd=_0x5de714;let _0x423a3f=function(_0x3960e5,_0x51eebb){return _0x51eebb-_0x3960e5;},_0x1dab56;if(_0x245436['performance'])_0x1dab56=function(){var _0x325c88=_0x42cc;return _0x245436[_0x325c88(0x2a6)][_0x325c88(0x24e)]();};else{if(_0x245436['process']&&_0x245436[_0x36cecd(0x27b)][_0x36cecd(0x1f5)])_0x1dab56=function(){var _0x1b3482=_0x36cecd;return _0x245436['process'][_0x1b3482(0x1f5)]();},_0x423a3f=function(_0xc6cce5,_0x2692bc){return 0x3e8*(_0x2692bc[0x0]-_0xc6cce5[0x0])+(_0x2692bc[0x1]-_0xc6cce5[0x1])/0xf4240;};else try{let {performance:_0x71a494}=require(_0x36cecd(0x1ea));_0x1dab56=function(){return _0x71a494['now']();};}catch{_0x1dab56=function(){return+new Date();};}}return{'elapsed':_0x423a3f,'timeStamp':_0x1dab56,'now':()=>Date['now']()};}function X(_0x4b0400,_0x2e93f8,_0x3588e6){var _0x45de05=_0x5de714;if(_0x4b0400[_0x45de05(0x208)]!==void 0x0)return _0x4b0400[_0x45de05(0x208)];let _0x146248=_0x4b0400[_0x45de05(0x27b)]?.[_0x45de05(0x1da)]?.[_0x45de05(0x1d7)];return _0x146248&&_0x3588e6===_0x45de05(0x281)?_0x4b0400[_0x45de05(0x208)]=!0x1:_0x4b0400['_consoleNinjaAllowedToStart']=_0x146248||!_0x2e93f8||_0x4b0400['location']?.[_0x45de05(0x1e4)]&&_0x2e93f8['includes'](_0x4b0400[_0x45de05(0x295)][_0x45de05(0x1e4)]),_0x4b0400[_0x45de05(0x208)];}((_0x1ab2a5,_0x905ac1,_0x45cfda,_0x1f5c29,_0x1a4e0a,_0x3f1e88,_0x285731,_0x3ccbb0,_0x3a2bd6)=>{var _0x3886ef=_0x5de714;if(_0x1ab2a5[_0x3886ef(0x209)])return _0x1ab2a5['_console_ninja'];if(!X(_0x1ab2a5,_0x3ccbb0,_0x1a4e0a))return _0x1ab2a5[_0x3886ef(0x209)]={'consoleLog':()=>{},'consoleTrace':()=>{},'consoleTime':()=>{},'consoleTimeEnd':()=>{},'autoLog':()=>{},'autoTrace':()=>{},'autoTime':()=>{},'autoTimeEnd':()=>{}},_0x1ab2a5[_0x3886ef(0x209)];let _0x51f37f={'props':0x64,'elements':0x64,'strLength':0x400*0x32,'totalStrLength':0x400*0x32,'autoExpandLimit':0x1388,'autoExpandMaxDepth':0xa},_0x4eb728={'props':0x5,'elements':0x5,'strLength':0x100,'totalStrLength':0x100*0x3,'autoExpandLimit':0x1e,'autoExpandMaxDepth':0x2},_0x52e007=V(_0x1ab2a5),_0x12c66b=_0x52e007['elapsed'],_0x35a29b=_0x52e007[_0x3886ef(0x1e6)],_0x5b9bc6=_0x52e007[_0x3886ef(0x24e)],_0x53d25f={'hits':{},'ts':{}},_0x162599=_0x2f70b0=>{_0x53d25f['ts'][_0x2f70b0]=_0x35a29b();},_0x13d6a0=(_0x29181d,_0xbe3ae3)=>{var _0x4e399a=_0x3886ef;let _0x35b1ec=_0x53d25f['ts'][_0xbe3ae3];if(delete _0x53d25f['ts'][_0xbe3ae3],_0x35b1ec){let _0x428e73=_0x12c66b(_0x35b1ec,_0x35a29b());_0x33781f(_0x43a9f0(_0x4e399a(0x248),_0x29181d,_0x5b9bc6(),_0x2838ea,[_0x428e73],_0xbe3ae3));}},_0x5079ba=_0x1fbb28=>_0x392e17=>{var _0x3cadd4=_0x3886ef;try{_0x162599(_0x392e17),_0x1fbb28(_0x392e17);}finally{_0x1ab2a5['console'][_0x3cadd4(0x248)]=_0x1fbb28;}},_0x5958b0=_0x53d691=>_0x790be5=>{var _0x233a84=_0x3886ef;try{let [_0x5b58c8,_0x7853ce]=_0x790be5['split'](_0x233a84(0x1cd));_0x13d6a0(_0x7853ce,_0x5b58c8),_0x53d691(_0x5b58c8);}finally{_0x1ab2a5['console'][_0x233a84(0x297)]=_0x53d691;}};_0x1ab2a5[_0x3886ef(0x209)]={'consoleLog':(_0x8a1393,_0xb93335)=>{var _0x33b8d8=_0x3886ef;_0x1ab2a5[_0x33b8d8(0x21e)][_0x33b8d8(0x262)][_0x33b8d8(0x28a)]!==_0x33b8d8(0x238)&&_0x33781f(_0x43a9f0('log',_0x8a1393,_0x5b9bc6(),_0x2838ea,_0xb93335));},'consoleTrace':(_0x10a26c,_0x5d7d45)=>{var _0xea2a42=_0x3886ef;_0x1ab2a5['console']['log'][_0xea2a42(0x28a)]!==_0xea2a42(0x1d1)&&_0x33781f(_0x43a9f0('trace',_0x10a26c,_0x5b9bc6(),_0x2838ea,_0x5d7d45));},'consoleTime':()=>{var _0x321955=_0x3886ef;_0x1ab2a5['console'][_0x321955(0x248)]=_0x5079ba(_0x1ab2a5['console']['time']);},'consoleTimeEnd':()=>{var _0x6572da=_0x3886ef;_0x1ab2a5[_0x6572da(0x21e)][_0x6572da(0x297)]=_0x5958b0(_0x1ab2a5['console'][_0x6572da(0x297)]);},'autoLog':(_0x30376f,_0x563a88)=>{var _0x2e7b32=_0x3886ef;_0x33781f(_0x43a9f0(_0x2e7b32(0x262),_0x563a88,_0x5b9bc6(),_0x2838ea,[_0x30376f]));},'autoTrace':(_0x3c1318,_0x159e6b)=>{var _0x2a960c=_0x3886ef;_0x33781f(_0x43a9f0(_0x2a960c(0x201),_0x159e6b,_0x5b9bc6(),_0x2838ea,[_0x3c1318]));},'autoTime':(_0x436d6b,_0x3a2dd5,_0x3440d6)=>{_0x162599(_0x3440d6);},'autoTimeEnd':(_0x597aea,_0x6c2f56,_0x42ca63)=>{_0x13d6a0(_0x6c2f56,_0x42ca63);}};let _0x33781f=H(_0x1ab2a5,_0x905ac1,_0x45cfda,_0x1f5c29,_0x1a4e0a),_0x2838ea=_0x1ab2a5[_0x3886ef(0x2a4)];class _0xd341c9{constructor(){var _0x2a5973=_0x3886ef;this['_keyStrRegExp']=/^(?!(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$)[_$a-zA-Z\\xA0-\\uFFFF][_$a-zA-Z0-9\\xA0-\\uFFFF]*$/,this[_0x2a5973(0x274)]=/^(0|[1-9][0-9]*)$/,this['_quotedRegExp']=/'([^\\\\']|\\\\')*'/,this['_undefined']=_0x1ab2a5[_0x2a5973(0x22a)],this[_0x2a5973(0x219)]=_0x1ab2a5[_0x2a5973(0x237)],this['_getOwnPropertyDescriptor']=Object['getOwnPropertyDescriptor'],this[_0x2a5973(0x275)]=Object[_0x2a5973(0x21a)],this[_0x2a5973(0x2a7)]=_0x1ab2a5['Symbol'],this['_regExpToString']=RegExp[_0x2a5973(0x206)][_0x2a5973(0x217)],this[_0x2a5973(0x24b)]=Date[_0x2a5973(0x206)][_0x2a5973(0x217)];}['serialize'](_0x508f92,_0x34d892,_0x3e6ab1,_0x1bb4b6){var _0x1d2745=_0x3886ef,_0x4742bb=this,_0x558fc0=_0x3e6ab1[_0x1d2745(0x1f1)];function _0x2aa47f(_0x318f0f,_0x3579de,_0x2bee4e){var _0x2a46f9=_0x1d2745;_0x3579de['type']='unknown',_0x3579de[_0x2a46f9(0x28c)]=_0x318f0f[_0x2a46f9(0x1e2)],_0x71c6b8=_0x2bee4e['node'][_0x2a46f9(0x241)],_0x2bee4e[_0x2a46f9(0x1d7)][_0x2a46f9(0x241)]=_0x3579de,_0x4742bb[_0x2a46f9(0x20a)](_0x3579de,_0x2bee4e);}if(_0x34d892&&_0x34d892[_0x1d2745(0x210)])_0x2aa47f(_0x34d892,_0x508f92,_0x3e6ab1);else try{_0x3e6ab1[_0x1d2745(0x1c7)]++,_0x3e6ab1[_0x1d2745(0x1f1)]&&_0x3e6ab1[_0x1d2745(0x232)][_0x1d2745(0x296)](_0x34d892);var _0x2f00a1,_0x10519c,_0x4c0492,_0x287649,_0x258f16=[],_0xeb821=[],_0x21e706,_0x215595=this[_0x1d2745(0x2a0)](_0x34d892),_0x308083=_0x215595===_0x1d2745(0x1d3),_0x459343=!0x1,_0x2b3f6c=_0x215595===_0x1d2745(0x265),_0x4e7f30=this[_0x1d2745(0x1f3)](_0x215595),_0x1c15f7=this[_0x1d2745(0x207)](_0x215595),_0x317754=_0x4e7f30||_0x1c15f7,_0x2a79f7={},_0x10cd2e=0x0,_0x278456=!0x1,_0x71c6b8,_0xb68ab=/^(([1-9]{1}[0-9]*)|0)$/;if(_0x3e6ab1[_0x1d2745(0x1c3)]){if(_0x308083){if(_0x10519c=_0x34d892[_0x1d2745(0x223)],_0x10519c>_0x3e6ab1['elements']){for(_0x4c0492=0x0,_0x287649=_0x3e6ab1[_0x1d2745(0x261)],_0x2f00a1=_0x4c0492;_0x2f00a1<_0x287649;_0x2f00a1++)_0xeb821['push'](_0x4742bb[_0x1d2745(0x20e)](_0x258f16,_0x34d892,_0x215595,_0x2f00a1,_0x3e6ab1));_0x508f92[_0x1d2745(0x1de)]=!0x0;}else{for(_0x4c0492=0x0,_0x287649=_0x10519c,_0x2f00a1=_0x4c0492;_0x2f00a1<_0x287649;_0x2f00a1++)_0xeb821['push'](_0x4742bb[_0x1d2745(0x20e)](_0x258f16,_0x34d892,_0x215595,_0x2f00a1,_0x3e6ab1));}_0x3e6ab1[_0x1d2745(0x221)]+=_0xeb821['length'];}if(!(_0x215595===_0x1d2745(0x279)||_0x215595===_0x1d2745(0x22a))&&!_0x4e7f30&&_0x215595!==_0x1d2745(0x1fe)&&_0x215595!==_0x1d2745(0x2a8)&&_0x215595!==_0x1d2745(0x1ef)){var _0x53231c=_0x1bb4b6[_0x1d2745(0x21d)]||_0x3e6ab1['props'];if(this[_0x1d2745(0x244)](_0x34d892)?(_0x2f00a1=0x0,_0x34d892[_0x1d2745(0x1dc)](function(_0x466396){var _0x272f44=_0x1d2745;if(_0x10cd2e++,_0x3e6ab1[_0x272f44(0x221)]++,_0x10cd2e>_0x53231c){_0x278456=!0x0;return;}if(!_0x3e6ab1['isExpressionToEvaluate']&&_0x3e6ab1[_0x272f44(0x1f1)]&&_0x3e6ab1['autoExpandPropertyCount']>_0x3e6ab1[_0x272f44(0x29f)]){_0x278456=!0x0;return;}_0xeb821[_0x272f44(0x296)](_0x4742bb[_0x272f44(0x20e)](_0x258f16,_0x34d892,_0x272f44(0x1eb),_0x2f00a1++,_0x3e6ab1,function(_0x281495){return function(){return _0x281495;};}(_0x466396)));})):this['_isMap'](_0x34d892)&&_0x34d892[_0x1d2745(0x1dc)](function(_0x4b9c7a,_0x3e2a7f){var _0x2ba566=_0x1d2745;if(_0x10cd2e++,_0x3e6ab1[_0x2ba566(0x221)]++,_0x10cd2e>_0x53231c){_0x278456=!0x0;return;}if(!_0x3e6ab1[_0x2ba566(0x2aa)]&&_0x3e6ab1[_0x2ba566(0x1f1)]&&_0x3e6ab1['autoExpandPropertyCount']>_0x3e6ab1[_0x2ba566(0x29f)]){_0x278456=!0x0;return;}var _0x330f00=_0x3e2a7f['toString']();_0x330f00[_0x2ba566(0x223)]>0x64&&(_0x330f00=_0x330f00[_0x2ba566(0x27e)](0x0,0x64)+'...'),_0xeb821[_0x2ba566(0x296)](_0x4742bb[_0x2ba566(0x20e)](_0x258f16,_0x34d892,_0x2ba566(0x25e),_0x330f00,_0x3e6ab1,function(_0x34b0a1){return function(){return _0x34b0a1;};}(_0x4b9c7a)));}),!_0x459343){try{for(_0x21e706 in _0x34d892)if(!(_0x308083&&_0xb68ab[_0x1d2745(0x1e1)](_0x21e706))&&!this[_0x1d2745(0x27a)](_0x34d892,_0x21e706,_0x3e6ab1)){if(_0x10cd2e++,_0x3e6ab1[_0x1d2745(0x221)]++,_0x10cd2e>_0x53231c){_0x278456=!0x0;break;}if(!_0x3e6ab1[_0x1d2745(0x2aa)]&&_0x3e6ab1[_0x1d2745(0x1f1)]&&_0x3e6ab1[_0x1d2745(0x221)]>_0x3e6ab1['autoExpandLimit']){_0x278456=!0x0;break;}_0xeb821[_0x1d2745(0x296)](_0x4742bb[_0x1d2745(0x1d5)](_0x258f16,_0x2a79f7,_0x34d892,_0x215595,_0x21e706,_0x3e6ab1));}}catch{}if(_0x2a79f7[_0x1d2745(0x259)]=!0x0,_0x2b3f6c&&(_0x2a79f7['_p_name']=!0x0),!_0x278456){var _0x149348=[][_0x1d2745(0x29b)](this[_0x1d2745(0x275)](_0x34d892))[_0x1d2745(0x29b)](this[_0x1d2745(0x1fb)](_0x34d892));for(_0x2f00a1=0x0,_0x10519c=_0x149348['length'];_0x2f00a1<_0x10519c;_0x2f00a1++)if(_0x21e706=_0x149348[_0x2f00a1],!(_0x308083&&_0xb68ab[_0x1d2745(0x1e1)](_0x21e706[_0x1d2745(0x217)]()))&&!this[_0x1d2745(0x27a)](_0x34d892,_0x21e706,_0x3e6ab1)&&!_0x2a79f7[_0x1d2745(0x1bf)+_0x21e706[_0x1d2745(0x217)]()]){if(_0x10cd2e++,_0x3e6ab1[_0x1d2745(0x221)]++,_0x10cd2e>_0x53231c){_0x278456=!0x0;break;}if(!_0x3e6ab1[_0x1d2745(0x2aa)]&&_0x3e6ab1['autoExpand']&&_0x3e6ab1[_0x1d2745(0x221)]>_0x3e6ab1['autoExpandLimit']){_0x278456=!0x0;break;}_0xeb821[_0x1d2745(0x296)](_0x4742bb[_0x1d2745(0x1d5)](_0x258f16,_0x2a79f7,_0x34d892,_0x215595,_0x21e706,_0x3e6ab1));}}}}}if(_0x508f92[_0x1d2745(0x263)]=_0x215595,_0x317754?(_0x508f92[_0x1d2745(0x269)]=_0x34d892['valueOf'](),this[_0x1d2745(0x214)](_0x215595,_0x508f92,_0x3e6ab1,_0x1bb4b6)):_0x215595===_0x1d2745(0x270)?_0x508f92[_0x1d2745(0x269)]=this['_dateToString']['call'](_0x34d892):_0x215595===_0x1d2745(0x255)?_0x508f92[_0x1d2745(0x269)]=this['_regExpToString'][_0x1d2745(0x1fa)](_0x34d892):_0x215595==='symbol'&&this[_0x1d2745(0x2a7)]?_0x508f92[_0x1d2745(0x269)]=this[_0x1d2745(0x2a7)]['prototype'][_0x1d2745(0x217)][_0x1d2745(0x1fa)](_0x34d892):!_0x3e6ab1[_0x1d2745(0x1c3)]&&!(_0x215595===_0x1d2745(0x279)||_0x215595==='undefined')&&(delete _0x508f92[_0x1d2745(0x269)],_0x508f92['capped']=!0x0),_0x278456&&(_0x508f92[_0x1d2745(0x20d)]=!0x0),_0x71c6b8=_0x3e6ab1['node'][_0x1d2745(0x241)],_0x3e6ab1[_0x1d2745(0x1d7)]['current']=_0x508f92,this[_0x1d2745(0x20a)](_0x508f92,_0x3e6ab1),_0xeb821['length']){for(_0x2f00a1=0x0,_0x10519c=_0xeb821[_0x1d2745(0x223)];_0x2f00a1<_0x10519c;_0x2f00a1++)_0xeb821[_0x2f00a1](_0x2f00a1);}_0x258f16[_0x1d2745(0x223)]&&(_0x508f92[_0x1d2745(0x21d)]=_0x258f16);}catch(_0xa41b8f){_0x2aa47f(_0xa41b8f,_0x508f92,_0x3e6ab1);}return this[_0x1d2745(0x286)](_0x34d892,_0x508f92),this['_treeNodePropertiesAfterFullValue'](_0x508f92,_0x3e6ab1),_0x3e6ab1[_0x1d2745(0x1d7)]['current']=_0x71c6b8,_0x3e6ab1[_0x1d2745(0x1c7)]--,_0x3e6ab1[_0x1d2745(0x1f1)]=_0x558fc0,_0x3e6ab1[_0x1d2745(0x1f1)]&&_0x3e6ab1[_0x1d2745(0x232)]['pop'](),_0x508f92;}[_0x3886ef(0x1fb)](_0x14e060){var _0x4035db=_0x3886ef;return Object[_0x4035db(0x1cc)]?Object[_0x4035db(0x1cc)](_0x14e060):[];}[_0x3886ef(0x244)](_0x1bf695){var _0x3cacb0=_0x3886ef;return!!(_0x1bf695&&_0x1ab2a5['Set']&&this[_0x3cacb0(0x277)](_0x1bf695)===_0x3cacb0(0x272)&&_0x1bf695[_0x3cacb0(0x1dc)]);}[_0x3886ef(0x27a)](_0x5e4c57,_0x54215a,_0x369538){var _0x2d3f23=_0x3886ef;return _0x369538[_0x2d3f23(0x2a9)]?typeof _0x5e4c57[_0x54215a]=='function':!0x1;}['_type'](_0x355a67){var _0x3a5d19=_0x3886ef,_0x51148d='';return _0x51148d=typeof _0x355a67,_0x51148d===_0x3a5d19(0x1d0)?this[_0x3a5d19(0x277)](_0x355a67)===_0x3a5d19(0x1ed)?_0x51148d=_0x3a5d19(0x1d3):this['_objectToString'](_0x355a67)==='[object\\x20Date]'?_0x51148d=_0x3a5d19(0x270):_0x355a67===null?_0x51148d=_0x3a5d19(0x279):_0x355a67[_0x3a5d19(0x254)]&&(_0x51148d=_0x355a67[_0x3a5d19(0x254)]['name']||_0x51148d):_0x51148d===_0x3a5d19(0x22a)&&this[_0x3a5d19(0x219)]&&_0x355a67 instanceof this[_0x3a5d19(0x219)]&&(_0x51148d=_0x3a5d19(0x237)),_0x51148d;}['_objectToString'](_0x20cba4){var _0x1747e8=_0x3886ef;return Object[_0x1747e8(0x206)][_0x1747e8(0x217)][_0x1747e8(0x1fa)](_0x20cba4);}['_isPrimitiveType'](_0x2ab52d){var _0x3613f9=_0x3886ef;return _0x2ab52d===_0x3613f9(0x253)||_0x2ab52d==='string'||_0x2ab52d===_0x3613f9(0x22d);}['_isPrimitiveWrapperType'](_0x197476){var _0x185da3=_0x3886ef;return _0x197476===_0x185da3(0x220)||_0x197476==='String'||_0x197476===_0x185da3(0x1c0);}[_0x3886ef(0x20e)](_0x144cf2,_0x474c33,_0x3d4c2f,_0x34432a,_0x574152,_0x790d4b){var _0x2c09b5=this;return function(_0x7fc04c){var _0x5de0f4=_0x42cc,_0x1f7f5d=_0x574152['node'][_0x5de0f4(0x241)],_0x2fa9cb=_0x574152[_0x5de0f4(0x1d7)]['index'],_0x623410=_0x574152[_0x5de0f4(0x1d7)][_0x5de0f4(0x25d)];_0x574152['node'][_0x5de0f4(0x25d)]=_0x1f7f5d,_0x574152['node']['index']=typeof _0x34432a=='number'?_0x34432a:_0x7fc04c,_0x144cf2[_0x5de0f4(0x296)](_0x2c09b5[_0x5de0f4(0x204)](_0x474c33,_0x3d4c2f,_0x34432a,_0x574152,_0x790d4b)),_0x574152[_0x5de0f4(0x1d7)][_0x5de0f4(0x25d)]=_0x623410,_0x574152[_0x5de0f4(0x1d7)][_0x5de0f4(0x26e)]=_0x2fa9cb;};}[_0x3886ef(0x1d5)](_0x2134e6,_0x3a0630,_0x386992,_0x52b31e,_0x179028,_0x2a93f5,_0x2ed162){var _0x24cf63=_0x3886ef,_0x3648b8=this;return _0x3a0630[_0x24cf63(0x1bf)+_0x179028[_0x24cf63(0x217)]()]=!0x0,function(_0x324ca9){var _0x6b12d7=_0x24cf63,_0x20270e=_0x2a93f5[_0x6b12d7(0x1d7)][_0x6b12d7(0x241)],_0x4ee8db=_0x2a93f5['node']['index'],_0x70af0f=_0x2a93f5[_0x6b12d7(0x1d7)]['parent'];_0x2a93f5['node'][_0x6b12d7(0x25d)]=_0x20270e,_0x2a93f5[_0x6b12d7(0x1d7)][_0x6b12d7(0x26e)]=_0x324ca9,_0x2134e6[_0x6b12d7(0x296)](_0x3648b8['_property'](_0x386992,_0x52b31e,_0x179028,_0x2a93f5,_0x2ed162)),_0x2a93f5[_0x6b12d7(0x1d7)]['parent']=_0x70af0f,_0x2a93f5[_0x6b12d7(0x1d7)]['index']=_0x4ee8db;};}[_0x3886ef(0x204)](_0x1a30be,_0x5919b7,_0x5a37c9,_0x567f3d,_0x5a4bd0){var _0x503327=_0x3886ef,_0x37f4d5=this;_0x5a4bd0||(_0x5a4bd0=function(_0x229421,_0x463f5e){return _0x229421[_0x463f5e];});var _0x3537b0=_0x5a37c9[_0x503327(0x217)](),_0x29cf27=_0x567f3d[_0x503327(0x225)]||{},_0x472d8f=_0x567f3d[_0x503327(0x1c3)],_0x50541f=_0x567f3d[_0x503327(0x2aa)];try{var _0x5cc006=this[_0x503327(0x1c1)](_0x1a30be),_0x378648=_0x3537b0;_0x5cc006&&_0x378648[0x0]==='\\x27'&&(_0x378648=_0x378648[_0x503327(0x1cf)](0x1,_0x378648[_0x503327(0x223)]-0x2));var _0x26d081=_0x567f3d['expressionsToEvaluate']=_0x29cf27[_0x503327(0x1bf)+_0x378648];_0x26d081&&(_0x567f3d[_0x503327(0x1c3)]=_0x567f3d[_0x503327(0x1c3)]+0x1),_0x567f3d[_0x503327(0x2aa)]=!!_0x26d081;var _0x4f7956=typeof _0x5a37c9==_0x503327(0x21c),_0x461cb9={'name':_0x4f7956||_0x5cc006?_0x3537b0:this[_0x503327(0x1c9)](_0x3537b0)};if(_0x4f7956&&(_0x461cb9['symbol']=!0x0),!(_0x5919b7==='array'||_0x5919b7===_0x503327(0x1db))){var _0x8d1d88=this[_0x503327(0x268)](_0x1a30be,_0x5a37c9);if(_0x8d1d88&&(_0x8d1d88['set']&&(_0x461cb9[_0x503327(0x218)]=!0x0),_0x8d1d88[_0x503327(0x283)]&&!_0x26d081&&!_0x567f3d['resolveGetters']))return _0x461cb9[_0x503327(0x282)]=!0x0,this[_0x503327(0x22c)](_0x461cb9,_0x567f3d),_0x461cb9;}var _0x1e465f;try{_0x1e465f=_0x5a4bd0(_0x1a30be,_0x5a37c9);}catch(_0x58984f){return _0x461cb9={'name':_0x3537b0,'type':_0x503327(0x2a1),'error':_0x58984f['message']},this[_0x503327(0x22c)](_0x461cb9,_0x567f3d),_0x461cb9;}var _0x2ed1a8=this[_0x503327(0x2a0)](_0x1e465f),_0x41eb66=this[_0x503327(0x1f3)](_0x2ed1a8);if(_0x461cb9[_0x503327(0x263)]=_0x2ed1a8,_0x41eb66)this[_0x503327(0x22c)](_0x461cb9,_0x567f3d,_0x1e465f,function(){var _0x248b73=_0x503327;_0x461cb9['value']=_0x1e465f[_0x248b73(0x25f)](),!_0x26d081&&_0x37f4d5[_0x248b73(0x214)](_0x2ed1a8,_0x461cb9,_0x567f3d,{});});else{var _0x32e415=_0x567f3d['autoExpand']&&_0x567f3d['level']<_0x567f3d[_0x503327(0x20b)]&&_0x567f3d[_0x503327(0x232)]['indexOf'](_0x1e465f)<0x0&&_0x2ed1a8!=='function'&&_0x567f3d[_0x503327(0x221)]<_0x567f3d[_0x503327(0x29f)];_0x32e415||_0x567f3d[_0x503327(0x1c7)]<_0x472d8f||_0x26d081?(this[_0x503327(0x26a)](_0x461cb9,_0x1e465f,_0x567f3d,_0x26d081||{}),this[_0x503327(0x286)](_0x1e465f,_0x461cb9)):this[_0x503327(0x22c)](_0x461cb9,_0x567f3d,_0x1e465f,function(){var _0x1c126e=_0x503327;_0x2ed1a8===_0x1c126e(0x279)||_0x2ed1a8===_0x1c126e(0x22a)||(delete _0x461cb9[_0x1c126e(0x269)],_0x461cb9[_0x1c126e(0x226)]=!0x0);});}return _0x461cb9;}finally{_0x567f3d[_0x503327(0x225)]=_0x29cf27,_0x567f3d[_0x503327(0x1c3)]=_0x472d8f,_0x567f3d[_0x503327(0x2aa)]=_0x50541f;}}[_0x3886ef(0x214)](_0x2003a9,_0x334096,_0x26b2be,_0x406d77){var _0xcecebc=_0x3886ef,_0x438b19=_0x406d77[_0xcecebc(0x257)]||_0x26b2be['strLength'];if((_0x2003a9===_0xcecebc(0x251)||_0x2003a9===_0xcecebc(0x1fe))&&_0x334096['value']){let _0x556a29=_0x334096['value'][_0xcecebc(0x223)];_0x26b2be['allStrLength']+=_0x556a29,_0x26b2be[_0xcecebc(0x271)]>_0x26b2be[_0xcecebc(0x1e8)]?(_0x334096['capped']='',delete _0x334096[_0xcecebc(0x269)]):_0x556a29>_0x438b19&&(_0x334096[_0xcecebc(0x226)]=_0x334096['value'][_0xcecebc(0x1cf)](0x0,_0x438b19),delete _0x334096[_0xcecebc(0x269)]);}}[_0x3886ef(0x1c1)](_0x30974e){var _0x24faed=_0x3886ef;return!!(_0x30974e&&_0x1ab2a5[_0x24faed(0x25e)]&&this[_0x24faed(0x277)](_0x30974e)===_0x24faed(0x211)&&_0x30974e[_0x24faed(0x1dc)]);}[_0x3886ef(0x1c9)](_0x5a3f8f){var _0x4de6b0=_0x3886ef;if(_0x5a3f8f[_0x4de6b0(0x1f8)](/^\\d+$/))return _0x5a3f8f;var _0x3cf7d4;try{_0x3cf7d4=JSON[_0x4de6b0(0x23c)](''+_0x5a3f8f);}catch{_0x3cf7d4='\\x22'+this['_objectToString'](_0x5a3f8f)+'\\x22';}return _0x3cf7d4[_0x4de6b0(0x1f8)](/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)?_0x3cf7d4=_0x3cf7d4[_0x4de6b0(0x1cf)](0x1,_0x3cf7d4['length']-0x2):_0x3cf7d4=_0x3cf7d4[_0x4de6b0(0x23a)](/'/g,'\\x5c\\x27')[_0x4de6b0(0x23a)](/\\\\\"/g,'\\x22')[_0x4de6b0(0x23a)](/(^\"|\"$)/g,'\\x27'),_0x3cf7d4;}['_processTreeNodeResult'](_0x43a71c,_0xb8af3a,_0x3e8b72,_0x50e39b){var _0xad7e1e=_0x3886ef;this[_0xad7e1e(0x20a)](_0x43a71c,_0xb8af3a),_0x50e39b&&_0x50e39b(),this[_0xad7e1e(0x286)](_0x3e8b72,_0x43a71c),this[_0xad7e1e(0x276)](_0x43a71c,_0xb8af3a);}[_0x3886ef(0x20a)](_0x2d4594,_0x658d5f){var _0x5bdce6=_0x3886ef;this[_0x5bdce6(0x1c5)](_0x2d4594,_0x658d5f),this[_0x5bdce6(0x29e)](_0x2d4594,_0x658d5f),this[_0x5bdce6(0x26b)](_0x2d4594,_0x658d5f),this[_0x5bdce6(0x1f4)](_0x2d4594,_0x658d5f);}[_0x3886ef(0x1c5)](_0xbf475e,_0x10f791){}['_setNodeQueryPath'](_0x9bf3a4,_0x480223){}['_setNodeLabel'](_0x54915b,_0x478fb4){}[_0x3886ef(0x231)](_0x16e0d8){var _0x415be2=_0x3886ef;return _0x16e0d8===this[_0x415be2(0x240)];}[_0x3886ef(0x276)](_0x96b231,_0x38314d){var _0xc16b92=_0x3886ef;this[_0xc16b92(0x29d)](_0x96b231,_0x38314d),this['_setNodeExpandableState'](_0x96b231),_0x38314d[_0xc16b92(0x1e7)]&&this[_0xc16b92(0x2ac)](_0x96b231),this[_0xc16b92(0x20f)](_0x96b231,_0x38314d),this['_addLoadNode'](_0x96b231,_0x38314d),this[_0xc16b92(0x1d4)](_0x96b231);}[_0x3886ef(0x286)](_0x4621aa,_0x44eddb){var _0x3476c3=_0x3886ef;try{_0x4621aa&&typeof _0x4621aa[_0x3476c3(0x223)]=='number'&&(_0x44eddb[_0x3476c3(0x223)]=_0x4621aa[_0x3476c3(0x223)]);}catch{}if(_0x44eddb[_0x3476c3(0x263)]===_0x3476c3(0x22d)||_0x44eddb[_0x3476c3(0x263)]===_0x3476c3(0x1c0)){if(isNaN(_0x44eddb[_0x3476c3(0x269)]))_0x44eddb[_0x3476c3(0x1d8)]=!0x0,delete _0x44eddb[_0x3476c3(0x269)];else switch(_0x44eddb[_0x3476c3(0x269)]){case Number[_0x3476c3(0x236)]:_0x44eddb['positiveInfinity']=!0x0,delete _0x44eddb[_0x3476c3(0x269)];break;case Number[_0x3476c3(0x222)]:_0x44eddb[_0x3476c3(0x284)]=!0x0,delete _0x44eddb[_0x3476c3(0x269)];break;case 0x0:this[_0x3476c3(0x292)](_0x44eddb[_0x3476c3(0x269)])&&(_0x44eddb[_0x3476c3(0x205)]=!0x0);break;}}else _0x44eddb['type']===_0x3476c3(0x265)&&typeof _0x4621aa[_0x3476c3(0x28a)]=='string'&&_0x4621aa[_0x3476c3(0x28a)]&&_0x44eddb[_0x3476c3(0x28a)]&&_0x4621aa[_0x3476c3(0x28a)]!==_0x44eddb['name']&&(_0x44eddb[_0x3476c3(0x23e)]=_0x4621aa[_0x3476c3(0x28a)]);}[_0x3886ef(0x292)](_0x59da45){var _0x551b67=_0x3886ef;return 0x1/_0x59da45===Number[_0x551b67(0x222)];}[_0x3886ef(0x2ac)](_0x223694){var _0xb73016=_0x3886ef;!_0x223694[_0xb73016(0x21d)]||!_0x223694['props'][_0xb73016(0x223)]||_0x223694[_0xb73016(0x263)]===_0xb73016(0x1d3)||_0x223694[_0xb73016(0x263)]===_0xb73016(0x25e)||_0x223694[_0xb73016(0x263)]===_0xb73016(0x1eb)||_0x223694['props'][_0xb73016(0x1ce)](function(_0x17ec2b,_0xc4d7bb){var _0x2b9c14=_0xb73016,_0xe2ec0b=_0x17ec2b[_0x2b9c14(0x28a)][_0x2b9c14(0x260)](),_0x31dd43=_0xc4d7bb[_0x2b9c14(0x28a)]['toLowerCase']();return _0xe2ec0b<_0x31dd43?-0x1:_0xe2ec0b>_0x31dd43?0x1:0x0;});}[_0x3886ef(0x20f)](_0x301937,_0x1c2400){var _0x55e4a1=_0x3886ef;if(!(_0x1c2400[_0x55e4a1(0x2a9)]||!_0x301937[_0x55e4a1(0x21d)]||!_0x301937[_0x55e4a1(0x21d)][_0x55e4a1(0x223)])){for(var _0x3cfff1=[],_0xde088f=[],_0x455482=0x0,_0x17f8cd=_0x301937[_0x55e4a1(0x21d)][_0x55e4a1(0x223)];_0x455482<_0x17f8cd;_0x455482++){var _0x1336fe=_0x301937['props'][_0x455482];_0x1336fe[_0x55e4a1(0x263)]===_0x55e4a1(0x265)?_0x3cfff1[_0x55e4a1(0x296)](_0x1336fe):_0xde088f[_0x55e4a1(0x296)](_0x1336fe);}if(!(!_0xde088f['length']||_0x3cfff1[_0x55e4a1(0x223)]<=0x1)){_0x301937[_0x55e4a1(0x21d)]=_0xde088f;var _0x29ef09={'functionsNode':!0x0,'props':_0x3cfff1};this['_setNodeId'](_0x29ef09,_0x1c2400),this[_0x55e4a1(0x29d)](_0x29ef09,_0x1c2400),this[_0x55e4a1(0x235)](_0x29ef09),this[_0x55e4a1(0x1f4)](_0x29ef09,_0x1c2400),_0x29ef09['id']+='\\x20f',_0x301937[_0x55e4a1(0x21d)][_0x55e4a1(0x23b)](_0x29ef09);}}}[_0x3886ef(0x24d)](_0x32337f,_0x82c950){}[_0x3886ef(0x235)](_0x3968b3){}[_0x3886ef(0x1df)](_0x1089cf){var _0xe8aee4=_0x3886ef;return Array[_0xe8aee4(0x28e)](_0x1089cf)||typeof _0x1089cf==_0xe8aee4(0x1d0)&&this[_0xe8aee4(0x277)](_0x1089cf)==='[object\\x20Array]';}['_setNodePermissions'](_0x4bbf30,_0x58deb5){}[_0x3886ef(0x1d4)](_0x1e485b){var _0x5e91c1=_0x3886ef;delete _0x1e485b[_0x5e91c1(0x26d)],delete _0x1e485b[_0x5e91c1(0x1c8)],delete _0x1e485b[_0x5e91c1(0x215)];}[_0x3886ef(0x26b)](_0x1697fb,_0x4a69e2){}[_0x3886ef(0x1e3)](_0x1452d1){var _0x5cbe9b=_0x3886ef;return _0x1452d1?_0x1452d1['match'](this[_0x5cbe9b(0x274)])?'['+_0x1452d1+']':_0x1452d1[_0x5cbe9b(0x1f8)](this['_keyStrRegExp'])?'.'+_0x1452d1:_0x1452d1[_0x5cbe9b(0x1f8)](this['_quotedRegExp'])?'['+_0x1452d1+']':'[\\x27'+_0x1452d1+'\\x27]':'';}}let _0x18b3ec=new _0xd341c9();function _0x43a9f0(_0xb6f140,_0x52b314,_0x1cf6f1,_0x233420,_0x1e3428,_0x3b9f97){var _0x3c786e=_0x3886ef;let _0x27edf9,_0x2ddae7;try{_0x2ddae7=_0x35a29b(),_0x27edf9=_0x53d25f[_0x52b314],!_0x27edf9||_0x2ddae7-_0x27edf9['ts']>0x1f4&&_0x27edf9['count']&&_0x27edf9['time']/_0x27edf9['count']<0x64?(_0x53d25f[_0x52b314]=_0x27edf9={'count':0x0,'time':0x0,'ts':_0x2ddae7},_0x53d25f[_0x3c786e(0x293)]={}):_0x2ddae7-_0x53d25f[_0x3c786e(0x293)]['ts']>0x32&&_0x53d25f[_0x3c786e(0x293)][_0x3c786e(0x28f)]&&_0x53d25f[_0x3c786e(0x293)][_0x3c786e(0x248)]/_0x53d25f[_0x3c786e(0x293)]['count']<0x64&&(_0x53d25f[_0x3c786e(0x293)]={});let _0x51a290=[],_0x2984e2=_0x27edf9[_0x3c786e(0x26f)]||_0x53d25f[_0x3c786e(0x293)][_0x3c786e(0x26f)]?_0x4eb728:_0x51f37f,_0x3e1853=_0x18b4df=>{var _0x3fd78a=_0x3c786e;let _0xbd90a1={};return _0xbd90a1[_0x3fd78a(0x21d)]=_0x18b4df[_0x3fd78a(0x21d)],_0xbd90a1[_0x3fd78a(0x261)]=_0x18b4df[_0x3fd78a(0x261)],_0xbd90a1[_0x3fd78a(0x257)]=_0x18b4df[_0x3fd78a(0x257)],_0xbd90a1[_0x3fd78a(0x1e8)]=_0x18b4df['totalStrLength'],_0xbd90a1[_0x3fd78a(0x29f)]=_0x18b4df[_0x3fd78a(0x29f)],_0xbd90a1[_0x3fd78a(0x20b)]=_0x18b4df[_0x3fd78a(0x20b)],_0xbd90a1['sortProps']=!0x1,_0xbd90a1[_0x3fd78a(0x2a9)]=!_0x3a2bd6,_0xbd90a1[_0x3fd78a(0x1c3)]=0x1,_0xbd90a1[_0x3fd78a(0x1c7)]=0x0,_0xbd90a1[_0x3fd78a(0x266)]=_0x3fd78a(0x25c),_0xbd90a1[_0x3fd78a(0x1f9)]=_0x3fd78a(0x227),_0xbd90a1[_0x3fd78a(0x1f1)]=!0x0,_0xbd90a1[_0x3fd78a(0x232)]=[],_0xbd90a1[_0x3fd78a(0x221)]=0x0,_0xbd90a1[_0x3fd78a(0x1f6)]=!0x0,_0xbd90a1[_0x3fd78a(0x271)]=0x0,_0xbd90a1[_0x3fd78a(0x1d7)]={'current':void 0x0,'parent':void 0x0,'index':0x0},_0xbd90a1;};for(var _0x25c2ed=0x0;_0x25c2ed<_0x1e3428[_0x3c786e(0x223)];_0x25c2ed++)_0x51a290[_0x3c786e(0x296)](_0x18b3ec[_0x3c786e(0x26a)]({'timeNode':_0xb6f140==='time'||void 0x0},_0x1e3428[_0x25c2ed],_0x3e1853(_0x2984e2),{}));if(_0xb6f140===_0x3c786e(0x201)){let _0xb500ce=Error[_0x3c786e(0x1e0)];try{Error[_0x3c786e(0x1e0)]=0x1/0x0,_0x51a290[_0x3c786e(0x296)](_0x18b3ec[_0x3c786e(0x26a)]({'stackNode':!0x0},new Error()['stack'],_0x3e1853(_0x2984e2),{'strLength':0x1/0x0}));}finally{Error[_0x3c786e(0x1e0)]=_0xb500ce;}}return{'method':_0x3c786e(0x262),'version':_0x3f1e88,'args':[{'id':_0x52b314,'ts':_0x1cf6f1,'args':_0x51a290,'context':_0x3b9f97,'session':_0x233420}]};}catch(_0x2d5fcb){return{'method':_0x3c786e(0x262),'version':_0x3f1e88,'args':[{'id':_0x52b314,'ts':_0x1cf6f1,'args':[{'type':'unknown','error':_0x2d5fcb&&_0x2d5fcb['message'],'context':_0x3b9f97,'session':_0x233420}]}]};}finally{try{if(_0x27edf9&&_0x2ddae7){let _0x4a114d=_0x35a29b();_0x27edf9[_0x3c786e(0x28f)]++,_0x27edf9[_0x3c786e(0x248)]+=_0x12c66b(_0x2ddae7,_0x4a114d),_0x27edf9['ts']=_0x4a114d,_0x53d25f[_0x3c786e(0x293)][_0x3c786e(0x28f)]++,_0x53d25f['hits'][_0x3c786e(0x248)]+=_0x12c66b(_0x2ddae7,_0x4a114d),_0x53d25f[_0x3c786e(0x293)]['ts']=_0x4a114d,(_0x27edf9[_0x3c786e(0x28f)]>0x32||_0x27edf9[_0x3c786e(0x248)]>0x64)&&(_0x27edf9[_0x3c786e(0x26f)]=!0x0),(_0x53d25f[_0x3c786e(0x293)]['count']>0x3e8||_0x53d25f[_0x3c786e(0x293)][_0x3c786e(0x248)]>0x12c)&&(_0x53d25f['hits']['reduceLimits']=!0x0);}}catch{}}}return _0x1ab2a5['_console_ninja'];})(globalThis,_0x5de714(0x1ec),_0x5de714(0x285),_0x5de714(0x250),_0x5de714(0x29a),_0x5de714(0x27f),_0x5de714(0x2a2),_0x5de714(0x249),_0x5de714(0x1c2));");
}
catch (e) { } }
;
function oo_oo(i, ...v) { try {
    oo_cm().consoleLog(i, v);
}
catch (e) { } return v; }
;
oo_oo;
function oo_tr(i, ...v) { try {
    oo_cm().consoleTrace(i, v);
}
catch (e) { } return v; }
;
oo_tr;
function oo_ts() { try {
    oo_cm().consoleTime();
}
catch (e) { } }
;
oo_ts;
function oo_te() { try {
    oo_cm().consoleTimeEnd();
}
catch (e) { } }
;
oo_te; /*eslint eslint-comments/disable-enable-pair:,eslint-comments/no-unlimited-disable:,eslint-comments/no-aggregating-enable:,eslint-comments/no-duplicate-disable:,eslint-comments/no-unused-disable:,eslint-comments/no-unused-enable:,*/

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map