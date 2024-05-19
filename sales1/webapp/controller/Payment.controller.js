sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("sync.zec.sales1.controller.Payment", {
        onInit: function () {

            
            var oCartModel = this.getOwnerComponent().getModel("cart");
            this.getView().setModel(oCartModel, "paymentCart");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var oRoute = oRouter.getRoute("RoutePayment");

            if (oRoute) {
                oRoute.attachPatternMatched(this._onPatternMatched, this);
            }
            
        },

        _onPatternMatched: function (oEvent) {
            var sCartItems = oEvent.getParameter("arguments").cartItems;
            var aCartItems = JSON.parse(decodeURIComponent(sCartItems));
            var oCartModel = this.getOwnerComponent().getModel("cart");
            oCartModel.setProperty("/cartItems", aCartItems);

            // Wizard 초기화
            var oWizard = this.byId("paymentWizard");
            oWizard.discardProgress(oWizard.getSteps()[0]);
        },

        onPaymentTypeSelect: function (oEvent) {
            var oCartModel = this.getView().getModel("paymentCart");
            var sSelectedKey = oEvent.getSource().getSelectedButton().getKey();
            oCartModel.setProperty("/selectedPaymentType", sSelectedKey);
            oCartModel.setProperty("/paymentTypeSelected", true);
        },

        onNextStep: function () {
            var oWizard = this.byId("paymentWizard");
            oWizard.nextStep();
        },

        onComplete: function () {
            var oCartModel = this.getView().getModel("paymentCart");
            var iSelectedIndex = oCartModel.getProperty("/selectedIndex");

            if (iSelectedIndex === 1) { // 1 corresponds to KakaoPay
                this._initiateKakaoPay();
            } else if (iSelectedIndex === 0) { // 0 corresponds to Card
                MessageToast.show("Payment Complete");
                // Add your logic for completing the payment process for card payment
            } else {
                MessageToast.show("Please select a payment method.");
            }
        },

        _initiateKakaoPay: function () {
            var oCartModel = this.getView().getModel("paymentCart");
            var aCartItems = oCartModel.getProperty("/cartItems");

            var oPayload = {
                totalAmount: oCartModel.getProperty("/totalPrice")
            };

            $.ajax({
                url: "http://localhost:3000/kakao-pay",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(oPayload),
                success: function (response) {
                    if (response.next_redirect_pc_url) {
                        window.location.href = response.next_redirect_pc_url;
                    } else {
                        MessageToast.show("Failed to initiate KakaoPay");
                    }
                },
                error: function () {
                    MessageToast.show("Error during KakaoPay initiation");
                }
            });
        },

        onNavBack: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteHome");
        }
    });
});
