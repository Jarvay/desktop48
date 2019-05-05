import {app, BrowserWindow, Menu, shell} from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

let template = [{
    label: '帮助',
    role: 'help',
    submenu: [
        {
            label: 'Github',
            click: function () {
                shell.openExternal('https://github.com/Jarvay/desktop48')
            }
        },
        {
            label: '调试',
            click: function () {
                mainWindow.webContents.openDevTools()
            }
        }
    ]
}]

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        show: false,
        height: 820,
        useContentSize: true,
        width: 1280,
        webPreferences: {
            webSecurity: false,
            plugins: true
        }
    })

    mainWindow.loadURL(winURL)

    mainWindow.maximize()
    mainWindow.show()

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

app.on('ready', function () {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    createWindow()
})

app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

app.setAppUserModelId('cn.jarvay.desktop48')
