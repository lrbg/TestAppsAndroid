const Helpers = require('./helpers.page.js');
const allure = require('@wdio/allure-reporter').default;

class Purchase {
    /** UI Selectors */
    get purchaseDataTitle() {
        return driver.isAndroid 
            ? $('android=new UiSelector().className("android.widget.TextView").text("DATOS DEL COMPRADOR")')
            : $('~DATOS DEL COMPRADOR');
    }

    get nameField() {
        return driver.isAndroid 
            ? $('android=new UiSelector().className("android.widget.EditText").text("Nombre (s)*")')
            : $('//XCUIElementTypeTextField[@name="Nombre (s)*"]');
    }

    get surnameField() {
        return driver.isAndroid 
            ? $('android=new UiSelector().className("android.widget.EditText").text("Apellido (s)*")')
            : $('//XCUIElementTypeTextField[@name="Apellido (s)*"]');
    }

    get emailField() {
        return driver.isAndroid 
            ? $('android=new UiSelector().className("android.widget.EditText").text("Correo Electrónico * (Obligatorio)")')
            : $('//XCUIElementTypeTextField[@name="Correo Electrónico * (Obligatorio)"]');
    }

    get phoneFieldContainer() {
        return driver.isAndroid 
            ? $('android=new UiSelector().className("android.view.ViewGroup").index(1)')
            : $('//XCUIElementTypeOther[@name="Teléfono celular"]');
    }

    get phoneField() {
        return driver.isAndroid 
            ? this.phoneFieldContainer.$('android=new UiSelector().className("android.widget.EditText").textContains("Teléfono celular")')
            : $('//XCUIElementTypeTextField[@name="Teléfono celular"]');
    }

    get endPurchaseButton() {
        return driver.isAndroid 
            ? $('android=new UiSelector().className("android.view.ViewGroup").descriptionContains("Pagar").clickable(true).enabled(true)')
            : $('//XCUIElementTypeButton[@name="Pagar"]');
    }

    get successMessage() {
        return driver.isAndroid 
            ? $('android=new UiSelector().className("android.widget.TextView").textContains("Tu compra por").textContains("fue exitosa")')
            : $('//XCUIElementTypeStaticText[contains(@name, "Tu compra por")][contains(@name, "fue exitosa")]');
    }

    /**
     * Waits for the "Purchaser's Data" title to be visible and enabled with an extended timeout.
     */
    async waitForPurchaseDataTitle() {
        await driver.pause(1000);
        await Helpers.waitObjt(this.purchaseDataTitle);
    }

    /**
     * Fills in the purchaser's data.
     * @param {Object} purchaseData - Data for the purchaser.
     */
    async fillPurchaseData({ name, lastName, email, phone }) {
        await this.waitForPurchaseDataTitle();
        await this.nameField.setValue(name);
        await this.surnameField.setValue(lastName);
        await this.emailField.setValue(email);
        await this.phoneField.setValue(phone);

        const scrFillDataPurchase = await browser.takeScreenshot();
        allure.addAttachment('formPurchase', Buffer.from(scrFillDataPurchase, 'base64'), './screenshots/formPurchase.png');

        await this.scrollDown(0);
    }

    /**
     * Selects the payment method based on the specified type.
     * @param {string} paymentType - Type of payment: "creditDebit", "paypal", "coppel"
     */
    async selectPaymentOption(paymentType) {
        let paymentButton;
        switch (paymentType) {
            case "creditDebit":
                paymentButton = driver.isAndroid
                    ? $('android=new UiSelector().className("android.view.ViewGroup").description("Crédito o débito")')
                    : $('//XCUIElementTypeButton[@name="Crédito o débito"]');
                break;
            case "paypal":
                paymentButton = driver.isAndroid
                    ? $('android=new UiSelector().className("android.view.ViewGroup").description("PayPal")')
                    : $('//XCUIElementTypeButton[@name="PayPal"]');
                break;
            case "coppel":
                paymentButton = driver.isAndroid
                    ? $('android=new UiSelector().className("android.view.ViewGroup").description("Nuevo, Crédito")')
                    : $('//XCUIElementTypeButton[@name="Nuevo, Crédito"]');
                break;
            default:
                throw new Error(`Unsupported payment type "${paymentType}"`);
        }
        await Helpers.waitObjt(paymentButton);
        await paymentButton.click();
        const scrTypePyment = await browser.takeScreenshot();
        allure.addAttachment('typePayment', Buffer.from(scrTypePyment, 'base64'), './screenshots/typePayment.png');
        await this.scrollDown(1);
    }

    /**
     * Fills in the credit card information.
     * @param {Object} cardData - Data for the credit card.
     */
    async fillCardData({ name, number, expiration, cvv }) {
        const cardNameField = driver.isAndroid
            ? $('android=new UiSelector().className("android.widget.EditText").text("Nombre del propietario de la tarjeta")')
            : $('//XCUIElementTypeTextField[@name="Nombre del propietario de la tarjeta"]');
        
        const cardNumberField = driver.isAndroid
            ? $('android=new UiSelector().className("android.widget.EditText").index(0)')
            : $('//XCUIElementTypeTextField[@name="Número de tarjeta"]');
        
        const cardExpiryField = driver.isAndroid
            ? $('android=new UiSelector().resourceId("CC_EXPIRY")')
            : $('//XCUIElementTypeTextField[@name="Fecha de expiración"]');
        
        const cardCVVField = driver.isAndroid
            ? $('android=new UiSelector().resourceId("CC_CVC")')
            : $('//XCUIElementTypeSecureTextField[@name="CVC"]');

        await Helpers.waitObjt(cardNameField);
        await cardNameField.setValue(name);
        await Helpers.waitObjt(cardNumberField);
        await cardNumberField.setValue(number);
        await Helpers.waitObjt(cardExpiryField);
        await cardExpiryField.setValue(expiration);
        await Helpers.waitObjt(cardCVVField);
        await cardCVVField.setValue(cvv);
        await this.scrollDown(3);
    }

    /**
     * Completes the purchase by clicking the "Pay" button.
     */
    async completePurchase() {
        const maxAttempts = 5;
        for (let i = 0; i < maxAttempts; i++) {
            const isButtonPresent = await this.endPurchaseButton.isExisting();
            if (!isButtonPresent) {
                console.warn(`Intento ${i + 1}: El botón "Pagar" no está disponible.`);
                await driver.pause(1000); // Espera un segundo antes de reintentar.
                continue;
            }
    
            console.log(`Intento ${i + 1}: Haciendo clic en el botón "Pagar".`);
            await this.endPurchaseButton.click();
    
            // Verifica si el mensaje de éxito aparece.
            const isSuccessVisible = await this.successMessage.isDisplayed();
            if (isSuccessVisible) {
                console.log("Compra completada exitosamente.");
                return;
            }
        }
    
        throw new Error("No se pudo completar la compra después de varios intentos.");
    }
    

    /**
     * Validates that the success message for purchase completion is displayed.
     */
    async validateSuccessfulPurchaseMessage() {
        await Helpers.waitObjt(this.successMessage);
        return await this.successMessage.isDisplayed();
    }

    /**
     * Performs a scroll down with a customizable percentage.
     * @param {number} percent - Percentage of the scroll down.
     */
    async scrollDown(percent = 1.0) {
        await driver.execute('mobile: scrollGesture', {
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          percent,
          direction: 'down',
        });
    }
}

module.exports = new Purchase();
