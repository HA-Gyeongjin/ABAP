sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("sync.zec.sales1.controller.Summary", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteSummary").attachPatternMatched(this._onPatternMatched, this);

            // 글로벌 모델 설정
            var oGlobalModel = this.getOwnerComponent().getModel("globalModel");
            this.getView().setModel(oGlobalModel, "globalModel");
        },

        _onPatternMatched: function (oEvent) {
            // 추가적인 로직이 필요하면 여기에 추가
        }
    });
});