const Helpers = require('./helpers.page.js');
const isIOS = driver.isIOS;
const allure = require('@wdio/allure-reporter').default;

class Insurance {
    /** UI Selectors */
    
    get insuranceModal() {
        return isIOS
            ? $('~insuranceModal')
            : $('android=new UiSelector().className("android.widget.TextView").text("¿Quieres utilizar la cobertura adicional?")');
    }

    get btnTrueInsurance() {
        return isIOS
            ? $('~btnTrueInsurance')
            : $('android=new UiSelector().className("android.view.ViewGroup").description("Sí, agregar")');
    }

    get btnFalseInsurance() {
        return isIOS
            ? $('~btnFalseInsurance')
            : $('android=new UiSelector().className("android.view.ViewGroup").description("No, gracias")');
    }

    /**
     * Selects the insurance option based on the boolean value.
     * @param {boolean} addInsurance - true to add insurance, false to decline.
     */
    async selectInsuranceOption(addInsurance) {
        const modalVisible = await Helpers.waitObjt(this.insuranceModal);
        if (modalVisible) {
            if (addInsurance) {
                const btnAddVisible = await Helpers.waitObjt(this.btnTrueInsurance);
                if (btnAddVisible) {
                    await this.btnTrueInsurance.click();
                    const scrInsurance = await browser.takeScreenshot();
                    allure.addAttachment('TrueInsurance', Buffer.from(scrInsurance, 'base64'), './screenshots/TrueInsurance.png');
                }
            } else {
                const btnDeclineVisible = await Helpers.waitObjt(this.btnFalseInsurance);
                if (btnDeclineVisible) {
                    await this.btnFalseInsurance.click();
                    const scrFalseInsurance = await browser.takeScreenshot();
                    allure.addAttachment('FalseInsurance', Buffer.from(scrFalseInsurance, 'base64'), './screenshots/FalseInsurance.png');
                }
            }
        }
    }
}

module.exports = new Insurance();
