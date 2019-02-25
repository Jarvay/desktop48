import {app, BrowserWindow} from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if(process.env.NODE_ENV !== 'development'){
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

function createWindow(){
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height:820,
        useContentSize:true,
        width:1340,
        webPreferences:{
            webSecurity:false,
            plugins:true
        }
    })

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

const path = require('path')
let pluginName
switch(process.platform){
    case 'win32':
        pluginName = 'pepflashplayer.dll'
        break
    case 'darwin':
        pluginName = 'PepperFlashPlayer.plugin'
        break
    case 'linux':
        pluginName = 'libpepflashplayer.so'
        break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join(__static, pluginName))

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
    if(mainWindow === null){
        createWindow()
    }
})
