import * as vscode from 'vscode';
import { exec } from 'child_process';
import { filesize } from 'filesize';
import path = require('path');
import { ExtensionContext, workspace, version as vsCodeVersion } from 'vscode';
import * as semver from 'semver';

const fs = require('fs');
const extensionId = require('../package.json').name;
const EXTENSION_ID = `${extensionId}`;

const frameworkOptions: { [key: string]: string[] } = {
  php: [`Laravel`, `CodeIgniter`, `Symfony`],
  javascript: [`React`, `Vue`, `Angular`, `Next.js`]
};

type FrameworkSizes = {
  [key: string]: number;
};

const frameworkSizes: FrameworkSizes = {
  laravel: 80 * 1024 * 1024,
  codeigniter: 70 * 1024 * 1024,
  symfony: 60 * 1024 * 1024,
  react: 50 * 1024 * 1024,
  vue: 40 * 1024 * 1024,
  angular: 30 * 1024 * 1024,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'next.js': 20 * 1024 * 1024,
};


export function activate(context: vscode.ExtensionContext) {

  checkForUpdate(context.globalState);

  // Registrasi handler untuk event onDidChangeExtensions
  context.subscriptions.push(vscode.extensions.onDidChange(() => {
    // Cek versi terbaru saat ada perubahan pada ekstensi
    checkForUpdate(context.globalState);
  }));



  // Fungsi untuk mengecek versi terbaru dan menampilkan notifikasi saat pertama kali membuka VS Code setelah ada update
  async function checkForUpdate(globalState: vscode.Memento) {
    const extension = vscode.extensions.getExtension(EXTENSION_ID);
    if (!extension) {
      return; // kembalikan dari fungsi jika extension tidak ditemukan
    }

    const latestVersion = await getLatestVersion(extension.packageJSON.version);

    // Bandingkan versi terbaru dengan versi saat ini
    if (latestVersion && semver.gt(latestVersion, extension.packageJSON.version)) {
      const hasShownUpdateNotification = globalState.get('hasShownUpdateNotification');

      // Tampilkan notifikasi hanya jika belum pernah ditampilkan sebelumnya
      if (!hasShownUpdateNotification) {
        vscode.window.showInformationMessage(`My Extension has been updated to version ${latestVersion}. Please check the release notes for more information.`, 'View Release Notes')
          .then((selection) => {
            if (selection === 'View Release Notes') {
              vscode.env.openExternal(vscode.Uri.parse(extension.packageJSON.homepage));
            }
          });
        // Set hasShownUpdateNotification ke true agar notifikasi tidak muncul lagi
        globalState.update('hasShownUpdateNotification', true);
      }
    }
  }

  // Fungsi untuk mendapatkan versi terbaru dari server
  async function getLatestVersion(currentVersion: string): Promise<string> {
    try {
      const response = await workspace.fs.readDirectory(vscode.Uri.parse('http://myserver.com/extension_versions'));
      const versionRegex = /^(\d+)\.(\d+)\.(\d+)$/;

      // Cari versi terbaru yang lebih besar dari versi saat ini
      let latestVersion: string = currentVersion; // ubah nilai default
      for (const [fileName, fileType] of response) {
        if (fileType === vscode.FileType.File) {
          const match = versionRegex.exec(fileName);
          if (match) {
            const version = match[0];
            if (semver.gt(version, currentVersion)) {
              if (!latestVersion || semver.gt(version, latestVersion)) {
                latestVersion = version;
              }
            }
          }
        }
      }
      return latestVersion;
    } catch (error) {
      console.error(error);
      return currentVersion; // ubah nilai yang dikembalikan ke nilai default
    }
  }


  const extensionName = require('../package.json').name;
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
        } else if (fs.existsSync(value)) {
          return 'Folder already exists, please enter a different name';
        } else {
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

    let previousSelections: string[] = [];
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
            } else {
              return null;
            }
          },
          ignoreFocusOut: true // prevent input box from closing on focus out
        });

        console.log(`Project name:`, projectName);

        if (!projectName) { // Check if projectName is empty or cancelled
          vscode.window.showErrorMessage(`Do you want to exit?😢`);

          await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Waiting for user input',
            cancellable: false
          }, async (progress) => {
            // Update progress bar
            progress.report({ increment: 0 });

            // Wait for the user to make a choice
            const result = await vscode.window.showQuickPick(['Yes', 'No'], {
              placeHolder: 'Do you want to exit?',
            });

            // Update progress bar
            progress.report({ increment: 100 });

            if (result === 'Yes') {
              vscode.window.showInformationMessage(`See you again. 👋`);
              statusBarItem.hide();
              return;
            } else if (result === 'No') {
              vscode.window.showInformationMessage(`Welcome Back. 🤗`);
              return await vscode.commands.executeCommand('arseno.WebAppCreate');
            }
          });
        }

        previousSelections.push(languageSelection);
        previousSelections.push(frameworkSelection);

        // Check if Composer is installed for PHP/Laravel projects
        if (languageSelection.toLowerCase() === `php` && [`Laravel`, `CodeIgniter`, `Symfony`].includes(frameworkSelection.toLowerCase())) {
          exec(`composer -v`, (error, stdout, stderr) => {
            if (error || stderr) {
              const message = `Composer not found, do you want to install it?`;
              const options = [`Yes`, `No`];

              vscode.window.showQuickPick(options, { placeHolder: message }).then((response) => {
                if (response === `Yes`) {
                  exec(`php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && php -r "if (hash_file('sha384', 'composer-setup.php') === '55ce33d7678c5a611085589f1f3ddf8b3c52d662cd01d4ba75c0ee0459970c2200a51f492d557530c71c15d8dba01eae') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;" && php composer-setup.php && php -r "unlink('composer-setup.php');"`
                    , (error, stdout, stderr) => {
                      if (error || stderr) {
                        vscode.window.showErrorMessage(`Composer installation failed. Please install manually.`);
                      } else {
                        vscode.window.showInformationMessage(`Composer successfully installed.`);
                      }
                    });
                } else if (response === `Back`) {
                  previousSelections.pop();
                  previousSelections.pop();
                }
              });
            }
          });
        }

        // Check if npm, npx, and node are installed for JavaScript projects
        if (languageSelection.toLowerCase() === `javascript` && [`react`, `vue`, `angular`, `next.js`, `ember.js`, `meteor.js`].includes(frameworkSelection.toLowerCase())) {
          exec(`npm -v && npx -v && node -v`, (error, stdout, stderr) => {
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
                  exec(`curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash - && sudo apt-get install -y nodejs`, () => {
                    exec(`npm install -g npm`);
                    exec(`npm install -g npx`);
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
        const frameworkSizeReadable = filesize(frameworkSizeBytes);


        if (freeDisk < frameworkSizeBytes) {
          vscode.window.showErrorMessage(`Error: Not enough disk space to install ${frameworkSelection}. Required: ${frameworkSizeReadable}`);
          return;
        }

        const terminal = vscode.window.createTerminal();
        async function installFramework(command: string, frameworkName: string) {
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
          } catch (err: any) {
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
        } else if (languageSelection.toLowerCase() === `javascript`) {
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
    } catch (err: any) {
      vscode.window.showErrorMessage(`Error: ${err.message}`);
    }
  });
  context.subscriptions.push(disposable);


} 