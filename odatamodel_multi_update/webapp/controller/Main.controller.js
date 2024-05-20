sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSON) {
        "use strict";

        return Controller.extend("sync.e25.odatamodelmultiupdate.controller.Main", {
            onInit: function () {
                this.getView().setModel(new JSON({
                    EditMode: false
                }), "view");

                // let viewData = {
                //     EditMode: false
                // };
                
                // let oViewModel = new JSON(viewData);
                // let oView = this.getView();
                // oView.setModel(oViewModel, "view");

                // oView ==>> this.getView();
                // this.getView().setModel(oViewModel, "view");
                
                // 화면에 오류가 발생한 부분을 메세지와 함께 표시해주는 기능
                let oMsgManager = sap.ui.getCore().getMessageManager();
                oMsgManager.registerObject(this.getView(), true);
                
            },

            onEdit: function () {
                let oViewModel = this.getView().getModel("view");
                oViewModel.setProperty("/EditMode", true)
            },
            
            onCancel: function () {
                let oViewModel = this.getView().getModel("view");
                oViewModel.setProperty("/EditMode", false);
                
                /** @type {sap.ui.model.odata.v2.ODataModel} */
                let oModel = this.getView().getModel(); // OData Model
                oModel.resetChanges(); // 원본 데이터로 복원
            },
            
            onRefresh:function () {
                let oModel = this.getView().getModel(); // OData Model
                oModel.resetChanges();
                oModel.refresh(true, true);
            },
            
            onSave: function () {
                let oView = this.getView();
                let oTable = oView.byId("idTable");
                let aIndex = oTable.getSelectedIndices();

                // !aIndex 의 뜻 : aIndex 라는 변수가 없거나, 사용불가능할 때
                // aIndex.length == 0 : 사용은 가능하나, 배열이 비어있을 때
                // aIndex 라는 변수가 없거나, 사용이 불가능하거나,
                // 배열이 비어있거나, 할 때 { } 의 문장을 실행한다.
                // || ==>> OR 의미
                if( !aIndex || aIndex.length == 0 ){
                    sap.m.MessageBox.information("저장할 데이터를 선택하세요.")
                    return; // 중단
                }

                // 여기가 실행된다는 것은 aIndex 에 한 줄 이상 있다는 뜻
                
                let oModel = oView.getModel();
                let successCount  = 0;  // 성공 횟수
                let errorCount    = 0;  // 오류 횟수

                // 선택한 라인마다 전부 oModel.update(경로, 변경할 데이터, 결과처리);
                // 배열 aIndex 의 인덱스 정보를 index 변수에 전달하면서 반복
                for( const index of aIndex ){
                    let oContext = oTable.getContextByIndex(index);
                    let carrid   = oContext.getProperty("Carrid");
                    let path     = oContext.getPath();
                    let data     = oContext.getProperty();

                    oModel.update( path, data, {
                        success: function () {
                            successCount++;
                            // successCount = successCount + 1;
                            if ( aIndex.length == successCount ) {
                                sap.m.MessageBox.success(successCount + " 건의 데이터가 변경이 완료되었습니다.")
                            } else if ( aIndex.length == successCount + errorCount ) {
                                // 일부는 에러가 발생했을 때
                                sap.m.MessageBox.warning(
                                    "성공 "+successCount+", 실패 "+errorCount+" 건이 발생했습니다.")
                            }
                        },

                        error: function () {
                            errorCount++;;

                            if ( aIndex.length == errorCount ) {
                                // 모두 실패했을 때
                                sap.m.MessageBox.error(errorCount + " 건의 데이터가 변경실패 했습니다.")
                            } else if ( aIndex.length == successCount + errorCount ) {
                                // 일부는 성공했을 때
                                sap.m.MessageBox.warning(
                                    "성공 "+successCount+", 실패 "+errorCount+" 건이 발생했습니다.")
                            }
                        }
                    })
                }
            }
        });
    });
