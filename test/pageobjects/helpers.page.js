

/**
 * Espera a que un elemento esté visible y habilitado.
 * @param {WebdriverIO.Element} element - El selector del elemento a esperar.
 * @param {number} timeout - Tiempo máximo de espera en milisegundos (por defecto 30000 ms).
 * @param {number} interval - Intervalo entre verificaciones en milisegundos (por defecto 500 ms).
 * @returns {Promise<boolean>} - Devuelve true si el elemento está visible y habilitado, o false si no se encontró.
 */
async function waitObjt(element, timeout = 30000, interval = 500) {
    const startTime = Date.now();

    while ((Date.now() - startTime) < timeout) {
        const isDisplayed = await element.isDisplayed().catch(() => false);
        const isEnabled = await element.isEnabled().catch(() => false);
        if (isDisplayed && isEnabled) {
            return true;
        }
        await browser.pause(interval);
    }
    console.log(`El elemento no estuvo disponible después de ${timeout} ms`);
    return false;
}

module.exports = { waitObjt };
