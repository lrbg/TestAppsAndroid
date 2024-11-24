const Helpers = require('./helpers.page.js');
const isIOS = driver.isIOS;

class SelectTrip {
    /**
     * Retrieves an element based on a selector.
     * @param {string} selector - Selector of the element.
     * @returns {WebdriverIO.Element} - Found element.
     */
    getElement(selector) {
        return $(selector);
    }

    /** UI Selectors */
    get chooseButtons() {
        return isIOS
            ? $$('~Elegir')
            : $$('//android.widget.TextView[@text="Elegir"]');
    }

    /**
     * Scrolls down to load more trips and gathers the "Elegir" buttons.
     * @param {number} scrollCount - Number of scrolls to perform.
     * @returns {Promise<Array<WebdriverIO.Element>>} List of "Elegir" button elements.
     */
    async gatherAllChooseButtons(scrollCount = 3) {
        let allButtons = [];
        for (let i = 0; i < scrollCount; i++) {
            const buttons = await this.chooseButtons;
            allButtons = [...allButtons, ...buttons];
            await this.scrollDown();
        }
        return allButtons;
    }

    /**
     * Selects a random "Elegir" button from the list and clicks it.
     * @returns {Promise<void>}
     */
    async selectRandomChooseButton() {
        const chooseButtons = await this.gatherAllChooseButtons();
        const randomIndex = Math.floor(Math.random() * chooseButtons.length);
        const randomButton = chooseButtons[randomIndex];
        await Helpers.waitObjt(randomButton);
        await randomButton.click();
    }

    /**
     * Scrolls down to load more elements.
     * @returns {Promise<void>}
     */
    async scrollDown() {
        await driver.execute('mobile: scrollGesture', {
            left: 500,
            top: 1500,
            width: 500,
            height: 500,
            direction: 'down',
            percent: 1.0
        });
    }
}

module.exports = new SelectTrip();
