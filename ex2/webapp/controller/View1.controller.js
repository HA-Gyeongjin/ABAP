sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Fragment) {
        "use strict";

        return Controller.extend("sync.e25.ex2.controller.View1", {
            onInit: function () {
              
            },

            onSelectionChange: function ( oEvent ) {
                let olistItem = oEvent.getParameter("listItem");
                let oContext = olistItem.getBindingContext();

                // Fragment 의 Dialog 를 오픈하도록 한다.
                let oView = this.getView();
                let oDialog = oView.byId("idDialog");
                // oDialog = this.byId("idDialog"); getView를 쓰지 않아도 찾을 수 있다
                // oDialog = this.getView().byId("idDialog");

                let path = oContext.getPath();
                oView.bindElement(path);
 

                if (!oDialog) {
                    // Main 화면에서 없을 때
                    Fragment.load({
                        id: oView.getId(),
                        name: "sync.e25.ex2.view.Conn",
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
