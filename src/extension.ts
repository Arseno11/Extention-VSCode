import * as vscode from 'vscode';
import { exec } from 'child_process';
import { filesize } from 'filesize';


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
const fs = require('fs');

export function activate(context: vscode.ExtensionContext) {
  // Create status bar item for loading animation
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
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

        const driveLetter = 'D';
        const drivespace = fs.statSync(`${driveLetter}:\\`).size;
        const diskSpace = drivespace.free;

        if (!(frameworkSelection.toLowerCase() in frameworkSizes)) {
          vscode.window.showErrorMessage(`Error: Framework ${frameworkSelection} is not supported!`);
          return;
        }

        const frameworkSizeBytes = frameworkSizes[frameworkSelection.toLowerCase()];
        const frameworkSizeReadable = filesize(frameworkSizeBytes);


        if (diskSpace < frameworkSizeBytes) {
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
                if (increment > 80) {
                  increment = 0;
                }
                progress.report({ increment });
              }, 80);
              await terminal.sendText(command);
              clearInterval(interval);
              progress.report({ increment: 80 });
              vscode.window.showInformationMessage(`${frameworkName} created successfully!`);
            });
          } catch (err: any) {
            vscode.window.showErrorMessage(`Error: ${err.message}`);
          }
        }


        const projectName = await vscode.window.showInputBox({
          prompt: `Please enter a project name`,
          placeHolder: `MyProjectName`,
          validateInput: (value) => {
            if (!value) {
              return 'Please enter a project name';
            } else if (fs.existsSync(value)) {
              return 'Folder already exists, please enter a different name';
            } else {
              return null;
            }
          },
        });

        console.log(`Project name:`, projectName);

        if (!projectName) {
          statusBarItem.hide();
          return;
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