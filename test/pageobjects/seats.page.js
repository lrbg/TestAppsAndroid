const Helpers = require('./helpers.page');
const allure = require('@wdio/allure-reporter').default;


class SeatsPage {
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
  get seatContainer() {
    return this.getElement(
      this.getPlatformLocator(
        '-ios class chain:**/XCUIElementTypeScrollView[2]',
        'android=new UiSelector().className("android.widget.ScrollView").index(3)'
      )
    );
  }

  get womanSeatCheckbox() {
    return this.getElement(
      this.getPlatformLocator(
        '//XCUIElementTypeStaticText[contains(@label,"Confirmo que el asiento seleccionado será utilizado por una mujer")]',
        '//android.widget.TextView[contains(@text,"Confirmo que el asiento seleccionado será utilizado por una mujer")]'
      )
    );
  }

  get initialButton() {
    return this.getElement(
      this.getPlatformLocator(
        '~Elige al menos 1 asiento',
        '~Elige al menos 1 asiento'
      )
    );
  }

  get continueButton() {
    return this.getElement(
      this.getPlatformLocator(
        '~Continue',
        'android=new UiSelector().descriptionContains("Continuar con")'
      )
    );
  }

  /**
   * Constructor de la clase
   * @param {number} maxSeats - Número máximo de asientos a analizar
   * @param {number} scrollDelay - Delay entre acciones de scroll
   */
  constructor(maxSeats = 50, scrollDelay = 100) {
    this.maxSeats = maxSeats;
    this.scrollDelay = scrollDelay;
    this.resetSeatsState();
  }

  /**
   * Reinicia el estado de los asientos
   */
  resetSeatsState() {
    this.availableSeats = [];
    this.occupiedSeats = [];
    this.pinkSeats = [];
    this.selectedSeats = [];
    this.maxSeatFound = 0;
  }

  /**
   * Obtiene un asiento específico por número
   * @param {string} seatNumber - Número del asiento
   * @returns {WebdriverIO.Element} - Elemento del asiento
   */
  getSeat(seatNumber) {
    return this.getElement(`~${seatNumber}`);
  }

  /**
   * Verifica si un asiento es interactuable
   * @param {WebdriverIO.Element} seat - Elemento del asiento
   * @returns {Promise<boolean>} - true si el asiento es interactuable
   */
  async isSeatInteractable(seat) {
    try {
      await Helpers.waitObjt(seat);
      return await seat.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Analiza todos los asientos disponibles
   * @returns {Promise<Object>} - Resultados del análisis
   */
  async analyzeAllSeats() {
    try {
      await Helpers.waitObjt(this.seatContainer);
      console.log('Iniciando análisis de asientos...');

      const srcTemplateSeats = await browser.takeScreenshot();
      allure.addAttachment('img_Seats', Buffer.from(srcTemplateSeats, 'base64'), './screenshots/img_Seats.png');

      let consecutiveNotFound = 0;
      const MAX_CONSECUTIVE_NOT_FOUND = 3;

      for (let seatNumber = 1; seatNumber <= this.maxSeats; seatNumber++) {
        const seatType = await this.analyzeSeat(seatNumber.toString());
        
        if (seatType === 'NOT_FOUND') {
          consecutiveNotFound++;
          if (consecutiveNotFound >= MAX_CONSECUTIVE_NOT_FOUND) {
            this.maxSeatFound = seatNumber - MAX_CONSECUTIVE_NOT_FOUND;
            break;
          }
        } else {
          consecutiveNotFound = 0;
          this.maxSeatFound = seatNumber;
          this.categorizeAndStoreSeat(seatNumber.toString(), seatType);
        }
      }

      return this.getAnalysisResults();
    } catch (error) {
      console.error('Error durante el análisis de asientos:', error);
      throw error;
    }
  }

  /**
   * Analiza un asiento individual
   * @param {string} seatNumber - Número del asiento
   * @returns {Promise<string>} - Tipo de asiento encontrado
   */
  async analyzeSeat(seatNumber) {
    try {
      await driver.pause(1000);
      const seat = this.getSeat(seatNumber);
      
      if (!(await seat.isExisting())) {
        return 'NOT_FOUND';
      }

      if (!(await this.isSeatInteractable(seat))) {
        return 'NOT_INTERACTIVE';
      }

      await this.performSeatCheck(seat);
      const seatType = await this.determineSeatType();
      await this.resetSeatCheck(seat);
      

      return seatType;
    } catch (error) {
      console.error(`Error analizando asiento ${seatNumber}:`, error);
      return 'ERROR';
    }
  }

  /**
   * Realiza la verificación de un asiento
   * @param {WebdriverIO.Element} seat - Elemento del asiento
   */
  async performSeatCheck(seat) {
    await seat.click();
    await driver.pause(this.scrollDelay);
    await this.scrollDown();
    await driver.pause(this.scrollDelay);
  }

  /**
   * Resetea el estado después de verificar un asiento
   * @param {WebdriverIO.Element} seat - Elemento del asiento
   */
  async resetSeatCheck(seat) {
    await this.scrollUp();
    await driver.pause(this.scrollDelay);
    await seat.click();
    await driver.pause(this.scrollDelay);
  }

  /**
   * Determina el tipo de asiento basado en los elementos visibles
   * @returns {Promise<string>} - Tipo de asiento
   */
  async determineSeatType() {
    const isPinkSeat = await this.womanSeatCheckbox.isDisplayed().catch(() => false);
    if (isPinkSeat) return 'PINK';

    const isOccupied = await this.initialButton.isDisplayed().catch(() => false);
    if (isOccupied) return 'OCCUPIED';

    const continueEnabled = await this.continueButton.getAttribute('enabled') === 'true';
    return continueEnabled ? 'AVAILABLE' : 'OCCUPIED';
  }

  /**
   * Categoriza y almacena un asiento según su tipo
   * @param {string} seatNumber - Número del asiento
   * @param {string} seatType - Tipo de asiento
   */
  categorizeAndStoreSeat(seatNumber, seatType) {
    switch (seatType) {
      case 'AVAILABLE':
        this.availableSeats.push(seatNumber);
        break;
      case 'OCCUPIED':
        this.occupiedSeats.push(seatNumber);
        break;
      case 'PINK':
        this.pinkSeats.push(seatNumber);
        break;
    }
  }

  /**
   * Obtiene los resultados del análisis
   * @returns {Object} - Resultados del análisis
   */
  getAnalysisResults() {
    return {
      maxSeatFound: this.maxSeatFound,
      availableSeats: this.availableSeats,
      occupiedSeats: this.occupiedSeats,
      pinkSeats: this.pinkSeats,
      selectedSeats: this.selectedSeats,
      summary: {
        totalSeats: this.maxSeatFound,
        available: this.availableSeats.length,
        occupied: this.occupiedSeats.length,
        pink: this.pinkSeats.length,
        selected: this.selectedSeats.length
      }
    };
  }

  /**
   * Selecciona asientos aleatorios disponibles
   * @param {number} numberOfSeats - Número de asientos a seleccionar
   * @returns {Promise<string[]>} - Array con los asientos seleccionados
   */
  async selectRandomSeats(numberOfSeats) {
    try {
      if (numberOfSeats > this.availableSeats.length) {
        throw new Error(`No hay suficientes asientos disponibles. Solicitados: ${numberOfSeats}, Disponibles: ${this.availableSeats.length}`);
      }

      const availableSeatsShuffled = [...this.availableSeats].sort(() => Math.random() - 0.5);
      const seatsToSelect = availableSeatsShuffled.slice(0, numberOfSeats);

      for (const seatNumber of seatsToSelect) {
        await this.selectSeat(seatNumber);
        this.selectedSeats.push(seatNumber);
      }

      return this.selectedSeats;
    } catch (error) {
      console.error('Error al seleccionar asientos aleatorios:', error);
      throw error;
    }
  }

  /**
   * Selecciona un asiento específico
   * @param {string} seatNumber - Número de asiento a seleccionar
   */
  async selectSeat(seatNumber) {
    try {
      await Helpers.waitObjt(this.seatContainer);
      const seat = this.getSeat(seatNumber);
      
      if (!(await seat.isExisting())) {
        throw new Error(`El asiento ${seatNumber} no existe`);
      }

      if (!(await this.isSeatInteractable(seat))) {
        throw new Error(`El asiento ${seatNumber} no es interactuable`);
      }

      await seat.click();

      await this.driver.pause(1000);
      const srcSeatSelected = await browser.takeScreenshot();
      allure.addAttachment('img_SeatSelected', Buffer.from(srcSeatSelected, 'base64'), './screenshots/img_SeatSelected.png');


      await Helpers.waitObjt(this.continueButton);
      await this.continueButton.click();
    } catch (error) {
      console.error(`Error al seleccionar el asiento ${seatNumber}:`, error);
      throw error;
    }
  }

  /**
   * Realiza scroll hacia abajo
   */
  async scrollDown() {
    await driver.execute('mobile: scrollGesture', {
      left: 0,
      top: 0,
      width: 1080,
      height: 1920,
      percent: 1.8,
      direction: 'down'
    });
  }

  /**
   * Realiza scroll hacia arriba
   */
  async scrollUp() {
    await driver.execute('mobile: scrollGesture', {
      left: 500,
      top: 1500,
      width: 500,
      height: 500,
      percent: 1,
      direction: 'up'
    });
  }
}

module.exports = new SeatsPage();