const Helpers = require('./helpers.page.js');
const allure = require('@wdio/allure-reporter').default;

class Pax {
    get paxDataContainer() {
        return global.platform === 'iOS'
            ? $('~paxContainer')
            : $('android=new UiSelector().className("android.view.ViewGroup").index(0)');
    }

    get nextButton() {
        return global.platform === 'iOS'
            ? $('~nextButton')
            : $('android=new UiSelector().className("android.view.ViewGroup").description("Siguiente")');
    }

    async loadPassengerData(passengersData) {
        await Helpers.waitObjt(this.paxDataContainer);
        for (let i = 0; i < passengersData.length; i++) {
            const passengerData = passengersData[i];
            const passengerBox = await this.findPassengerBox(i + 1);
            await this.scrollUntilVisible(passengerBox);
            await this.fillPassengerDetails(passengerBox, passengerData);
        }

        const scrPaxForm = await browser.takeScreenshot();
        allure.addAttachment('PaxForm', Buffer.from(scrPaxForm, 'base64'), './screenshots/PaxForm.png');

        await this.clickNextButton();
    }

    async findPassengerBox(index) {
        return global.platform === 'iOS'
            ? $(`~passengerBox${index}`)
            : $(`android=new UiSelector().className("android.view.ViewGroup").index(${index})`);
    }

    async fillPassengerDetails(passengerBox, data) {
        const nameField = await passengerBox.$(
            global.platform === 'iOS'
                ? '~nameField'
                : 'android=new UiSelector().className("android.widget.EditText").text("Nombre (s)*")'
        );
        await Helpers.waitObjt(nameField);
        await nameField.setValue(data.name);

        const surnameField = await passengerBox.$(
            global.platform === 'iOS'
                ? '~surnameField'
                : 'android=new UiSelector().className("android.widget.EditText").text("Apellido (s)*")'
        );
        await surnameField.setValue(data.surname);

        const categoryField = await passengerBox.$(
            global.platform === 'iOS'
                ? '~categoryField'
                : 'android=new UiSelector().className("android.view.ViewGroup").index(8)'
        );
        await categoryField.click();
        await this.selectCategory(data.category);
    }
    /**
     * Scrolls down the page to bring the specified element into view.
     * @param {WebdriverIO.Element} element The element to make visible by scrolling.
     */
    async scrollUntilVisible(element) {
        while (!(await element.isDisplayed())) {
            await driver.execute('mobile: scrollGesture', {
                left: 500,
                top: 1500,
                width: 500,
                height: 500,
                direction: 'down',
                percent: 3.0
            });
        }
    }

    async selectCategory(category) {
        const categoryOption = global.platform === 'iOS'
            ? $(`~${category}CategoryOption`)
            : $(`android=new UiSelector().text("${category}")`);
        await Helpers.waitObjt(categoryOption);
        await categoryOption.click();
    }

    async clickNextButton() {
        await this.scrollUntilVisible(this.nextButton);
        await Helpers.waitObjt(this.nextButton);
        await this.nextButton.click();
    }
}

module.exports = new Pax();
