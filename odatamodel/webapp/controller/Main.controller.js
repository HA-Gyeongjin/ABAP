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
        
        return Controller.extend("sync.e25.odatamodel.controller.Main", {
            initAirlineData: {
                Carrid: "",
                Carrname: "",
                Currcode: "",
                Url: ""
            },
            
            onInit: function () {
                let data = this.initAirlineData;
                let oNewModel = new JSONModel(data);
                let oView = this.getView();
                oView.setModel(oNewModel, "new");

                // 통화코드 콤보박스를 위해 추가
                let viewData = {
                    Currency: [
                        {key: 'KRW', name: '원화'},
                        {key: 'USD', name: '달러'}
                    ],
                    CreateMode: ""
                };
                let oViewModel = new JSONModel(viewData);
                oView.setModel(oViewModel, "view");
            },

            // onCurrencyChange: function (oEvent) {
            //     let oItem = oEvent.getParameter("selectedItem");
            //     let oNewModel = this.getView().getModel("new");
            //     oNewModel.setProperty("/Currcode", oItem.getKey());
            // },
            
            onCreate: function () {
                // 아무것도 입력되지 않은 깨끗한 상태의 팝업창
                let data = {
                    Carrid: "",
                    Carrname: "",
                    Currcode: "",
                    Url: ""
                };

                let oNewModel = new JSONModel(data);
                this.getView().setModel(oNewModel, "new");

                let oViewModel = this.getView().getModel("view");
                oViewModel.setProperty("/CreateMode", true);

                // 항공사ID, 항공사명, 통화코드, 웹페이지 주소가 입력이 가능해야 한다.
                this.openDialog();
            },

            onUpdate: function( oEvent ) {
                // 내가 선택한 라인의 데이터가 자동으로 입력되어 있는 상태의 팝업창
                let oButton = oEvent.getSource();
                let oContext = oButton.getBindingContext();
                // let path = oContext.getPath();      내가 선택한 라인과 연결된 모델의 경로 /CarrierSet('AA')
                let data = oContext.getProperty();  // ??? 무슨 데이터가 들어갈까???

                let oNewModel = new JSONModel(data);
                this.getView().setModel(oNewModel, "new");

                let oViewModel = this.getView().getModel("view");
                oViewModel.setProperty("/CreateMode", false);  //onCreate 는 false 대신에 true
                // this.getView().getModel("view").setProperty("/CreateMode", false)

                // 항공사ID는 입력할 수 있으면 안된다.
                // 항공사명, 통화코드, 웹페이지 주소는 입력이 가능해야 한다.
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
                        name:"sync.e25.odatamodel.view.New",
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
                    Carrname: "",
                    Currcode: "",
                    Url: ""
                });

                // ComboBox 선택된 내용을 지우는 과정
                let oComboBox = this.byId("idComboBox");
                oComboBox.setSelectedKey("");
                oComboBox.setSelectedItem("");
                oComboBox.setSelectedItemId("");
            },

            onSaveConfirm: function () {
                let oView = this.getView();
                let oNewModel = oView.getModel("new");  // JSON  Model
                let oModel = oView.getModel();          // OData Model
                
                let newData = oNewModel.getData();
                //newData = { Carrid:"~~", Carrname:"~~~", ...}

                let oViewModel = oView.getModel("view")
                let createMode = oViewModel.getProperty("/CreateMode"); // <-- true(생성) 또는 false(수정)
                
                if (createMode) {
                    // 생성
                    // oModel.create( 경로, 신규 데이터, 결과처리 );
                
                    // HTTP Method 에서 POST 방식으로 호출하는 방법
                    oModel.create(
                        // 경로, 신규데이터, 결과처리
                        "/CarrierSet",
                        newData,
                        {
                            success: function (oData, oResponse) {
                                // oData : 생성된 데이터 내용
                                // oResponse : 응답결과
                                
                                sap.m.MessageToast.show( oData.Carrid + "항공사가 생성되었습니다.");
                            },
                            error: function ( oError ) {
                                
                                sap.m.MessageBox.error("생성 중 오류가 발생되었습니다.");
                            }
                        }
                    );                    
                } else {
                    // 수정
                    // oModel.update( 경로, 변경될 데이터, 결과처리 );

                    oModel.update(
                        // /CarrierSet('AA') 와 같이 만들기 위해 문자열 /CarrierSet( '와' ) 의 사이에 항공사 코드(AA) 를 합치는 작업
                        // A + B + C => 완성된 경로 /CarrierSet('AA')
                        // A : /CarrierSet('
                        // B : 항공사코드(예 AA)
                        // C : ')
                        "/CarrierSet('" + newData.Carrid + "')",
                        newData,
                        {
                            success: function () {  
                                sap.m.MessageToast.show( newData.Carrid + " 항공사가 수정되었습니다." );                         
                            },
                            
                            error: function (oError) {
                                sap.m.MessageBox.error("수정 중 오류가 발생되었습니다.");
                            }
                        }
                    );
                }



                // 생성을 위한 팝업창 닫기
                this.onSaveCancel();
            },

            onDelete: function ( oEvent ) {
                // oEvent의 getSource() 는 이벤트가 발생한 오브젝트를 의미
                // debugger;
                let oButton = oEvent.getSource();   // 특정 라인의 버튼
                let oContext = oButton.getBindingContext(); // 그 버튼에 연결된 Model 정보
                let path = oContext.getPath(); // Model 정보의 경로 ( /CarrierSet('AA') )

                let oView = this.getView();
                let oModel = oView.getModel();

                // HTTP Method 에서 Delete 에 해당하는 명령
                oModel.remove(
                    // 삭제할 데이터의 경로, 결과처리
                    path, {
                    success: function(){
                        sap.m.MessageToast.show("항공사 삭제됨");
                    },
                    error: function (oError) {
                        sap.m.MessageBox.error("삭제 중 오류가 발생함.");
                    }
                })
            },

            onRefresh: function () {
                // let oModel = new sap.ui.model.odata.v2.ODataModel();

                // let 은 변수를 선언하지만 특별하게 타입을 구별하지는 않음
                // 아래와 같이 /** @type {타입} */ 을 적게 되는 경우
                // 그 아래에 나온 let 으로 선언한 변수는
                // 특정 타입으로 지정되어 손쉽게 정보를 얻을 수 있다.
                /** 
                 * @type {sap.ui.model.odata.v2.ODataModel} 
                 * */
                let oModel = this.getView().getModel();
                oModel.refresh();
                
            }
        });
    });
