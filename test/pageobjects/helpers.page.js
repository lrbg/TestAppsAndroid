/**
 * Espera a que un elemento esté visible y habilitado.
 * @param {WebdriverIO.Element} element - El selector del elemento a esperar.
 * @param {Object} [options={}] - Opciones de espera.
 * @param {number} [options.timeout=30000] - Tiempo máximo de espera en milisegundos.
 * @param {number} [options.interval=500] - Intervalo entre verificaciones en milisegundos.
 * @param {boolean} [options.logErrors=true] - Indica si se deben registrar los errores.
 * @returns {Promise<boolean>} - Devuelve true si el elemento está visible y habilitado, o false si no se encontró.
 */
async function waitObjt(element, options = {}) {
  const { timeout = 30000, interval = 500, logErrors = true } = options;
  const startTime = Date.now();

  while ((Date.now() - startTime) < timeout) {
      try {
          const isDisplayed = await element.isDisplayed();
          const isEnabled = await element.isEnabled();
          if (isDisplayed && isEnabled) {
              return true;
          }
      } catch (error) {
          if (logErrors) {
              console.error(`Error al verificar el elemento ${element.selector}:`, error);
          }
      }
      await browser.pause(interval);
  }

  if (logErrors) {
      console.log(`El elemento ${element.selector} no estuvo disponible después de ${timeout} ms`);
  }
  return false;
}

/**
* Realiza scroll hacia abajo con un porcentaje dinámico.
* @param {number} percent - Porcentaje del scroll (1.0 = 100% de la pantalla).
*/
async function scrollDown(percent = 1.8) {
  try {
      await driver.execute('mobile: scrollGesture', {
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          percent,
          direction: 'down',
      });
  } catch (error) {
      console.error('Error al realizar scroll hacia abajo:', error);
      throw new Error(`Scroll down falló: ${error.message}`);
  }
}

/**
* Realiza scroll hacia arriba con un porcentaje dinámico.
* @param {number} percent - Porcentaje del scroll (1.0 = 100% de la pantalla).
*/
async function scrollUp(percent = 1.0) {
  try {
      await driver.execute('mobile: scrollGesture', {
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          percent,
          direction: 'up',
      });
  } catch (error) {
      console.error('Error al realizar scroll hacia arriba:', error);
      throw new Error(`Scroll up falló: ${error.message}`);
  }
}

module.exports = { waitObjt, scrollDown, scrollUp };
