sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/ValidateException"
], function (Controller,
	JSONModel,
	MessageToast,
	ValidateException) {
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
            
            // 결제 관련 모델 초기화
            oCartModel.setProperty("/cardOwner", "");
            oCartModel.setProperty("/cardNumber", "");
            oCartModel.setProperty("/cvc", "");
            oCartModel.setProperty("/expiryDate", "");

            // 결제 단계 모델 초기화
            oCartModel.setProperty("/selectedPaymentType", "");
            oCartModel.setProperty("/paymentTypeSelected", false);
            oCartModel.setProperty("/showCardInfo", false);

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
            oCartModel.setProperty("/showCardInfo", sSelectedKey === "Card");
        },

        onNextStep: function () {
            var oCartModel = this.getView().getModel("paymentCart");
            var sSelectedPaymentType = oCartModel.getProperty("/selectedPaymentType");

            if (sSelectedPaymentType === "Card" || sSelectedPaymentType === "KakaoPay") {
                var oWizard = this.byId("paymentWizard");
                oWizard.nextStep();
            } else {
                var oWizard = this.byId("paymentWizard");
                oWizard.nextStep();
            }
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
        },

        checkCardHolderName: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var oRegex = /^[a-zA-Z가-힣]+$/;
            if (sValue.length >= 2 && oRegex.test(sValue)) {
                oInput.setValueState("None");
            } else {
                oInput.setValueState("Error");
            }
        },

        checkCardNumber: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var oRegex = /^[0-9-]+$/;
            var isValid = sValue.length === 19 && oRegex.test(sValue); // 19 includes 16 digits + 3 hyphens
            
            if (isValid) {
                oInput.setValueState("None");
            } else {
                oInput.setValueState("Error");
                oInput.setValueStateText("유효한 카드번호를 입력해주세요.");
            }
        },

        checkSecurityCode: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var oRegex = /^[0-9]{3}$/;
            var isValid = oRegex.test(sValue);
            
            if (isValid) {
                oInput.setValueState("None");
            } else {
                oInput.setValueState("Error");
                oInput.setValueStateText("3자리의 숫자만 입력해주세요.");
            }
        },

        checkExpirationDate: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var isValidFormat = /^(0[1-9]|1[0-2])\/\d{4}$/.test(sValue); // Check if the format is MM/YYYY
        
            if (!isValidFormat) {
                oInput.setValueState("Error");
                oInput.setValueStateText("유효한 날짜를 입력해주세요.");
                return;
            }
        
            var aDateParts = sValue.split("/");
            var nInputMonth = parseInt(aDateParts[0], 10);
            var nInputYear = parseInt(aDateParts[1], 10);
        
            var oToday = new Date();
            var nCurrentMonth = oToday.getMonth() + 1; // getMonth() is 0-based
            var nCurrentYear = oToday.getFullYear();
        
            if (nInputYear < nCurrentYear || (nInputYear === nCurrentYear && nInputMonth < nCurrentMonth)) {
                oInput.setValueState("Error");
                oInput.setValueStateText("유효기간이 만료되었습니다.");
            } else {
                oInput.setValueState("None");
            }
        }

    });
});
