sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("sync.zec.sales1.controller.Summary", {
        onInit: function () {
            var oCartModel = this.getOwnerComponent().getModel("cart");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteSummary").attachPatternMatched(this._onPatternMatched, this);

            // 데이터 로드 후에 추가 설정
            oCartModel.attachRequestCompleted(function() {
                this._onDataLoaded();
            }.bind(this));

            this.getView().setModel(oCartModel, "cart");
        },

        _onDataLoaded: function() {
            console.log("Data loaded successfully");
            // 데이터 로드 후 실행할 추가 코드
        },

        _onPatternMatched: function () {
            var oCartModel = this.getOwnerComponent().getModel("cart");
            var oSummaryData = oCartModel.getProperty("/summaryData");
            if (!oSummaryData) {
                console.error("Summary data is missing!");
                return;
            }

            // 필요한 경우 summaryData를 사용하여 추가 작업을 수행할 수 있습니다.
        },

        _navBackToStep: function (oEvent) {
            var oButton = oEvent.getSource();
            var sStepId = oButton.data("navBackTo");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var oCartModel = this.getOwnerComponent().getModel("cart");

            // 페이지 이동과 함께 단계 ID를 전달
            oRouter.navTo("RoutePayment", {
                cartItems: encodeURIComponent(JSON.stringify(oCartModel.getProperty("/cartItems"))),
                stepId: sStepId
            });
        },

        handleWizardCancel: function () {
            MessageBox.confirm("Are you sure you want to cancel the order?", {
                title: "Cancel Order",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        var oCartModel = this.getOwnerComponent().getModel("cart");

                        // Navigate to Home
                        oRouter.navTo("RouteHome");
                    }
                }.bind(this)
            });
        },

        handleWizardSubmit: function () {
            var oCartModel = this.getOwnerComponent().getModel("cart");
            var sPaymentType = oCartModel.getProperty("/summaryData/selectedPaymentType");

            MessageBox.confirm("Proceed with the payment?", {
                title: "Confirm Payment",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        this._callKakaoPayAPI();
                        // if (sPaymentType === "kakaopay") {
                        //     console.log("KakaoPay selected, initiating payment process...");
                        //     this._callKakaoPayAPI();
                        // } else {
                        //     // Handle other payment types
                        //     this._finalizeOrder();
                        // }
                    }
                }.bind(this)
            });
        },

        _callKakaoPayAPI: function () {
            var oCartModel = this.getView().getModel("cart");
            var oSummaryData = oCartModel.getProperty("/summaryData");
        
            console.log("Calling KakaoPay API with data:", oSummaryData);
        
            $.ajax({
                url: "http://localhost:3000/pay",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    amount: 123,
                    item_name: "Your Item Name"
                }),
                success: function (response) {
                    console.log("KakaoPay API response:", response);
                    if (response.next_redirect_pc_url) {
                        window.location.href = response.next_redirect_pc_url;
                    } else {
                        MessageBox.error("Failed to initiate KakaoPay payment.");
                    }
                },
                error: function (error) {
                    console.error("Error during KakaoPay API call:", error);
                    MessageBox.error("Payment initiation failed: " + error.responseText);
                }
            });
        },

        _finalizeOrder: function () {
            // Finalize the order logic
            console.log("Finalizing order...");
            // Navigate to a success page or update the UI accordingly
        }

    });
});