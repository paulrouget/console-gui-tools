## Classes

<dl>
<dt><a href="#ConsoleManager">ConsoleManager</a> ⇐ <code>EventEmitter</code></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#Screen">Screen</a> : <code><a href="#Screen">Screen</a></code></dt>
<dd><p>The screen instance</p>
</dd>
<dt><a href="#stdOut">stdOut</a> : <code>PageBuilder</code></dt>
<dd><p>The logs page</p>
</dd>
<dt><a href="#homePage">homePage</a> : <code>PageBuilder</code></dt>      
<dd><p>The main application</p>
</dd>
<dt><a href="#changeLayoutKey">changeLayoutKey</a> : <code>string</code></dt>
<dd><p>The key or combination to switch the selected page</p>
</dd>
<dt><a href="#layout">layout</a> : <code>DoubleLayout</code></dt>
<dd><p>The layout instance</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#ConsoleManager.setKeyListener(id, manageFunction)"> manageFunction)(id, manageFunction)</a></dt>
<dd><p>This function is used to set a key listener for a specific widget. The event listener is stored in the eventListenersContainer object.</p>   
</dd>
<dt><a href="#ConsoleManager.truncate(str, n, useWordBoundary)"> useWordBoundary)(str, n, useWordBoundary)</a></dt>
<dd><p>This function is used to truncate a string adding ... at the end.</p>
</dd>
</dl>

<a name="ConsoleManager"></a>

## ConsoleManager ⇐ <code>EventEmitter</code>
**Kind**: global class
**Extends**: <code>EventEmitter</code>

* [ConsoleManager](#ConsoleManager) ⇐ <code>EventEmitter</code>
    * [new ConsoleManager(options)](#new_ConsoleManager_new)
    * [.addGenericListeners()()](#ConsoleManager.addGenericListeners_new) 
    * [.removeKeyListener(id)](#ConsoleManager.removeKeyListener(id))     
    * [.registerWidget(widget)](#ConsoleManager.registerWidget(widget))   
    * [.unregisterWidget(id)](#ConsoleManager.unregisterWidget(id))       
    * [.setHomePage(page)](#ConsoleManager.setHomePage(page))
    * [.refresh()()](#ConsoleManager.refresh_new)
    * [.log(message)](#ConsoleManager.log(message))
    * [.error(message)](#ConsoleManager.error(message))
    * [.warn(message)](#ConsoleManager.warn(message))
    * [.warn(message)](#ConsoleManager.warn(message))
    * [.updateLogsConsole(reset)](#ConsoleManager.updateLogsConsole(reset))

<a name="new_ConsoleManager_new"></a>

### new ConsoleManager(options)
This is a singleton class, so you can use it like this: const CM = new Con- "exit" when the user wants to exit the application the application      


| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options of the ConsoleManager. |    

**Example**
```js
const CM = new ConsoleManager({ logPageSize: 10, layoutBorder: true, changeLayoutKey: 'ctrl+l', title: 'Console Application' })
```
<a name="ConsoleManager.addGenericListeners_new"></a>

### ConsoleManager.addGenericListeners()()
This function is used to make the ConsoleManager handle the key events wheInside this function are defined all the keys that can be pressed and the actions to do when they are pressed.

**Kind**: static method of [<code>ConsoleManager</code>](#ConsoleManager) 

<a name="ConsoleManager.removeKeyListener(id)"></a>

### ConsoleManager.removeKeyListener(id)
This function is used to remove a key listener for a specific widget. The event listener is removed from the eventListenersContainer object.        

**Kind**: static method of [<code>ConsoleManager</code>](#ConsoleManager) 


| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the widget. |

**Example**
```js
CM.removeKeyListener('inputPopup')
```
<a name="ConsoleManager.registerWidget(widget)"></a>

### ConsoleManager.registerWidget(widget)
This function is used to register a widget. The widget is stored in the widgetsCollection object. That is called by the widgets in show().

**Kind**: static method of [<code>ConsoleManager</code>](#ConsoleManager) 


| Param | Type | Description |
| --- | --- | --- |
| widget | <code>Widget</code> | The widget to register. |

<a name="ConsoleManager.unregisterWidget(id)"></a>

### ConsoleManager.unregisterWidget(id)
This function is used to unregister a widget. The widget is removed from the widgetsCollection object. That is called by the widgets in hide().     

**Kind**: static method of [<code>ConsoleManager</code>](#ConsoleManager) 


| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The id of the widget. |

<a name="ConsoleManager.setHomePage(page)"></a>

### ConsoleManager.setHomePage(page)
This function is used to set the home page. It also refresh the screen.   

**Kind**: static method of [<code>ConsoleManager</code>](#ConsoleManager) 


| Param | Type | Description |
| --- | --- | --- |
| page | <code>PageBuilder</code> | The page to set as home page. |       

**Example**
```js
CM.setHomePage(p)
```
<a name="ConsoleManager.refresh_new"></a>

### ConsoleManager.refresh()()
This function is used to refresh the screen. It do the following sequence: Clear the screen, draw layout, draw widgets and finally print the screen to the stdOut.

**Kind**: static method of [<code>ConsoleManager</code>](#ConsoleManager) 

**Example**
```js
CM.refresh()
```
<a name="ConsoleManager.log(message)"></a>

### ConsoleManager.log(message)
This function is used to log a message. It is used to log messages in the log page. Don't add colors to the message.

**Kind**: static method of [<code>ConsoleManager</code>](#ConsoleManager) 


| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to log. |

**Example**
```js
CM.log("Hello world")
```
<a name="ConsoleManager.error(message)"></a>

### ConsoleManager.error(message)
This function is used to log an error message. It is used to log red messages in the log page. Don't add colors to the message.

**Kind**: static method of [<code>ConsoleManager</code>](#ConsoleManager) 


| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to log. |

**Example**
```js
CM.error("Anomaly detected")
```
<a name="ConsoleManager.warn(message)"></a>

### ConsoleManager.warn(message)
This function is used to log a warning message. It is used to log yellow messages in the log page. Don't add colors to the message.

**Kind**: static method of [<code>ConsoleManager</code>](#ConsoleManager) 


| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to log. |

**Example**
```js
CM.warn("Anomaly detected")
```
<a name="ConsoleManager.warn(message)"></a>

### ConsoleManager.warn(message)
This function is used to log an info message. It is used to log blue messages in the log page. Don't add colors to the message.

**Kind**: static method of [<code>ConsoleManager</code>](#ConsoleManager) 


| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The message to log. |

**Example**
```js
CM.info("Anomaly detected")
```
<a name="ConsoleManager.updateLogsConsole(reset)"></a>

### ConsoleManager.updateLogsConsole(reset)
This function is used to update the logs console. It is called by the log functions.

**Kind**: static method of [<code>ConsoleManager</code>](#ConsoleManager) 


| Param | Type | Description |
| --- | --- | --- |
| reset | <code>boolean</code> | If true, the log scroll index is resetted. |

<a name="Screen"></a>

## Screen : [<code>Screen</code>](#Screen)
The screen instance

**Kind**: global constant
<a name="stdOut"></a>

## stdOut : <code>PageBuilder</code>
The logs page

**Kind**: global constant
<a name="homePage"></a>

## homePage : <code>PageBuilder</code>
The main application

**Kind**: global constant
<a name="changeLayoutKey"></a>

## changeLayoutKey : <code>string</code>
The key or combination to switch the selected page

**Kind**: global constant
<a name="layout"></a>

## layout : <code>DoubleLayout</code>
The layout instance

**Kind**: global constant

# Other documentation

[Components](https://github.com/Elius94/console-gui-tools/blob/dc6094cbc9a9a0f70bc7877804261af129a0748c/Components/README.md#L348).

[Widgets](https://github.com/Elius94/console-gui-tools/blob/dc6094cbc9a9a0f70bc7877804261af129a0748c/Components/Widgets/README.md#L305)

[Layouts](https://github.com/Elius94/console-gui-tools/blob/dc6094cbc9a9a0f70bc7877804261af129a0748c/Components/Layout/README.md)