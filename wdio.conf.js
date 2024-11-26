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
        'appium:app': './apps/gfa22112024.apk',
        'appium:noReset': true,
        'appium:newCommandTimeout': 180000,
        'appium:adbExecTimeout': 180000,
        'appium:uiautomator2ServerInstallTimeout': 180000,
        'appium:androidInstallTimeout': 180000,
        'appium:autoGrantPermissions': true,
        'appium:unlockType': 'pin',
        'appium:unlockKey': '1111',
        'appium:avd': 'test',
        'appium:platformVersion': '11.0',
        'appium:appWaitActivity': '*',
        'appium:appWaitDuration': 180000,
        'appium:printPageSourceOnFindFailure': true,
        'appium:ensureWebviewsHavePages': true,
        'appium:nativeWebScreenshot': true,
        'appium:enablePerformanceLogging': true,
        // Configuración para grabación de video
        'appium:recordVideo': true,
        'appium:videoType': 'mpeg4',
        'appium:videoQuality': '1',
        'appium:videoFps': '10',
        'appium:videoScale': '1'
    }],
 
    logLevel: 'debug',
    waitforTimeout: 180000,
    connectionRetryTimeout: 180000,
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
        timeout: 300000,
        retries: 1
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
            // Screenshot
            const screenshot = await browser.takeScreenshot();
            await allure.addAttachment('Screenshot', Buffer.from(screenshot, 'base64'), 'image/png');
            
            // Video
            try {
                const video = await browser.getRecordingPath();
                await allure.addAttachment('Video', {
                    content: video,
                    name: `${test.title}.mp4`,
                    type: 'video/mp4'
                });
            } catch (e) {
                console.log('Error al adjuntar video:', e);
            }
            
            // Logs
            console.log('Estado del dispositivo después del fallo:');
            const pageSource = await browser.getPageSource();
            await allure.addAttachment('Page Source', pageSource, 'text/plain');
            
            console.log('Detalles del error:', {
                testName: test.title,
                parent: test.parent,
                duration: test.duration
            });
        }
    },
 
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