sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("sync.e25.jsonmodel.controller.Main", {
            onInit: function () {
                let data = {
                    firstName: "John", // 문자열
                    enabled: true      // boolean 타입(true / false)
                };

                // sap.ui.model.json.JSONModel 의 객체가 생성되면서
                // 동시에 data 라는 이름의 변수에 기록된 Structure 정보가
                // Model 의 데이터로 전달된다.
                let oModel = new JSONModel(data);
                
                // JSON Model의 Binding Mode 를 Two-Way 에서 One-Way로 변경
                // oModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);

                // 이 Controller와 연결된 View 의 기본 모델로 설정
                this.getView().setModel(oModel);
            }
        });
    });
