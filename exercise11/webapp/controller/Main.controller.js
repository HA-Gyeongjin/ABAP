sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("sync.e25.exercise11.controller.Main", {
            onInit: function () {

            },

            onSelectionChange: function(oEvent) {
                // 선택한 Item 정보를 Event 로부터 가져옴
                let oItem = oEvent.getParameter("listItem");
                // 선택한 라인에서 출력되는 데이터의 Model 정보
                let oContext = oItem.getBindingContext();
                // 해당 Model 내용의 Carrid 속성을 화면에 출력
                sap.m.MessageToast.show(oContext.getProperty("Carrid"));
                //선택한 라인의 접근 경로
                let selectedPath = oContext.getPath();
                // 항공편이 보이는 Table의 ID로 화면의 구성요소를 찾는다.
                let oConnTable = this.byId("idConnTable");
                // 선택한 라인의 접근 경로를 현재 경로로 취급하도록
                // 테이블에 bindElement 메소드를 호출한다.
                // 이렇게 테이블에서 현재 경로를 설정하면
                // items 에 적은 {toConnection} 은
                // {선택한항공사/toConnection} 이라고 적은 것과 같도록 된다.
                oConnTable.bindElement(selectedPath);
            }
        });
    });
