# console-gui-tools
 A simple library to draw option menu or other popup inputs and layout on Node.js console.

[![npm version](https://badge.fury.io/js/console-gui-tools.svg)](https://npmjs.com/package/console-gui-tools) [![npm](https://img.shields.io/npm/dt/console-gui-tools)](https://npmjs.com/package/console-gui-tools) ![npm bundle size](https://img.shields.io/bundlephobia/min/console-gui-tools) ![GitHub](https://img.shields.io/github/license/elius94/console-gui-tools)

# users-session-manager
A simple Node.js library to create Console Apps like wizard (or maybe if you like old style colored screen or something like "teletext" programs 😂)
Apart from jokes, it is a library that allows you to create a screen divided into a part with everything you want to see (such as variable values) and another in which the logs run.
Moreover in this way the application is managed by the input event "keypressed" to which each key corresponds to a bindable command.
For example, to change variables you can open popups with an option selector or with a textbox.
It's in embryonic phase, any suggestion will be constructive :D

 [![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=elius94&repo=console-gui-tools&theme=github_dark&show_icons=true)](https://github.com/Elius94/console-gui-tools) [![https://nodei.co/npm/console-gui-tools.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/console-gui-tools.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/console-gui-tools)

## Installation

Install with:
```sh
npm i console-gui-tools
```

Example of usage:
```js
// Import module with ES6 syntax
import { ConsoleManager, OptionPopup, InputPopup } from '../index.js'
const GUI = new ConsoleManager()

// Creating a main page updater:
const updateConsole = async() => {
    let screen = ""
    screen += chalk.yellow(`TCP server simulator app! Welcome...`) + `\n`
    screen += chalk.green(`TCP Server listening on ${HOST}:${PORT}`) + `\n`
    screen += chalk.green(`Connected clients: `) + chalk.white(`${connectedClients}\n`)
    screen += chalk.magenta(`TCP Messages sent: `) + chalk.white(`${tcpCounter}`) + `\n\n`

    // Print if simulator is running or not
    if (!valueEmitter) {
        screen += chalk.red(`Simulator is not running! `) + chalk.white(`press 'space' to start`) + `\n`
    } else {
        screen += chalk.green(`Simulator is running! `) + chalk.white(`press 'space' to stop`) + `\n`
    }
    // Print mode:
    screen += chalk.cyan(`Mode:`) + chalk.white(` ${mode}`) + `\n`;
    // Print message frequency:
    screen += chalk.cyan(`Message period:`) + chalk.white(` ${period} ms`) + `\n`;
    // Print Min and Max
    screen += chalk.cyan(`Min:`) + chalk.white(` ${min}`) + `\n`;
    screen += chalk.cyan(`Max:`) + chalk.white(` ${max}`) + `\n`;
    // Print current values:
    screen += chalk.cyan(`Values:`) + chalk.white(` ${values.map(v => v.toFixed(4)).join('   ')}`) + `\n`;

    // Spacer
    screen += `\n\n`;

    if (lastErr.length > 0) {
        screen += lastErr + `\n\n`
    }

    screen += chalk.bgBlack(`Commands:`) + `\n`;
    screen += `  ${chalk.bold('space')}   - ${chalk.italic('Start/stop simulator')}\n`;
    screen += `  ${chalk.bold('m')}       - ${chalk.italic('Select simulation mode')}\n`;
    screen += `  ${chalk.bold('s')}       - ${chalk.italic('Select message period')}\n`;
    screen += `  ${chalk.bold('h')}       - ${chalk.italic('Set max value')}\n`;
    screen += `  ${chalk.bold('l')}       - ${chalk.italic('Set min value')}\n`;
    screen += `  ${chalk.bold('q')}       - ${chalk.italic('Quit')}\n`;

    GUI.setHomePage(screen)
}

// And manage the keypress event from the library
GUI.on("keypressed", (key) => {
    if (key.ctrl && key.name === 'c') {
        closeApp()
    }
    switch (key.name) {
        case 'space':
            if (valueEmitter) {
                clearInterval(valueEmitter)
                valueEmitter = null
            } else {
                valueEmitter = setInterval(frame, period)
            }
            break
        case 'm':
            new OptionPopup("popupSelectMode", "Select simulation mode", modeList, mode).show().once("confirm", (_mode) => {
                mode = _mode
                GUI.warn(`NEW MODE: ${mode}`)
                drawGui()
            })
            break
        case 's':
            new OptionPopup("popupSelectPeriod", "Select simulation period", periodList, period).show().once("confirm", (_period) => {
                period = _period
                GUI.warn(`NEW PERIOD: ${period}`)
                drawGui()
            })
            break
        case 'h':
            new InputPopup("popupTypeMax", "Type max value", max, true).show().once("confirm", (_max) => {
                max = _max
                GUI.warn(`NEW MAX VALUE: ${max}`)
                drawGui()
            })
            break
        case 'l':
            new InputPopup("popupTypeMin", "Type min value", min, true).show().once("confirm", (_min) => {
                min = _min
                GUI.warn(`NEW MIN VALUE: ${min}`)
                drawGui()
            })
            break
        case 'q':
            closeApp()
            break
        default:
            break
    }
    drawGui()
})

const drawGui = () => {
    updateConsole()
}

```

## To create an option popup (select)
```js
new OptionPopup("popupSelectPeriod", "Select simulation period", periodList, period).show().once("confirm", (_period) => {
    period = _period
    GUI.warn(`NEW PERIOD: ${period}`)
    drawGui()
})
```
The response is triggered via EventEmitter using "once" (not "on")
The result is this:

![image](https://user-images.githubusercontent.com/14907987/162258068-97fb5fd0-3546-430b-9a90-14dae6b72542.png)

Pressing enter it will close the popup and set the new value:

![image](https://user-images.githubusercontent.com/14907987/162258174-7b5bd516-608b-4e03-a549-502cffc4b0a2.png)

You can also use it to set a numeric threshold:

![image](https://user-images.githubusercontent.com/14907987/161997181-07993f9a-6ad2-4c77-a834-2bbc4ed53a1e.png)

Only numbers are allowed.

![image](https://user-images.githubusercontent.com/14907987/161997601-522eef0c-b3a8-47b8-b174-6cb12266fb1c.png)

## Console.log and other logging tools
To log you have to use the following functions:

```js
GUI.log(`NEW MIN VALUE: ${min}`)
GUI.warn(`NEW MIN VALUE: ${min}`)
GUI.error(`NEW MIN VALUE: ${min}`)
GUI.info(`NEW MIN VALUE: ${min}`)
```
And they written to the bottom of the page.

This library is in development now. New componets will come asap.