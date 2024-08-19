import { EventEmitter } from "events"
import readline from "readline"
import PageBuilder from "./components/PageBuilder.js"
import InPageWidgetBuilder from "./components/InPageWidgetBuilder.js"
import Screen from "./components/Screen.js"
import { CustomPopup, PopupConfig } from "./components/widgets/CustomPopup.js"
import { ButtonPopup, ButtonPopupConfig } from "./components/widgets/ButtonPopup.js"
import { ConfirmPopup, ConfirmPopupConfig } from "./components/widgets/ConfirmPopup.js"
import { FileSelectorPopup, FileSelectorPopupConfig } from "./components/widgets/FileSelectorPopup.js"
import { InputPopup, InputPopupConfig } from "./components/widgets/InputPopup.js"
import { OptionPopup, OptionPopupConfig } from "./components/widgets/OptionPopup.js"
import { Control, ControlConfig } from "./components/widgets/Control.js"
import { Box, BoxConfig, BoxStyle } from "./components/widgets/Box.js"
import { Button, ButtonConfig, ButtonKey, ButtonStyle } from "./components/widgets/Button.js"
import { Progress, ProgressConfig, Orientation, ProgressStyle } from "./components/widgets/ProgressBar.js"
import LayoutManager, { LayoutOptions } from "./components/layout/LayoutManager.js"
import { MouseEvent, MouseManager, MouseEventArgs, RelativeMouseEvent } from "./components/MouseManager.js"
import { PhisicalValues, StyledElement, SimplifiedStyledElement, StyleObject } from "./components/Utils.js"
import { EOL } from "node:os"


/**
 * @description This type is used to define the parameters of the KeyListener event (keypress).
 * @typedef {Object} KeyListenerArgs
 * @prop {string} name - The name of the key pressed.
 * @prop {boolean} ctrl - If the ctrl key is pressed.
 * @prop {boolean} shift - If the shift key is pressed.
 * @prop {boolean} alt - If the alt key is pressed.
 * @prop {boolean} meta - If the meta key is pressed.
 * @prop {boolean} sequence - If the sequence of keys is pressed.
 *
 * @export
 * @interface KeyListenerArgs
 */
// @type definition
export interface KeyListenerArgs {
    name: string;
    sequence: string;
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
    code: string;
}

/**
 * @description This type is used to define the ConsoleGui options.
 * @typedef {Object} ConsoleGuiOptions
 * @prop {string} [title] - The title of the ConsoleGui.
 * @prop {0 | 1 | 2 | 3 | "popup"} [logLocation] - The location of the logs.
 * @prop {string} [showLogKey] - The key to show the log.
 * @prop {number} [logPageSize] - The size of the log page.
 * @prop {LayoutOptions} [layoutOptions] - The options of the layout.
 * @prop {boolean} [enableMouse] - If the mouse should be enabled.
 * @prop {boolean} [overrideConsole = true] - If the console.log|warn|error|info should be overridden.
 * @prop {string} [focusKey = "tab"] - The key to focus the next widget.
 * 
 * @export
 * @interface ConsoleGuiOptions
 */
// @type definition
export interface ConsoleGuiOptions {
    logLocation?: 0 | 1 | 2 | 3 | "popup";
    showLogKey?: string;
    logPageSize?: number;
    layoutOptions?: LayoutOptions;
    title?: string;
    enableMouse?: boolean; // enable the mouse support (default: true) - Only for Linux and other Mouse Tracking terminals
    overrideConsole?: boolean; // override the console.log, console.warn, console.error, console.info, console.debug (default: true)
    focusKey?: string; // the key to focus the next widget (default: tab)
}

/**
 * @class ConsoleManager
 * @extends EventEmitter
 * @description This class is used to manage the console GUI and all the widgets.
 * This is a singleton class, so you can use it like this: const CM = new ConsoleManager()
 * Emits the following events: 
 * - "keypressed" to propagate the key pressed event to the application
 * - "layoutratiochanged" when the layout ratio is changed
 * - "exit" when the user wants to exit the application
 * @param {object} options - The options of the ConsoleManager.
 * @example const CM = new ConsoleManager({ logPageSize: 10, layoutBorder: true, changeLayoutKey: 'ctrl+l', title: 'Console Application' })
 */
class ConsoleManager extends EventEmitter {
    Terminal: NodeJS.WriteStream & { fd: 1 }
    Input: NodeJS.ReadStream & { fd: 0 }
    static instance: ConsoleManager
    Screen!: Screen
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    popupCollection: { [key: string]: any } = {}
    controlsCollection: { [key: string]: Control } = {}
    eventListenersContainer: { [key: string]: (_str: string, key: KeyListenerArgs) => void } | { [key: string]: (key: MouseEvent) => void } = {}
    logLocation!: 0 | 1 | 2 | 3 | "popup"
    logPageSize!: number
    logPageTitle!: string
    pages!: PageBuilder[]
    layoutOptions!: LayoutOptions
    layout!: LayoutManager
    changeLayoutKey!: string
    maxListeners = 128
    private changeLayoutkeys!: string[]
    applicationTitle!: string
    private showLogKey!: string
    stdOut!: PageBuilder
    mouse!: MouseManager
    private parsingMouseFrame = false // used to avoid the mouse event to be triggered multiple times
    private previousFocusedWidgetsId: string[] = []
    private focusKey!: string

    public constructor(options: ConsoleGuiOptions | undefined = undefined) {
        super()
        this.Terminal = process.stdout
        this.Input = process.stdin
        this.Input.setMaxListeners(this.maxListeners)
        if (!ConsoleManager.instance) {
            ConsoleManager.instance = this

            /** @const {Screen} Screen - The screen instance */
            this.Screen = new Screen(this.Terminal)
            this.Screen.on("resize", () => {
                this.emit("resize")
            })
            this.Screen.on("error", (err) => {
                this.error(err)
            })

            this.mouse = new MouseManager(this.Terminal, this.Input)
            this.mouse.setMaxListeners(this.maxListeners)
            this.popupCollection = {}
            this.controlsCollection = {}
            this.eventListenersContainer = {}

            /** @const {number | 'popup'} logLocation - Choose where the logs are displayed: number (0,1) - to pot them on one of the two layouts, string ("popup") - to put them on a CustomPopup that can be displayed on the window. */
            this.logLocation = 1
            this.logPageTitle = "LOGS"

            this.layoutOptions = {
                showTitle: true,
                boxed: true,
                boxColor: "cyan",
                boxStyle: "bold",
                changeFocusKey: "ctrl+l",
                type: "double",
                direction: "vertical",
            }
            
            if (options) {
                if (options.logLocation !== undefined) {
                    if (typeof options.logLocation === "number") {
                        this.logLocation = options.logLocation > 0 ? options.logLocation : 0
                    } else {
                        if (options.logLocation === "popup") {
                            this.logLocation = "popup"
                            this.showLogKey = options.showLogKey || "o"
                        } else {
                            this.logLocation = 1
                        }
                    }
                }
                if (options.enableMouse) {
                    this.mouse.enableMouse()
                }
                if (options.overrideConsole) {
                    if (options.overrideConsole === true) {
                        this.overrideConsole()
                    }
                } else {
                    this.overrideConsole()
                }
                if (typeof options.layoutOptions !== "undefined") {
                    this.setLayoutOptions(options.layoutOptions, false)
                }
            }
            
            this.logPageSize = options && options.logPageSize || 10
            this.applicationTitle = options && options.title || ""
            this.focusKey = options && options.focusKey || "tab"
            
            /** @const {PageBuilder} stdOut - The logs page */
            this.stdOut = new PageBuilder()
            this.stdOut.setRowsPerPage(this.logPageSize)

            this.updateLayout()
            this.addGenericListeners()

            // Create a Interface from STDIN so this interface can be close later otherwise the Process hangs
            this.inputInterface = readline.createInterface ({ input: process.stdin, escapeCodeTimeout: 50 })
            // I use readline to manage the keypress event
            readline.emitKeypressEvents(this.Input, this.inputInterface)
            this.Input.setRawMode(true) // With this I only get the key value
        }
        return ConsoleManager.instance
    }
    private inputInterface : readline.Interface | undefined

    /**
     * @description This method is used to change the layout options.
     * if update is true, the layout will be updated.
     *
     * @param {LayoutOptions} options
     * @param {boolean} [update=true]
     * @memberof ConsoleManager
     * 
     * @example CM.setLayoutOptions({ showTitle: true, boxed: true, boxColor: 'cyan', boxStyle: 'bold', changeFocusKey: 'ctrl+l', type: 'double', direction: 'vertical' })
     * @example CM.setLayoutOptions({ ...CM.getLayoutOptions(), type: "quad" })
     */
    public setLayoutOptions(options: LayoutOptions, update = true): void {
        this.layoutOptions = options
        if (update) this.updateLayout()
    }

    /** 
     * @description This method is used to update the layout
     * @memberof ConsoleManager
     */
    public updateLayout(): void {
        /** @const {string} changeLayoutKey - The key or combination to switch the selected page */
        this.changeLayoutKey = this.layoutOptions.changeFocusKey || ""
        this.changeLayoutkeys = this.changeLayoutKey ? this.changeLayoutKey.split("+") : []
        /** @const {Array<PageBuilder>} homePage - The main application */
        switch (this.layoutOptions.type) {
        case "single":
            this.pages = [new PageBuilder()]
            break
        case "double":
            this.pages = [new PageBuilder(), new PageBuilder()]
            break
        case "triple":
            this.pages = [new PageBuilder(), new PageBuilder(), new PageBuilder()]
            break
        case "quad":
            this.pages = [new PageBuilder(), new PageBuilder(), new PageBuilder(), new PageBuilder()]
            break
        default:
            this.pages = [new PageBuilder(), new PageBuilder()]
            break
        }

        /** @const {LayoutManager} layout - The layout instance */
        this.layout = new LayoutManager(this.pages, this.layoutOptions)

        if (this.logLocation === "popup") {
            this.setPages(this.pages)
        } else if (typeof this.logLocation === "number") {
            this.setPage(this.stdOut, this.logLocation)
            this.pages.forEach((page, index) => {
                if (index !== this.logLocation) {
                    this.setPage(page, index)
                }
            })
            this.layout.setTitle(this.logPageTitle, this.logLocation)
        } else {
            this.setPages([...this.pages, this.stdOut])
            this.layout.setTitle(this.applicationTitle, 0)
            this.layout.setTitle(this.logPageTitle, 1)
        }
    }

    /**
     * @description This method is used to get the layout options.
     * @returns {LayoutOptions} The layout options.
     * @memberof ConsoleManager
     * @example CM.getLayoutOptions()
     * @example CM.getLayoutOptions().boxed
     */
    public getLayoutOptions(): LayoutOptions {
        return this.layoutOptions
    }

    /**
     * @description This method is used to get the log page size.
     * @returns {number} The log page size.
     * @memberof ConsoleManager
     * @example CM.getLogPageSize()
     */
    public getLogPageSize(): number {
        return this.logPageSize
    }

    /**
     * @description This method is used to set the log page size.
     * @param {number} size - The new log page size.
     * @returns {void}
     * @example CM.setLogPageSize(10)
     */
    public setLogPageSize(size: number): void {
        this.logPageSize = size
    }

    /**
     * @description This method is used to remove focus from other widgets.
     *
     * @param {string} widget
     * @memberof ConsoleManager
     */
    public unfocusOtherWidgets(widget: string): void {
        Object.keys(this.controlsCollection).forEach((key: string) => {
            if (key !== widget) {
                this.controlsCollection[key].unfocus()
                this.previousFocusedWidgetsId.push(key)
            }
        })
        Object.keys(this.popupCollection).forEach((key: string) => {
            if (key !== widget) {
                if (this.popupCollection[key].unfocus) this.popupCollection[key].unfocus()
                this.previousFocusedWidgetsId.push(key)
            }
        })
    }

    public restoreFocusInWidgets(): void {
        this.previousFocusedWidgetsId.forEach((key: string) => {
            if (this.controlsCollection[key]) {
                this.controlsCollection[key].focus()
            } else if (this.popupCollection[key]) {
                if (this.popupCollection[key].focus) this.popupCollection[key].focus()
            }
        })
        this.previousFocusedWidgetsId = []
    }

    /**
     * @description This function is used to make the ConsoleManager handle the key events when no widgets are showed.
     * Inside this function are defined all the keys that can be pressed and the actions to do when they are pressed.
     * @memberof ConsoleManager
     */
    private addGenericListeners(): void {
        this.Input.addListener("keypress", (_str: string, key: KeyListenerArgs): void => {
            //this.log(`Key pressed: ${JSON.stringify(key)}`)
            const checkResult = this.mouse.isMouseFrame(key, this.parsingMouseFrame)
            if (checkResult === 1) {
                this.parsingMouseFrame = true
                return
            } else if (checkResult === -1) {
                this.parsingMouseFrame = false
                return
            } // Continue only if the result is 0
            let change = false
            if (this.changeLayoutkeys.length > 1) {
                if (this.changeLayoutkeys[0] == "ctrl") {
                    if (key.ctrl && key.name === this.changeLayoutkeys[1])
                        change = true
                }
                if (this.changeLayoutkeys[0] == "meta") {
                    if (key.alt && key.name === this.changeLayoutkeys[1])
                        change = true
                }
                if (this.changeLayoutkeys[0] == "shift") {
                    if (key.shift && key.name === this.changeLayoutkeys[1])
                        change = true
                }
            } else {
                if (key.name === this.changeLayoutkeys[0])
                    change = true
            }

            if (this.focusKey && key.name === this.focusKey) {
                // Find current focused widget
                let focusedWidget = ""
                Object.keys(this.controlsCollection).forEach((key: string) => {
                    if (this.controlsCollection[key].isFocused()) {
                        focusedWidget = key
                    }
                })
                // If there is a focused widget, unfocus it
                if (focusedWidget !== "") {
                    this.controlsCollection[focusedWidget].unfocus()
                }
                // Focus the next widget
                let found = false
                Object.keys(this.controlsCollection).forEach((key: string) => {
                    if (found) {
                        this.controlsCollection[key].focus()
                        found = false
                    }
                    if (key === focusedWidget) {
                        found = true
                    }
                })
                if (found) {
                    this.controlsCollection[Object.keys(this.controlsCollection)[0]].focus()
                }
            }

            if (this.showLogKey && key.name === this.showLogKey) {
                this.showLogPopup()
            }

            if (change) {
                this.layout.changeLayout()
                this.refresh()
                return
            }

            if (key.ctrl && key.name === "c") {
                this.inputInterface?.close()
                this.emit("exit")
            } else {
                if (Object.keys(this.popupCollection).length === 0) {
                    // if (key.name === "down") {
                    //     this.layout.pages[this.layout.getSelected()].decreaseScrollIndex()
                    //     this.refresh()
                    //     return
                    // } else if (key.name === "up") {
                    //     this.layout.pages[this.layout.getSelected()].increaseScrollIndex()
                    //     this.refresh()
                    //     return
                    // }
                    // if (this.layoutOptions.type !== "single") {
                    //     if (key.name === "left") {
                    //         this.emit("layoutratiochanged", key)
                    //         this.layout.decreaseRatio(0.01)
                    //         this.refresh()
                    //         return
                    //     } else if (key.name === "right") {
                    //         this.emit("layoutratiochanged", key)
                    //         this.layout.increaseRatio(0.01)
                    //         this.refresh()
                    //         return
                    //     }
                    // }
                    this.emit("keypressed", key)
                }
            }
        })

        /** @eventlistener this is used to set the focus over the top viewed widget if the mouse is over it */
        this.mouse.addListener("mouseevent", (e: MouseEvent) => {
            if (e.name === "MOUSE_LEFT_BUTTON_PRESSED") {
                // Check if the mouse is over a widget. if there are more widgets, the one on top is selected.
                Object.keys(this.controlsCollection).forEach((key: string) => {
                    if (this.controlsCollection[key].absoluteValues.x <= e.data.x && this.controlsCollection[key].absoluteValues.x + this.controlsCollection[key].absoluteValues.width >= e.data.x) {
                        if (this.controlsCollection[key].absoluteValues.y <= e.data.y && this.controlsCollection[key].absoluteValues.y + this.controlsCollection[key].absoluteValues.height >= e.data.y) {
                            if (!this.controlsCollection[key].isFocused()) {
                                this.controlsCollection[key].focus()
                            }
                        }
                    }
                })
            }
        })
    }

    /**
     * @description This function is used to set a key listener for a specific widget. The event listener is stored in the eventListenersContainer object.
     * @param {string} id - The id of the widget.
     * @param {function} manageFunction - The function to call when the key is pressed.
     * @memberof ConsoleManager
     * @example CM.setKeyListener('inputPopup', popup.keyListener)
     */
    public setKeyListener(id: string, manageFunction: (_str: string, key: KeyListenerArgs) => void): void {
        if (this.eventListenersContainer[id] !== undefined) {
            this.removeKeyListener(id)
        }
        this.eventListenersContainer[id] = manageFunction
        this.Input.addListener("keypress", this.eventListenersContainer[id])
    }

    /**
     * @description This function is used to remove a key listener for a specific widget. The event listener is removed from the eventListenersContainer object.
     * @param {string} id - The id of the widget.
     * @memberof ConsoleManager
     * @example CM.removeKeyListener('inputPopup')
     */
    public removeKeyListener(id: string): void {
        this.Input.removeListener("keypress", this.eventListenersContainer[id])
        delete this.eventListenersContainer[id]
    }

    /**
     * @description This function is used to set a mouse listener for a specific widget. The event listener is stored in the eventListenersContainer object.
     * @param {string} id - The id of the widget.
     * @param {function} manageFunction - The function to call when the key is pressed.
     * @memberof ConsoleManager
     * @example CM.setMouseListener('inputPopup', popup.mouseListener)
     */
    public setMouseListener(id: string, manageFunction: (key: MouseEvent) => void): void {
        if (this.eventListenersContainer[id] !== undefined) {
            this.removeMouseListener(id)
        }
        this.eventListenersContainer[id] = manageFunction
        this.mouse.addListener("mouseevent", this.eventListenersContainer[id])
    }

    /**
     * @description This function is used to remove a mouse listener for a specific widget. The event listener is removed from the eventListenersContainer object.
     * @param {string} id - The id of the widget.
     * @memberof ConsoleManager
     * @example CM.removeMouseListener('inputPopup')
     */
    public removeMouseListener(id: string): void {
        this.mouse.removeListener("mouseevent", this.eventListenersContainer[id])
        delete this.eventListenersContainer[id]
    }

    /**
     * @description This function is used to register a popup. The popup is stored in the popupCollection object. That is called by the popups in show().
     * @param {popup} popup - The popup to register.
     * @memberof ConsoleManager
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public registerPopup(popup: any): void {
        this.popupCollection[popup.id] = popup
    }

    /**
     * @description This function is used to unregister a popup. The popup is removed from the popupCollection object. That is called by the popups in hide().
     * @param {string} id - The id of the popup.
     * @memberof ConsoleManager
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public unregisterPopup(popup: any): void {
        if (this.popupCollection[popup.id]) {
            delete this.popupCollection[popup.id]
        }
    }

    /**
     * @description This function is used to register a control. The control is stored in the controlCollection object. That is called by the controls in show().
     * @param {control} control - The control to register.
     * @memberof ConsoleManager
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public registerControl(control: any): void {
        this.controlsCollection[control.id] = control
    }

    /**
     * @description This function is used to unregister a control. The control is removed from the controlCollection object. That is called by the controls in hide().
     * @param {string} id - The id of the control.
     * @memberof ConsoleManager
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public unregisterControl(control: any): void {
        if (this.controlsCollection[control.id]) {
            delete this.controlsCollection[control.id]
        }
    }

    /**
     * @description This function is used to set the home page. It also refresh the screen.
     * @param {PageBuilder} page - The page to set as home page.
     * @memberof ConsoleManager
     * @example CM.setHomePage(p)
     * @deprecated since version 1.1.12 - Use setPage or setPages instead
     */
    public setHomePage(page: PageBuilder): void {
        this.pages[0] = page
        if (this.logLocation === "popup") {
            this.layout.setPage(page, 0)
        } else if (typeof this.logLocation === "number") {
            if (this.logLocation === 0) {
                this.layout.setPage(page, 1)
            } else {
                this.layout.setPage(page, 0)
            }
        } else {
            this.layout.setPage(page, 1)
        }
        this.refresh()
    }

    /**
     * @description This function is used to set a page of layout. It also refresh the screen.
     * @param {PageBuilder} page - The page to set as home page.
     * @param {number} [pageNumber] - The page number to set. 0 is the first page, 1 is the second page.
     * @param {string | null} [title] - The title of the page to overwrite the default title. Default is null.
     * @memberof ConsoleManager
     * @example CM.setPage(p, 0)
     */
    public setPage(page: PageBuilder, pageNumber = 0, title: string | null = null): void {
        this.pages[pageNumber] = page
        if (typeof this.logLocation === "number") {
            if (this.logLocation === pageNumber) {
                this.pages[this.logLocation] = this.stdOut
            }
        }
        this.layout.setPage(this.pages[pageNumber], pageNumber)
        if (title) this.layout.setTitle(title, pageNumber)
        this.refresh()
    }

    /**
     * @description This function is used to set both pages of layout. It also refresh the screen.
     * @param {Array<PageBuilder>} pages - The page to set as home page.
     * @param {string[] | null} [titles] - The titles of the page to overwrite the default titles. Default is null.
     * @memberof ConsoleManager
     * @example CM.setPages([p1, p2], 0)
     */
    public setPages(pages: Array<PageBuilder>, titles: string[] | null = null): void {
        pages.forEach((page, index) => {
            if (typeof this.logLocation === "number" && this.logLocation === index) {
                return
            } else {
                this.pages[index] = page
            }
        })
        this.layout.setPages(this.pages)
        if (titles) this.layout.setTitles(titles)
        this.refresh()
    }

    /**
     * @description This function is used to refresh the screen. It do the following sequence: Clear the screen, draw layout, draw widgets and finally print the screen to the stdOut.
     * @memberof ConsoleManager
     * @example CM.refresh()
     */
    public refresh(): void {
        this.Screen.update()
        this.layout.draw()
        for (const widget in this.controlsCollection) {
            if (this.controlsCollection[widget].isVisible())
                this.controlsCollection[widget].draw()
        }
        for (const widget in this.popupCollection) {
            if (this.popupCollection[widget].isVisible())
                this.popupCollection[widget].draw()
        }
        this.Screen.print()
    }

    /**
     * @description This function is used to show a popup containing all the stdOut of the console.
     * @memberof ConsoleManager
     * @returns the instance of the generated popup.
     * @example CM.showLogPopup()
     */
    public showLogPopup(): CustomPopup {
        return new CustomPopup({
            id: "logPopup", 
            title: "Application Logs", 
            content: this.stdOut, 
            width: this.Screen.width - 12
        }).show()
    }

    /**
     * @description This function is used to log a message. It is used to log messages in the log page. Don't add colors to the message.
     * @param {string} message - The message to log.
     * @memberof ConsoleManager
     * @example CM.log("Hello world")
     */
    public log(message: string): void {
        this.stdOut.addRow({ text: message, color: "white" })
        this.updateLogsConsole(true)
    }

    /** 
     * @description This function is used to log an error message. It is used to log red messages in the log page. Don't add colors to the message.
     * @param {string} message - The message to log.
     * @memberof ConsoleManager
     * @example CM.error("Anomaly detected")
     */
    public error(message: string): void {
        this.stdOut.addRow({ text: message, color: "red" })
        this.updateLogsConsole(true)
    }

    /**
     * @description This function is used to log a warning message. It is used to log yellow messages in the log page. Don't add colors to the message.
     * @param {string} message - The message to log.
     * @memberof ConsoleManager
     * @example CM.warn("Anomaly detected")
     */
    public warn(message: string): void {
        this.stdOut.addRow({ text: message, color: "yellow" })
        this.updateLogsConsole(true)
    }

    /**
     * @description This function is used to log an info message. It is used to log blue messages in the log page. Don't add colors to the message.
     * @param {string} message - The message to log.
     * @memberof ConsoleManager
     * @example CM.info("Anomaly detected")
     */
    public info(message: string): void {
        this.stdOut.addRow({ text: message, color: "blue" })
        this.updateLogsConsole(true)
    }

    /**
     * @description This function is used to update the logs console. It is called by the log functions.
     * @param {boolean} resetCursor - If true, the log scroll index is resetted.
     * @memberof ConsoleManager
     */
    private updateLogsConsole(resetCursor: boolean): void {
        if (resetCursor) {
            this.stdOut.setScrollIndex(0)
        }
        this.refresh()
    }

    /**
     * @description This function is used to override the console.log, console.error, console.warn and console.info functions.
     * @memberof ConsoleManager
     * @example CM.overrideConsole()
     * @example console.log("Hello world") // Will be logged in the log page.
     * @example console.error("Anomaly detected") // Will be logged in the log page.
     * @example console.warn("Anomaly detected") // Will be logged in the log page.
     * @example console.info("Anomaly detected") // Will be logged in the log page.
     * @example console.debug("Anomaly detected") // Will be logged in the log page.
     * @since 1.1.42
     */
    private overrideConsole(): void {
        console.log = (message: string) => {
            this.log(message)
        }
        console.error = (message: string) => {
            this.error(message)
        }
        console.warn = (message: string) => {
            this.warn(message)
        }
        console.info = (message: string) => {
            this.info(message)
        }
        console.debug = (message: string) => {
            this.log(message)
        }
    }
}

export {
    EOL,
    RelativeMouseEvent, MouseEventArgs, MouseEvent,
    PhisicalValues,
    StyledElement, SimplifiedStyledElement, StyleObject,
    PageBuilder, InPageWidgetBuilder,
    Control, ControlConfig,
    Box, BoxConfig, BoxStyle,
    Button, ButtonConfig, ButtonStyle, ButtonKey,
    Progress, ProgressConfig, ProgressStyle, Orientation,
    ConsoleManager,
    OptionPopup, OptionPopupConfig,
    InputPopup, InputPopupConfig,
    ConfirmPopup, ConfirmPopupConfig,
    ButtonPopup, ButtonPopupConfig,
    CustomPopup, PopupConfig,
    FileSelectorPopup, FileSelectorPopupConfig,
}
