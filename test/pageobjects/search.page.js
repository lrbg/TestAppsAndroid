const Helpers = require('./helpers.page');
const fs = require('fs');


class SearchPage {
  /**
   * Detecta la plataforma actual (iOS o Android) y devuelve el localizador correspondiente.
   * @param {string} iOSLocator - Localizador para iOS.
   * @param {string} androidLocator - Localizador para Android.
   * @returns {string} - Localizador para la plataforma actual.
   */
  getPlatformLocator(iOSLocator, androidLocator) {
    return global.platform === 'iOS' ? iOSLocator : androidLocator;
  }

  /**
   * Obtiene un elemento basado en un selector.
   * @param {string} selector - Selector del elemento.
   * @returns {WebdriverIO.Element} - Elemento encontrado.
   */
  getElement(selector) {
    return $(selector);
  }

  /** Selectores de UI */
  get brandImage() {
    return this.getElement(
      this.getPlatformLocator(
        '-ios class chain:**/XCUIElementTypeImage[`index == 1`]',
        'android=new UiSelector().className("android.view.ViewGroup").index(1)'
      )
    );
  }

  get originInput() {
    return this.getElement(
      this.getPlatformLocator(
        `//XCUIElementTypeOther[contains(@label, 'Selecciona tu Origen')]`,
        'android=new UiSelector().className("android.widget.TextView").text("Selecciona tu Origen")'
      )
    );
  }

  get destinationInput() {
    return this.getElement(
      this.getPlatformLocator(
        `//XCUIElementTypeOther[contains(@label, 'Selecciona tu Destino')]`,
        'android=new UiSelector().className("android.widget.TextView").text("Selecciona tu Destino")'
      )
    );
  }

  get todayButton() {
    return this.getElement(
      this.getPlatformLocator(
        '~Hoy',
        'android=new UiSelector().className("android.widget.TextView").text("Hoy")'
      )
    );
  }

  get tomorrowButton() {
    return this.getElement(
      this.getPlatformLocator(
        '~Mañana',
        'android=new UiSelector().className("android.widget.TextView").text("Mañana")'
      )
    );
  }

  get openButton() {
    return this.getElement(
      this.getPlatformLocator(
        '~Abierto',
        'android=new UiSelector().className("android.widget.TextView").text("Abierto")'
      )
    );
  }

  get chooseButton() {
    return this.getElement(
      this.getPlatformLocator(
        '~Elegir',
        'android=new UiSelector().className("android.widget.TextView").text("Elegir")'
      )
    );
  }

  get chooseButtons() {
    return this.getPlatformLocator(
      $$('~Elegir'),
      $$('//android.widget.TextView[@text="Elegir"]')
    );
  }

  get searchButton() {
    return this.getElement(
      this.getPlatformLocator(
        '~BUSCAR',
        'android=new UiSelector().className("android.widget.TextView").text("BUSCAR")'
      )
    );
  }

  get redeemButton() {
    return this.getElement(
      this.getPlatformLocator(
        '~Canjear boleto',
        'android=new UiSelector().className("android.widget.TextView").text("Canjear boleto")'
      )
    );
  }

  get departureDateInput() {
    return this.getElement(
      this.getPlatformLocator(
        '~Fecha de Salida',
        'android=new UiSelector().className("android.widget.TextView").text("Fecha de Salida")'
      )
    );
  }

  get returnButton() {
    return this.getElement(
      this.getPlatformLocator(
        '~Regreso, (Opcional)',
        'android=new UiSelector().className("android.view.ViewGroup").descriptionContains("Regreso, (Opcional)")'
      )
    );
  }

  get closeButton() {
    return this.getElement(
      this.getPlatformLocator(
        '~cerrar',
        'android=new UiSelector().className("android.widget.TextView").text("cerrar")'
      )
    );
  }

  get originSearchInput() {
    return this.getElement(
      this.getPlatformLocator(
        '-ios predicate string:type == "XCUIElementTypeTextField" AND value == "Busca tu origen"',
        'android=new UiSelector().className("android.widget.EditText").text("Busca tu origen")'
      )
    );
  }

  get destinationSearchInput() {
    return this.getElement(
      this.getPlatformLocator(
        '-ios class chain:**/XCUIElementTypeTextField[`name == "Busca tu destino"`]',
        'android=new UiSelector().className("android.widget.EditText").text("Busca tu destino")'
      )
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
   * Selecciona un elemento de día basado en el texto.
   * @param {string} day - El día a seleccionar.
   * @returns {WebdriverIO.Element} - Elemento del día seleccionado.
   */
  selectDay(day) {
    return this.getElement(
      this.getPlatformLocator(
        `-ios class chain:**/XCUIElementTypeStaticText[\`label == "${day}"\`]`,
        `android=new UiSelector().className("android.widget.TextView").text("${day}")`
      )
    );
  }

  /**
   * Selecciona una opción de origen de la lista.
   * @param {string} text - El origen a seleccionar.
   * @returns {WebdriverIO.Element} - Elemento de la opción de origen seleccionada.
   */
  selectOriginOption(text) {
    return this.getElement(
      this.getPlatformLocator(
        `-ios class chain:**/XCUIElementTypeStaticText[\`label == "${text}"\`]`,
        `android=new UiSelector().className("android.widget.TextView").text("${text}")`
      )
    );
  }

  /**
   * Selecciona una opción de destino de la lista.
   * @param {string} text - El destino a seleccionar.
   * @returns {WebdriverIO.Element} - Elemento de la opción de destino seleccionada.
   */
  selectDestinationOption(text) {
    return this.getElement(
      this.getPlatformLocator(
        `-ios class chain:**/XCUIElementTypeStaticText[\`label == "${text}"\`]`,
        `android=new UiSelector().className("android.widget.TextView").text("${text}")`
      )
    );
  }

  /**
   * Obtiene la lista de resultados de búsqueda.
   * @returns {Promise<WebdriverIO.Element[]>} - Lista de elementos de resultados de búsqueda.
   */
  async getSearchResults() {
    return this.chooseButtons;
  }

  /**
   * Busca un viaje para mañana con el origen y destino especificados.
   * Utiliza Helpers.waitObjt() para asegurarse de que los elementos estén listos antes de interactuar.
   * @param {string} origin - Ubicación de origen.
   * @param {string} destination - Ubicación de destino.
   */
  async searchTripTomorrow(origin, destination) {
    try {
      const screenshotBase64 = await driver.takeScreenshot();
      fs.writeFileSync('./screenshots/beginSearch.png', screenshotBase64, 'base64');
      await Helpers.waitObjt(this.originInput);
      await this.originInput.click();
      await Helpers.waitObjt(this.originSearchInput);
      await this.originSearchInput.setValue(origin);
      await Helpers.waitObjt(this.selectOriginOption(origin));
      await this.selectOriginOption(origin).click();
      await Helpers.waitObjt(this.destinationInput);
      await this.destinationInput.click();
      await Helpers.waitObjt(this.destinationSearchInput);
      await this.destinationSearchInput.setValue(destination);
      await Helpers.waitObjt(this.selectDestinationOption(destination));
      await this.selectDestinationOption(destination).click();
      await Helpers.waitObjt(this.tomorrowButton);
      await this.tomorrowButton.click();
      await Helpers.waitObjt(this.searchButton);
      const screenshotBase642 = await driver.takeScreenshot();
      fs.writeFileSync('./screenshots/endSearch.png', screenshotBase642, 'base64');
      await this.searchButton.click();
    } catch (error) {
      console.error('Error al buscar el viaje de mañana:', error);
      throw error;
    }
  }

  /**
   * Busca un viaje de ida y vuelta con el origen y destino especificados.
   * Utiliza Helpers.waitObjt() para asegurarse de que los elementos estén listos antes de interactuar.
   * @param {string} origin - Ubicación de origen.
   * @param {string} destination - Ubicación de destino.
   */
  async searchTripRound(origin, destination) {
    try {
      await Helpers.waitObjt(this.originInput);
      await this.originInput.click();
      await Helpers.waitObjt(this.originSearchInput);
      await this.originSearchInput.setValue(origin);
      await Helpers.waitObjt(this.selectOriginOption(origin));
      await this.selectOriginOption(origin).click();
      await Helpers.waitObjt(this.destinationInput);
      await this.destinationInput.click();
      await Helpers.waitObjt(this.destinationSearchInput);
      await this.destinationSearchInput.setValue(destination);
      await Helpers.waitObjt(this.selectDestinationOption(destination));
      await this.selectDestinationOption(destination).click();
      await Helpers.waitObjt(this.chooseButton);
      await this.chooseButton.click();
      await Helpers.waitObjt(this.returnDateText);
      await this.returnDateText.click();
      await Helpers.waitObjt(this.returnButton);
      await this.returnButton.click();
      await Helpers.waitObjt(this.returnDate2Text);
      await this.returnDate2Text.click();
      await Helpers.waitObjt(this.searchButton);
      await this.searchButton.click();
    } catch (error) {
      console.error('Error al buscar el viaje de ida y vuelta:', error);
      throw error;
    }
  }
}

module.exports = new SearchPage();