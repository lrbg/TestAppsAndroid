const Helpers = require('./helpers.page.js');

class Locator {
  /**
   * Obtiene el localizador del modal de la aplicación.
   * @returns {Promise<WebdriverIO.Element>} El elemento del modal.
   */
  async getModalLocator() {
    return global.platform === 'iOS'
      ? $('~modalAccessibilityId')
      : $('android=new UiSelector().className("android.view.ViewGroup").index(1)');
  }

  /**
   * Obtiene el localizador del botón "Continuar" en el modal.
   * @returns {Promise<WebdriverIO.Element>} El elemento del botón "Continuar".
   */
  async getBtnContinue() {
    return global.platform === 'iOS'
      ? $('~continueButton')
      : $('android=new UiSelector().className("android.view.ViewGroup").description("Continuar")');
  }

  /**
   * Obtiene el localizador del modal de GPS.
   * @returns {Promise<WebdriverIO.Element>} El elemento del modal de GPS.
   */
  async getModalGps() {
    return global.platform === 'iOS'
      ? $('~gpsModalId')
      : $('android=new UiSelector().resourceId("com.android.permissioncontroller:id/grant_dialog")');
  }

  /**
   * Obtiene el localizador del botón "Permitir siempre" en el modal de GPS.
   * @returns {Promise<WebdriverIO.Element>} El elemento del botón "Permitir siempre".
   */
  async getBtnAlwaysGps() {
    return global.platform === 'iOS'
      ? $('~allowGpsButton')
      : $('android=new UiSelector().resourceId("com.android.permissioncontroller:id/permission_allow_foreground_only_button")');
  }


  async areModalAndGpsPresent() {
    try {
      const modalLocator = await this.getModalLocator();
      const gpsModalLocator = await this.getModalGps();
      return (await modalLocator.isDisplayed()) || (await gpsModalLocator.isDisplayed());
    } catch (error) {
      console.error('Error checking for modal and GPS permission:', error);
      return false;
    }
  }

  
  /**
   * Maneja el modal y continúa con el permiso de GPS.
   */
  async handleModalAndContinueWithGps() {
    try {
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
    } catch (error) {
      console.error('Error al manejar el modal y continuar con el permiso de GPS:', error);
      throw error;
    }
  }
}

module.exports = new Locator();