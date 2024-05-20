sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, Fragment) {
        "use strict";

        return Controller.extend("sync.e25.hw1review.controller.Main", {
            onInit: function () {

            },
            onSelectionChange: function ( oEvent ) {
                // debugger;
                let olistItem = oEvent.getParameter("listItem");
                let oContext = olistItem.getBindingContext();
                let carrid = oContext.getProperty("Carrid");
                let connid = oContext.getProperty("Connid");

                MessageToast.show("선택하신 라인은 항공사: " + carrid + 
                                ", 항공편: " + connid + " 의 정보입니다.");

                // Fragment 의 Dialog 를 오픈하도록 한다.
                let oView = this.getView();
                let oDialog = oView.byId("idDialog");
                // oDialog = this.byId("idDialog"); getView를 쓰지 않아도 찾을 수 있다
                // oDialog = this.getView().byId("idDialog");

                let currentModelPath = oContext.getPath();
                oView.bindElement(currentModelPath);

                if (!oDialog) {
                    // Main 화면에서 없을 때
                    Fragment.load({
                        id: oView.getId(),
                        name: "sync.e25.hw1review.view.Info",
                        type: "XML",
                        controller: this
                    }).then(
                        function( oDialog ) {
                            oView.addDependent(oDialog);
                            oDialog.open();
                        }
                    );                    

                } else {
                    // Main 화면에서 있을 때
                    oDialog.open();
                }
            },

            onClosePress: function () {
                let oDialog = this.byId("idDialog");
                if (oDialog) {
                oDialog.close();
                }
            }
        });
    });
