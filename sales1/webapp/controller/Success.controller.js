// Success.controller.js
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel"
], function (Controller, ODataModel) {
    "use strict";

    return Controller.extend("sync.zec.sales1.controller.Success", {
        onInit: function () {
            this._createEntity();
        },

        onNavHome: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteHome");
        },

        _createEntity: function () {
            var oSummaryData = JSON.parse(localStorage.getItem("summaryData")); // 로컬 스토리지에서 데이터 가져오기

            if (oSummaryData) {
                console.log("Creating entity with data:", oSummaryData);

                var oModel = this.getOwnerComponent().getModel();

                oModel.create("/SalesHeaderSet", oSummaryData, {
                    success: function (oData) {
                        console.log("Entity created successfully:", oData);
                        // 필요시 추가 작업 수행
                    },
                    error: function (oError) {
                        console.error("Error during entity creation:", oError);
                        sap.m.MessageBox.error("Entity creation failed: " + oError.responseText);
                    }
                });
            } else {
                console.error("No summary data found in localStorage");
            }
        }

    });
});
