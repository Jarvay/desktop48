module.exports = {
    pluginOptions: {
        electronBuilder: {
            chainWebpackRendererProcess: config => {
                config.plugin('define').tap(args => {
                    args[0]['process.env.FLUENTFFMPEG_COV'] = false;
                    return args;
                });
            },
            builderOptions: {
                'productName': 'Desktop48',
                'appId': 'cn.jarvay.desktop48',
                'asar': true,
                'dmg': {
                    'contents': [
                        {
                            'x': 410,
                            'y': 150,
                            'type': 'link',
                            'path': '/Applications'
                        },
                        {
                            'x': 130,
                            'y': 150,
                            'type': 'file'
                        }
                    ]
                },
                'mac': {
                    'icon': 'public/icons/icon.icns'
                },
                'win': {
                    'icon': 'public/icons/icon.ico'
                },
                'linux': {
                    'icon': 'public/icons'
                },
                'nsis': {
                    'oneClick': false,
                    'allowToChangeInstallationDirectory': true,
                    'perMachine': true,
                    'createDesktopShortcut': true
                }
            },
        }
    }
};
