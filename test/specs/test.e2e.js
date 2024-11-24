const { expect } = require('@wdio/globals');
const Locator = require('../pageobjects/locator.page');
const SplashScreen = require('../pageobjects/splash.page');
const SearchPage = require('../pageobjects/search.page');
const SelectTrip = require('../pageobjects/trip.page');
const Seats = require('../pageobjects/seats.page');
const Pax = require('../pageobjects/pax.page');
const Insurance = require('../pageobjects/insurance.page');
const Purchase = require('../pageobjects/purchase.page');

const { searchValues, creditCardValues, purchaserValues, passengers } = require('./input.value');

describe('it should complete a simple purchase @e2e_001', () => {
    it('should validate and handle modal and GPS permissions', async () => {
        await Locator.handleModalAndContinueWithGps();
    });
    it('Should validate splash component', async () => {
        await SplashScreen.validateAndCaptureElements();
    });
    
});
