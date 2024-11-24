const Helpers = require('./helpers.page.js');

class SplashScreen {
    get iconStepOne() {
        return global.platform === 'iOS'
            ? $('~iconStepOne')
            : $('android=new UiSelector().className("android.widget.ImageView").index(1)');
    }

    get logoBrand() {
        return global.platform === 'iOS'
            ? $('~logoBrand')
            : $('android=new UiSelector().className("android.widget.ImageView").index(0)');
    }

    get txtStepOne() {
        return global.platform === 'iOS'
            ? $('~stepOneText')
            : $('android=new UiSelector().className("android.widget.TextView").index(2)');
    }

    get btnNextStepOne() {
        return global.platform === 'iOS'
            ? $('~btnNextStepOne')
            : $('android=new UiSelector().className("android.widget.TextView").text("Siguiente").index(0)');
    }

    get btnNextStepTwo() {
        return global.platform === 'iOS'
            ? $('~btnNextStepTwo')
            : $('android=new UiSelector().className("android.widget.TextView").text("Siguiente").index(0)');
    }

    get btnNextStepThree() {
        return global.platform === 'iOS'
            ? $('~btnCloseGuide')
            : $('android=new UiSelector().className("android.widget.TextView").text("Cerrar guía rápida")');
    }

    async validateAndCaptureElements() {
        if (!(await this.iconStepOne.isDisplayed())) {
            return;
        }
        await Helpers.waitObjt(this.btnNextStepOne);
        await this.btnNextStepOne.click();
        await Helpers.waitObjt(this.btnNextStepTwo);
        await this.btnNextStepTwo.click();
        await Helpers.waitObjt(this.btnNextStepThree);
        await this.btnNextStepThree.click();
    }
}

module.exports = new SplashScreen();
