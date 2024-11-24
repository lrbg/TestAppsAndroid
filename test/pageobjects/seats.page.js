const Helpers = require('./helpers.page.js');
const isIOS = driver.isIOS;

class Seats {
    /** UI Selectors */
    get seatContainer() {
        return isIOS
            ? $('~seatScrollView')
            : $('android=new UiSelector().className("android.widget.ScrollView").index(3)');
    }

    get continueButton() {
        return isIOS
            ? $('~Continue')
            : $('android=new UiSelector().descriptionContains("Continuar con")');
    }

    get seatElements() {
        return isIOS
            ? $$('~seatViewGroup')
            : $$('android=new UiSelector().className("android.view.ViewGroup").clickable(true).enabled(true).focusable(true)');
    }

    get objPink() {
        return isIOS
            ? $('~pinkSeatConfirmation')
            : $('android=new UiSelector().className("android.widget.TextView").textContains("Confirmo que el asiento seleccionado será utilizado por una mujer")');
    }

    get chkPink() {
        return isIOS
            ? $('~checkboxPink')
            : $('android=new UiSelector().className("android.widget.ImageView").bounds("[79,1627][142,1690]")');
    }

    get btnNoSetSeats() {
        return isIOS
            ? $('~selectAtLeastOneSeat')
            : $('android=new UiSelector().className("android.view.ViewGroup").description("Elige al menos 1 asiento")');
    }

    /**
     * Wait for the seat container to be displayed and select the required seats.
     * @param {number} numberOfSeatsToSelect - Number of seats to select.
     */
    async processSeats(numberOfSeatsToSelect) {
        await Helpers.waitObjt(this.seatContainer);

        let seats = await this.getAllSeats();
        let attempts = 0;

        while (numberOfSeatsToSelect > 0 && seats.length > 0 && attempts < 3) {
            const availableSeats = seats.filter(seat => seat.status === 'disponible');
            if (availableSeats.length === 0) {
                await this.scrollDown();
                seats = await this.getAllSeats();
                attempts++;
                continue;
            }

            const randomIndex = Math.floor(Math.random() * availableSeats.length);
            const selectedSeat = availableSeats.splice(randomIndex, 1)[0];
            const isSeatStillAvailable = await this.verifySeatAvailability(selectedSeat);

            if (isSeatStillAvailable) {
                await this.clickSeat(selectedSeat);
                numberOfSeatsToSelect--;
            } else {
                seats = await this.getAllSeats();
            }
        }

        if (await this.objPink.isDisplayed()) {
            await Helpers.waitObjt(this.objPink);
            await this.seatContainer.click();
            await this.objPink.click();
        }
        if (await this.btnNoSetSeats.isDisplayed()) {
            await Helpers.waitObjt(this.btnNoSetSeats, 10000);
            while (numberOfSeatsToSelect > 0 && seats.length > 0 && attempts < 3) {
                const availableSeats = seats.filter(seat => seat.status === 'disponible');
                if (availableSeats.length === 0) {
                    await this.scrollDown();
                    seats = await this.getAllSeats();
                    attempts++;
                    continue;
                }
                const randomIndex = Math.floor(Math.random() * availableSeats.length);
                const selectedSeat = availableSeats.splice(randomIndex, 1)[0];
                const isSeatStillAvailable = await this.verifySeatAvailability(selectedSeat);
                if (isSeatStillAvailable) {
                    await this.clickSeat(selectedSeat);
                    numberOfSeatsToSelect--;
                } else {
                    seats = await this.getAllSeats();
                }
            }
        } else {
            await Helpers.waitObjt(this.continueButton);
            await this.seatContainer.click();
            await this.continueButton.click();
        }
    
    }

    /**
     * Verifies if the seat is still available.
     * @param {Object} seat - Seat object to verify.
     * @returns {Promise<boolean>} - True if seat is available, otherwise false.
     */
    async verifySeatAvailability(seat) {
        const seatElement = await $(`android=new UiSelector().description("${seat.seatNumber}")`);
        const contentDesc = await seatElement.getAttribute('content-desc');
        return contentDesc && parseInt(contentDesc) % 2 === 1; // Available if odd-numbered
    }

    /**
     * Obtains all seats with their properties.
     * @returns {Promise<Array>} - List of seat objects.
     */
    async getAllSeats() {
        const seats = [];
        const seenSeats = new Set();
        let lastCount = 0;

        while (true) {
            for (let seat of await this.seatElements) {
                const contentDesc = await seat.getAttribute('content-desc');
                const bounds = await seat.getAttribute('bounds');
                const isDisplayed = await seat.isDisplayed();

                if (contentDesc && isDisplayed && !seenSeats.has(contentDesc)) {
                    seenSeats.add(contentDesc);
                    const seatNumber = parseInt(contentDesc);
                    const status = seatNumber % 2 === 1 ? 'disponible' : 'ocupado';
                    seats.push({ seatNumber, bounds, status });
                }
            }

            if (seats.length === lastCount) break;
            lastCount = seats.length;
            await this.scrollDown();
        }

        return seats;
    }

    /**
     * Scrolls down once to load more seats.
     */
    async scrollDown() {
        await driver.execute('mobile: scrollGesture', {
            left: 500,
            top: 1500,
            width: 500,
            height: 500,
            direction: 'down',
            percent: 3.0
        });
    }

    /**
     * Clicks on a specific seat.
     * @param {Object} seat - Seat object to be clicked.
     */
    async clickSeat(seat) {
        const element = await $(`android=new UiSelector().description("${seat.seatNumber}")`);
        await element.waitForDisplayed({ timeout: 5000 });
        await element.click();
    }
}

module.exports = new Seats();
