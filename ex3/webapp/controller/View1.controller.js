sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Fragment, JSONModel) {
        "use strict";

        return Controller.extend("sync.e25.ex3.controller.View1", {
            initAirlineData: {
                Carrid: "",
                Connid: ""
            },
            onInit: function () {
                let data = this.initAirlineData;
                let oNewModel = new JSONModel(data);
                let oView = this.getView();
                oView.setModel(oNewModel, "new");

                let dataDistid = {
                    Distid: [
                        { Key: "MI", Name: "마일"},
                        { Key: "KM", Name: "킬로미터"}
                    ]
                };

                let oViewModel = new JSONModel(dataDistid);
                this.getView().setModel(oViewModel, "distid")

            },

            onCreate: function () {
                // 아무것도 입력되지 않은 깨끗한 상태의 팝업창
                let data = {
                    Carrid: "",
                    Connid: "",
                    Countryfr: "",
                    Cityfrom: "",
                    Airpfrom: "",
                    Countryto: "",
                    Cityto: "",
                    Airpto: "",
                    Deptime: "",
                    Arrtime: "",
                    Distance: "",
                    Distid: ""
                };

                let oNewModel = new JSONModel(data);
                this.getView().setModel(oNewModel, "new");

                this.openDialog();
            },

            openDialog: function() {
                let oView = this.getView();
                let oDialog = oView.byId("idNewDialog");

                if (oDialog) {
                    oDialog.open();
                } else {
                    Fragment.load({
                        id: oView.getId(),
                        name:"sync.e25.ex3.view.New",
                        type: "XML",
                        controller: this                // View의 Controller를 공유
                    }).then(function (oDialog) {
                        oView.addDependent(oDialog);    // View의 Model을 공유
                        oDialog.open();
                    });
                }
            },

            onSaveCancel: function () {
                let oDialog = this.getView().byId("idNewDialog");
                if (oDialog) {
                    oDialog.close();
                }

                // 빈값만 있는 정보로 기존의 new 모델의 데이터를 교체해버림 =>> 데이터 초기화
                let oNewModel = this.getView().getModel("new");
                oNewModel.setData({
                    Carrid: "",
                    Carrname: ""
                });

            },

            onSaveConfirm: function () {
                let oView = this.getView();
                let oNewModel = oView.getModel("new");  // JSON  Model
                let oModel = oView.getModel();          // OData Model
                
                let newData = oNewModel.getData();
                //newData = { Carrid:"~~", Carrname:"~~~", ...}
            
                    // 생성
                    // oModel.create( 경로, 신규 데이터, 결과처리 );
                
                    // HTTP Method 에서 POST 방식으로 호출하는 방법
                    oModel.create(
                        // 경로, 신규데이터, 결과처리
                        "/ConnectionSet",
                        newData,
                        {
                            success: function (oData, oResponse) {
                                // oData : 생성된 데이터 내용
                                // oResponse : 응답결과
                                
                                sap.m.MessageToast.show( oData.Carrid + oData.Connid + "데이터가 생성되었습니다.");
                            },
                            error: function ( oError ) {
                                
                                sap.m.MessageBox.error("생성 중 오류가 발생되었습니다.");
                            }
                        }
                    );                    
                 
            },

            onDelete: function() {
                debugger;
                // oTable 이라는 이름의 변수를 선언
                let oTable = this.byId("idTable"); // View 에서 id 속성값이 idTable 인 항목을 찾음
                
                let aIndex = oTable.getSelectedIndices();
                if (!aIndex || aIndex.length == 0) { 
                    sap.m.MessageBox.information("삭제할 라인을 선택하세요");                   
                    return;    
                }

                // OData 모델을 View에서 가져온다.
                let oModel = this.getView().getModel();

                // const 는 상수를 선언하는 방법, 상수는 값이 변경되지 않는 특징
                for (const index of aIndex) {
                let oSelectedContext = oTable.getContextByIndex(index);
                let carrid = oSelectedContext.getProperty("Carrid");
                let connid = oSelectedContext.getProperty("Connid");

                // 해당 모델의 정보에 대한 경로
                let path = oSelectedContext.getPath();

                // OData 모델의 remove(경로, 결과처리) 메소드를 이용하면,
                // 해당 데이터를 삭제명령 보낼 수 있다.
                // 해당 삭제명령은 이 경우 SAP Gateway의 YE25_GW005의 
                // CARRIERSET_DELETE_ENTITY 메소드가 실행된다.
                oModel.remove(path, {
                    success: function () {
                        // Exception이 발생하지 않은 경우
                        // sap.m.MessageToast.show("") <-- 한 줄 실행시 마다 발생
                        sap.m.MessageBox.success(carrid + ", " + connid + "삭제 성공");
                        oTable.clearSelection();
                        
                    },
                    error: function (oError) {
                        // 삭제 중 Exception이 발생한 경우

                    }
                })
                }

            }
        });
    });
