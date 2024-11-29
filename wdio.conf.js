exports.config = {
    runner: 'local',
    hostname: '127.0.0.1',
    port: 4723,
    path: '/wd/hub',

    specs: [
        './test/specs/**/*.js'
    ],

    maxInstances: 1,

    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'emulator-5554',
        'appium:automationName': 'UiAutomator2',
        'appium:app': './apps/gfa22112024.apk',  // git remoto
        //'appium:app': '/Users/luisrogelio/Documents/testAppReservamosJS/apk/gfa22112024.apk',  // local
        //'appium:noReset': true,
        'appium:noReset': false,
        'appium:newCommandTimeout': 180000,        // 90 segundos
        'appium:adbExecTimeout': 180000,          // 1 minuto
        'appium:uiautomator2ServerInstallTimeout': 180000, // 2 minutos
        'appium:androidInstallTimeout': 180000,   // 2 minutos
        'appium:autoGrantPermissions': true,
        'appium:unlockType': 'pin',
        'appium:unlockKey': '1111',
        'appium:avd': 'test',  // git remote
        //'appium:avd': 'nightwatch-android-11',  // local 
        //'appium:platformVersion': '11.0',  // Android 30 = Android 11                    
        'appium:appWaitActivity': '*',           
        'appium:appWaitDuration': 180000,         // 1 minuto
        'appium:printPageSourceOnFindFailure': true,
        'appium:ensureWebviewsHavePages': true,
        'appium:nativeWebScreenshot': true,
        'appium:enablePerformanceLogging': true,
        'appium:disableWindowAnimation': true, // Deshabilita animaciones
        'appium:settings[systemBars]': false, // Oculta barra del sistema
        'appium:unicodeKeyboard': true, // Usa teclado unicode
        'appium:resetKeyboard': true // Resetea al teclado predeterminado

    }],

    logLevel: 'debug',
    waitforTimeout: 180000,          // 45 segundos
    connectionRetryTimeout: 180000, // 2 minutos
    connectionRetryCount: 3,
    framework: 'mocha',
    
    reporters: [
        'spec',
        ['allure', {
            outputDir: 'allure-results',
            disableWebdriverStepsReporting: false,
            disableWebdriverScreenshotsReporting: false,
        }]
    ],

    mochaOpts: {
        ui: 'bdd',
        timeout: 300000, // 5 minutos
        retries: 1      // reintentos
    },

    before: function () {
        const brand = process.env.BRAND || 'default';
        console.log(`Iniciando pruebas para marca: ${brand}`);
        console.log('Configuración del entorno:', {
            brand,
            platform: process.env.PLATFORM || 'Android',
            nodeVersion: process.version,
            appiumVersion: process.env.APPIUM_VERSION
        });

        if (!brand) {
            throw new Error('La variable BRAND no está definida.');
        }
        
        global.brand = brand;
        global.platform = process.env.PLATFORM || 'Android';
    },

    afterTest: async function(test, context, { passed }) {
        if (!passed) {
            await browser.takeScreenshot();
            console.log('Estado del dispositivo después del fallo:');
            await browser.getPageSource();
            console.log('Detalles del error:', {
                testName: test.title,
                parent: test.parent,
                duration: test.duration
            });
        }
    },

    onPrepare: function () {
        console.log('Iniciando configuración de pruebas....');
    },

    onComplete: function() {
        console.log('Finalizando suite de pruebas....');
    },

    beforeSession: function () {
        console.log('Configurando nueva sesión....');
    },

    afterSession: function () {
        console.log('Finalizando sesión....');
    }
}