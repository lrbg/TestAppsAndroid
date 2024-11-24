const Helpers = require('./helpers.page.js');

class Locator {
    async getModalLocator() {
        return global.platform === 'iOS'
            ? $('~modalAccessibilityId')
            : $('android=new UiSelector().className("android.view.ViewGroup").index(1)');
    }

    async getBtnContinue() {
        return global.platform === 'iOS'
            ? $('~continueButton')
            : $('android=new UiSelector().className("android.view.ViewGroup").description("Continuar")');
    }

    async getModalGps() {
        return global.platform === 'iOS'
            ? $('~gpsModalId')
            : $('android=new UiSelector().resourceId("com.android.permissioncontroller:id/grant_dialog")');
    }

    async getBtnAlwaysGps() {
        return global.platform === 'iOS'
            ? $('~allowGpsButton')
            : $('android=new UiSelector().resourceId("com.android.permissioncontroller:id/permission_allow_foreground_only_button")');
    }

    async handleModalAndContinueWithGps() {
        const modalLocator = await this.getModalLocator();
        await Helpers.waitObjt(modalLocator);
        const btnContinue = await this.getBtnContinue();
        if (await btnContinue.isDisplayed()) {
            await btnContinue.click();
            const modalGps = await this.getModalGps();
            await Helpers.waitObjt(modalGps);
            if (await modalGps.isDisplayed()) {
                const btnAlwaysGps = await this.getBtnAlwaysGps();
                await btnAlwaysGps.click();
            }
        }
    }
}

module.exports = new Locator();
