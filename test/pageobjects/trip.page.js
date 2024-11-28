const Helpers = require('./helpers.page');

class SelectTrip {
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
    get tripListContainer() {
        return this.getElement(
            this.getPlatformLocator(
                '-ios class chain:**/XCUIElementTypeScrollView[2]',
                'android=new UiSelector().className("android.widget.ScrollView").index(3)'
            )
        );
    }

    get tripCards() {
        return this.getPlatformLocator(
            $$('-ios class chain:**/XCUIElementTypeOther[`label CONTAINS "Trip card"`]'),
            $$('android=new UiSelector().className("android.view.ViewGroup").clickable(false)')
        );
    }

    get chooseButtons() {
        return this.getPlatformLocator(
            $$('~Elegir'),
            $$('//android.widget.TextView[@text="Elegir"]')
        );
    }

    /**
     * Verifica si hay nuevos viajes después del scroll
     * @param {Array} currentTrips - Lista actual de viajes
     * @param {number} previousLength - Longitud anterior de la lista
     * @returns {boolean} - true si hay nuevos viajes
     */
    hasNewTrips(currentTrips, previousLength) {
        return currentTrips.length > previousLength;
    }

    /**
     * Recolecta todos los viajes disponibles
     * @param {number} maxScrolls - Número máximo de scrolls a realizar
     * @returns {Promise<Array<WebdriverIO.Element>>} Lista de elementos de viaje
     */
    async gatherAllTrips(maxScrolls = 3) {
        try {
            await Helpers.waitObjt(this.tripListContainer);
            const uniqueTrips = new Set();
            let consecutiveSameCount = 0;
            const MAX_RETRIES = 2;
            const SCROLL_PAUSE = 1000;

            for (let scrollCount = 0; scrollCount < maxScrolls; scrollCount++) {
                const currentTrips = await this.tripCards;
                const previousLength = uniqueTrips.size;
                
                currentTrips.forEach(trip => uniqueTrips.add(trip));

                if (!this.hasNewTrips(Array.from(uniqueTrips), previousLength)) {
                    consecutiveSameCount++;
                    if (consecutiveSameCount >= MAX_RETRIES) break;
                } else {
                    consecutiveSameCount = 0;
                }

                await Helpers.scrollDown(1.8); 
                await driver.pause(SCROLL_PAUSE);
            }

            return Array.from(uniqueTrips);
        } catch (error) {
            console.error('Error al recolectar viajes:', error);
            throw new Error(`Error al recolectar viajes: ${error.message}`);
        }
    }

    /**
     * Selecciona un botón "Elegir" aleatorio
     * @returns {Promise<void>}
     */
    async selectRandomChooseButton() {
        try {
            const trips = await this.gatherAllTrips();
            
            if (!trips.length) {
                throw new Error('No se encontraron viajes disponibles');
            }

            const buttons = await this.chooseButtons;
            const randomIndex = Math.floor(Math.random() * buttons.length);
            const selectedButton = buttons[randomIndex];

            await Helpers.waitObjt(selectedButton);
            await selectedButton.click();

            return { success: true, tripsFound: trips.length };
        } catch (error) {
            console.error('Error al seleccionar viaje:', error);
            throw new Error(`Error al seleccionar viaje: ${error.message}`);
        }
    }
}

module.exports = new SelectTrip();
