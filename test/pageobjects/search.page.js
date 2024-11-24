const Helpers = require('./helpers.page.js');
const isIOS = driver.isIOS;

class SearchPage {
    /**
     * Retrieves an element based on a selector.
     * @param {string} selector - Selector of the element.
     * @returns {WebdriverIO.Element} - Found element.
     */
    getElement(selector) {
        return $(selector);
    }

    /** UI Selectors */
    get brandImage() {
        return this.getElement(
            isIOS
                ? '-ios class chain:**/XCUIElementTypeImage[`index == 1`]'
                : 'android=new UiSelector().className("android.view.ViewGroup").index(1)'
        );
    }

    get originInput() {
        return this.getElement(
            isIOS
                ? `//XCUIElementTypeOther[contains(@label, 'Selecciona tu Origen')]`
                : 'android=new UiSelector().className("android.widget.TextView").text("Selecciona tu Origen")'
        );
    }

    get destinationInput() {
        return this.getElement(
            isIOS
                ? `//XCUIElementTypeOther[contains(@label, 'Selecciona tu Destino')]`
                : 'android=new UiSelector().className("android.widget.TextView").text("Selecciona tu Destino")'
        );
    }

    get todayButton() {
        return this.getElement(
            isIOS
                ? '~Hoy'
                : 'android=new UiSelector().className("android.widget.TextView").text("Hoy")'
        );
    }

    get tomorrowButton() {
        return this.getElement(
            isIOS
                ? '~Mañana'
                : 'android=new UiSelector().className("android.widget.TextView").text("Mañana")'
        );
    }

    get openButton() {
        return this.getElement(
            isIOS
                ? '~Abierto'
                : 'android=new UiSelector().className("android.widget.TextView").text("Abierto")'
        );
    }

    get chooseButton() {
        return this.getElement(
            isIOS
                ? '~Elegir'
                : 'android=new UiSelector().className("android.widget.TextView").text("Elegir")'
        );
    }

    get searchButton() {
        return this.getElement(
            isIOS
                ? '~BUSCAR'
                : 'android=new UiSelector().className("android.widget.TextView").text("BUSCAR")'
        );
    }

    get redeemButton() {
        return this.getElement(
            isIOS
                ? '~Canjear boleto'
                : 'android=new UiSelector().className("android.widget.TextView").text("Canjear boleto")'
        );
    }

    get departureDateInput() {
        return this.getElement(
            isIOS
                ? '~Fecha de Salida'
                : 'android=new UiSelector().className("android.widget.TextView").text("Fecha de Salida")'
        );
    }

    get returnButton() {
        return this.getElement(
            isIOS
                ? '~Regreso, (Opcional)'
                : 'android=new UiSelector().className("android.view.ViewGroup").descriptionContains("Regreso, (Opcional)")'
        );
    }

    get closeButton() {
        return this.getElement(
            isIOS
                ? '~cerrar'
                : 'android=new UiSelector().className("android.widget.TextView").text("cerrar")'
        );
    }

    get originSearchInput() {
        return this.getElement(
            isIOS
                ? '-ios predicate string:type == "XCUIElementTypeTextField" AND value == "Busca tu origen"'
                : 'android=new UiSelector().className("android.widget.EditText").text("Busca tu origen")'
        );
    }

    get destinationSearchInput() {
        return this.getElement(
            isIOS
                ? '-ios class chain:**/XCUIElementTypeTextField[`name == "Busca tu destino"`]'
                : 'android=new UiSelector().className("android.widget.EditText").text("Busca tu destino")'
        );   
    }

    get returnDateText() {
        const tomorrowDay = this.getTomorrowDay();
        return this.getElement(
            `android=new UiSelector().className("android.widget.TextView").text("${tomorrowDay}")`
        );
    }

    get returnDate2Text() {
        const dayAfterTomorrow = this.getDayAfterTomorrow();
        return this.getElement(
            `android=new UiSelector().className("android.widget.TextView").text("${dayAfterTomorrow}")`
        );
    }


    getTomorrowDay() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return `${tomorrow.getDate()}`;
    }

    getDayAfterTomorrow() {
        const dayAfterTomorrow = new Date();
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        return `${dayAfterTomorrow.getDate()}`;
    }
    

    /**
     * Selects a day element based on text.
     * @param {string} day - The day to select.
     * @returns {WebdriverIO.Element} - Day element.
     */
    selectDay(day) {
        return this.getElement(
            isIOS
                ? `-ios class chain:**/XCUIElementTypeStaticText[\`label == "${day}"\`]`
                : `android=new UiSelector().className("android.widget.TextView").text("${day}")`
        );
    }

    /**
     * Selects an option from the origin list.
     * @param {string} text - The origin to select.
     * @returns {WebdriverIO.Element} - Selected origin option.
     */
    selectOriginOption(text) {
        return this.getElement(
            isIOS
                ? `-ios class chain:**/XCUIElementTypeStaticText[\`label == "${text}"\`]`
                : `android=new UiSelector().className("android.widget.TextView").text("${text}")`
        );
    }

    /**
     * Selects an option from the destination list.
     * @param {string} text - The destination to select.
     * @returns {WebdriverIO.Element} - Selected destination option.
     */
    selectDestinationOption(text) {
        return this.getElement(
            isIOS
                ? `-ios class chain:**/XCUIElementTypeStaticText[\`label == "${text}"\`]`
                : `android=new UiSelector().className("android.widget.TextView").text("${text}")`
        );
    }

    /**
     * Searches for a trip tomorrow with specified origin and destination.
     * Uses waitObjt from Helpers to ensure elements are ready before interacting.
     * @param {string} origin - Origin location.
     * @param {string} destination - Destination location.
     */
    async searchTripTomorrow(origin, destination) {
        await Helpers.waitObjt(this.originInput, 1000);
        await this.originInput.click();
        await Helpers.waitObjt(this.originSearchInput, 1000);
        await this.originSearchInput.setValue(origin);
        await Helpers.waitObjt(this.selectOriginOption(origin), 1000);
        await this.selectOriginOption(origin).click();
        await Helpers.waitObjt(this.destinationInput, 1000);
        await this.destinationInput.click();
        await Helpers.waitObjt(this.destinationSearchInput, 1000);
        await this.destinationSearchInput.setValue(destination);
        await Helpers.waitObjt(this.selectDestinationOption(destination), 1000);
        await this.selectDestinationOption(destination).click();
        await Helpers.waitObjt(this.tomorrowButton, 1000);
        await this.tomorrowButton.click();
        await Helpers.waitObjt(this.searchButton, 1000);
        await this.searchButton.click();
    }


        /**
     * Searches for a trip round with specified origin and destination.
     * Uses waitObjt from Helpers to ensure elements are ready before interacting.
     * @param {string} origin - Origin location.
     * @param {string} destination - Destination location.
     */
        async searchTripRound(origin, destination) {
            await Helpers.waitObjt(this.originInput, 1000);
            await this.originInput.click();
            await Helpers.waitObjt(this.originSearchInput, 1000);
            await this.originSearchInput.setValue(origin);
            await Helpers.waitObjt(this.selectOriginOption(origin), 1000);
            await this.selectOriginOption(origin).click();
            await Helpers.waitObjt(this.destinationInput, 1000);
            await this.destinationInput.click();
            await Helpers.waitObjt(this.destinationSearchInput, 1000);
            await this.destinationSearchInput.setValue(destination);
            await Helpers.waitObjt(this.selectDestinationOption(destination), 1000);
            await this.selectDestinationOption(destination).click();
            await Helpers.waitObjt(this.chooseButton, 1000);
            await this.chooseButton.click();
            await Helpers.waitObjt(this.returnDateText, 1000);
            await this.returnDateText.click();
            await Helpers.waitObjt(this.returnButton, 1000);
            await this.returnButton.click();
            await Helpers.waitObjt(this.returnDate2Text, 1000);
            await this.returnDate2Text.click();
            await Helpers.waitObjt(this.searchButton, 1000);
            await this.searchButton.click();
        }


}

module.exports = new SearchPage();
