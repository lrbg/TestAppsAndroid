exports.config = {
    runner: 'local',
    hostname: '127.0.0.1',
    port: 4723,
    path: '/wd/hub',
    // Configuración de specs
    specs: [
        './test/specs/**/*.js'
    ],
    // Ajuste de instancias máximas
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'emulator-5554',
        'appium:automationName': 'UiAutomator2',
        'appium:app': './apps/gfa22112024.apk',
        'appium:noReset': true,
        'appium:newCommandTimeout': 90000,        // 90 segundos
        'appium:adbExecTimeout': 60000,          // 1 minuto
        'appium:uiautomator2ServerInstallTimeout': 120000, // 2 minutos
        'appium:androidInstallTimeout': 120000,   // 2 minutos
        'appium:autoGrantPermissions': true,
        'appium:unlockType': 'pin',
        'appium:unlockKey': '1111',
        'appium:avd': 'test',                    
        'appium:appWaitActivity': '*',           
        'appium:appWaitDuration': 60000,         // 1 minuto
        'appium:printPageSourceOnFindFailure': true,
        'appium:ensureWebviewsHavePages': true,
        'appium:nativeWebScreenshot': true,
        'appium:enablePerformanceLogging': true
    }],
    logLevel: 'debug',
    waitforTimeout: 45000,          // 45 segundos
    connectionRetryTimeout: 120000, // 2 minutos
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

    // Mejora en el manejo de fallos
    afterTest: async function(test, context, { passed }) {
        if (!passed) {
            // Capturar screenshot
            await browser.takeScreenshot();
            
            // Capturar logs adicionales
            console.log('Estado del dispositivo después del fallo:');
            await browser.getPageSource();
            
            // Información del error
            console.log('Detalles del error:', {
                testName: test.title,
                parent: test.parent,
                duration: test.duration
            });
        }
    },

    // Añadir hooks adicionales
    onPrepare: function () {
        console.log('Iniciando configuración de pruebas...');
    },

    onComplete: function() {
        console.log('Finalizando suite de pruebas...');
    },

    beforeSession: function () {
        console.log('Configurando nueva sesión...');
    },

    afterSession: function () {
        console.log('Finalizando sesión...');
    }
}