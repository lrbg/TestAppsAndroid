const Helpers = require('./helpers.page');
const allure = require('@wdio/allure-reporter').default;

// Constants for better maintainability and readability
const CONSTANTS = {
    SCROLL_DELAY: 100,
    MAX_POSSIBLE_SEATS: 50,
    START_SEAT: 1,
    SELECTORS: {
        SEAT_CONTAINER: 'android=new UiSelector().className("android.widget.ScrollView").index(3)',
        CHECKBOX_MESSAGE: '//android.widget.TextView[contains(@text,"Confirmo que el asiento seleccionado será utilizado por una mujer")]',
        INITIAL_BUTTON: '~Elige al menos 1 asiento',
        UPDATED_BUTTON: '~Continuar con 1 asiento'
    },
    SEAT_TYPES: {
        AVAILABLE: 'Asiento Disponible',
        OCCUPIED: 'Asiento Ocupado',
        PINK: 'Asiento Rosa',
        ERROR: 'Error al analizar el asiento.',
        NOT_INTERACTIVE: 'Asiento no interactuable o fuera de vista.',
        NOT_FOUND: 'Asiento no encontrado'
    }
};

class SeatAnalyzer {
    // Constructor privado
    constructor(driver) {
        if (!driver) throw new Error('Driver instance is required to initialize SeatAnalyzer');
        this.driver = driver;
        this.resetSeats();
        this.maxSeatFound = 0;
        this.selectedSeats = [];
    }

    // Implementación del patrón Singleton
    static getInstance(driver) {
        if (!SeatAnalyzer.instance) {
            SeatAnalyzer.instance = new SeatAnalyzer(driver);
        }
        return SeatAnalyzer.instance;
    }

    // Método para reiniciar los estados de los asientos
    resetSeats() {
        this.availableSeats = [];
        this.occupiedSeats = [];
        this.pinkSeats = [];
        this.selectedSeats = [];
    }

    // Métodos de la clase (resto del código original)
    async selectRandomSeats(numberOfSeats) {
        try {
            if (numberOfSeats > this.availableSeats.length) {

                const scrNoSeats = await browser.takeScreenshot();
                allure.addAttachment('img_NoSeats', Buffer.from(scrNoSeats, 'base64'), './screenshots/img_NoSeats.png');

                throw new Error(`No hay suficientes asientos disponibles. Solicitados: ${numberOfSeats}, Disponibles: ${this.availableSeats.length}`);
            }

            const availableSeatsShuffled = [...this.availableSeats].sort(() => Math.random() - 0.5);
            const seatsToSelect = availableSeatsShuffled.slice(0, numberOfSeats);

            
            console.log(`Seleccionando ${numberOfSeats} asientos aleatorios:`, seatsToSelect);



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

    async selectSeat(seatNumber) {
        try {
            await Helpers.waitObjt($(CONSTANTS.SELECTORS.SEAT_CONTAINER));
            const seat = await this.driver.$(`~${seatNumber}`);
            const exists = await seat.isExisting().catch(() => false);
            if (!exists) {
                throw new Error(`El asiento ${seatNumber} no existe`);
            }
            await Helpers.waitObjt(seat);
            if (!(await this.isSeatInteractable(seat))) {
                throw new Error(`El asiento ${seatNumber} no es interactuable`);
            }

            await this.driver.pause(1000);
            
            await seat.click();

            const scrSelectSeats = await browser.takeScreenshot();
            allure.addAttachment('img_SelectSeats', Buffer.from(scrSelectSeats, 'base64'), './screenshots/img_SelectSeats.png');

            console.log(`Asiento ${seatNumber} seleccionado correctamente`);

        } catch (error) {
            console.error(`Error al seleccionar el asiento ${seatNumber}:`, error);
            throw error;
        }
    }

    async analyzeAllSeats() {
        try {
            await Helpers.waitObjt($(CONSTANTS.SELECTORS.SEAT_CONTAINER));
            console.log('Iniciando análisis de asientos...');
            let consecutiveNotFound = 0;
            const MAX_CONSECUTIVE_NOT_FOUND = 3;
            for (let seatNumber = CONSTANTS.START_SEAT; seatNumber <= CONSTANTS.MAX_POSSIBLE_SEATS; seatNumber++) {
                const seatType = await this.analyzeSeat(seatNumber.toString());
                if (seatType === CONSTANTS.SEAT_TYPES.NOT_FOUND) {
                    consecutiveNotFound++;
                    if (consecutiveNotFound >= MAX_CONSECUTIVE_NOT_FOUND) {
                        this.maxSeatFound = seatNumber - MAX_CONSECUTIVE_NOT_FOUND;
                        break;
                    }
                } else {
                    consecutiveNotFound = 0;
                    this.maxSeatFound = seatNumber;
                    this.categorizeSeat(seatNumber.toString(), seatType);
                }
                if (seatNumber % 5 === 0) {
                    console.log(`Analizados ${seatNumber} asientos...`);
                }
            }
            return this.getAnalysisResults();
        } catch (error) {
            console.error('Error durante el análisis de asientos:', error);
            throw new Error('Failed to complete seat analysis');
        }
    }

    categorizeSeat(seatNumber, seatType) {
        const { AVAILABLE, OCCUPIED, PINK } = CONSTANTS.SEAT_TYPES;
        switch (seatType) {
            case AVAILABLE:
                this.availableSeats.push(seatNumber);
                break;
            case OCCUPIED:
                this.occupiedSeats.push(seatNumber);
                break;
            case PINK:
                this.pinkSeats.push(seatNumber);
                break;
        }
    }

    getAnalysisResults() {
        const results = {
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
        console.log('Análisis completado:', results);
        return results;
    }

    async analyzeSeat(seatContentDesc) {
        try {
            await Helpers.waitObjt($(CONSTANTS.SELECTORS.SEAT_CONTAINER));
            const seat = await this.driver.$(`~${seatContentDesc}`);
            const exists = await seat.isExisting().catch(() => false);
            if (!exists) {
                return CONSTANTS.SEAT_TYPES.NOT_FOUND;
            }
            await Helpers.waitObjt(seat);
            if (!(await this.isSeatInteractable(seat))) {
                return CONSTANTS.SEAT_TYPES.NOT_INTERACTIVE;
            }
            await this.performSeatAnalysis(seat);
            const seatType = await this.determineSeatType();
            await this.resetSeatState(seat);
            return seatType;
        } catch (error) {
            console.error(`Error analizando el asiento ${seatContentDesc}:`, error);
            return CONSTANTS.SEAT_TYPES.ERROR;
        }
    }

    async isSeatInteractable(seat) {
        return await seat.isDisplayed().catch(() => false);
    }

    async performSeatAnalysis(seat) {
        await seat.click();
        await this.driver.pause(CONSTANTS.SCROLL_DELAY);
        await this.scrollDown();
        await this.driver.pause(CONSTANTS.SCROLL_DELAY);
    }

    async resetSeatState(seat) {
        await this.scrollUp();
        await this.driver.pause(CONSTANTS.SCROLL_DELAY);
        await seat.click();
        await this.driver.pause(CONSTANTS.SCROLL_DELAY);
    }

    async determineSeatType() {
        const { SELECTORS, SEAT_TYPES } = CONSTANTS;
        const isPinkSeat = await this.driver.$(SELECTORS.CHECKBOX_MESSAGE).isDisplayed().catch(() => false);
        if (isPinkSeat) return SEAT_TYPES.PINK;
        const isOccupied = await this.driver.$(SELECTORS.INITIAL_BUTTON).isDisplayed().catch(() => false);
        if (isOccupied) return SEAT_TYPES.OCCUPIED;
        const continueButton = await this.driver.$(SELECTORS.UPDATED_BUTTON);
        const isAvailable = await continueButton.getAttribute('enabled') === 'true';
        return isAvailable ? SEAT_TYPES.AVAILABLE : SEAT_TYPES.OCCUPIED;
    }

    async scrollDown() {
        await this.executeScroll('down', { left: 0, top: 0, width: 1080, height: 1920, percent: 1.8 });
    }

    async scrollUp() {
        await this.executeScroll('up', { left: 500, top: 1500, width: 500, height: 500, percent: 1 });
    }

    async executeScroll(direction, params) {
        await this.driver.execute('mobile: scrollGesture', { ...params, direction });
    }
}

module.exports = SeatAnalyzer;
