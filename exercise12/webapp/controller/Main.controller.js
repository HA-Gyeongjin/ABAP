sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("sync.e25.exercise12.controller.Main", {
            onInit: function () {
                let data = {
                    Carrid: "AA",
                    Connid: "0017"
                };

                let oModel = new JSONModel( data );

                let oView = this.getView();
                oView.setModel(oModel, "view");

                // Message Manager를 가져와서 Main View에 등록한다.
                // 오류가 발생한 위치에 메세지가 붙어있을 수 있도록 이벤트 핸들링 옵션도 true로 설정한다.
                sap.ui.getCore().getMessageManager().registerObject(oView, true);
            },
            
            onCarridValidError: function ( oEvent ) {
                let oSource=oEvent.getSource();
                oSource.setValueState(sap.ui.core.ValueState.Error);

                let oView=this.getView();
                let oModel=oView.getModel("view");
                let data=oModel.getData();

                sap.m.MessageToast.show( data.Carrid + "항공사 ID값이 잘못되었습니다.")
            }
        });
    });


    