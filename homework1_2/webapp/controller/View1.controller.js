sap.ui.define([ "sap/ui/core/mvc/Controller"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    
    function (Controller) {
        "use strict";

        return Controller.extend("sync.e25.homework12.controller.View1",{ 
            onInit: function () {

            },

            onSelectionChange: function (oEvent) {
                
                let oItem = oEvent.getParameter("listItem");
                let oContext = oItem.getBindingContext();
                let selectedPath = oContext.getPath();
                let oCarrid = oContext.getProperty("Carrid");
                let oConnid = oContext.getProperty("Connid");
                // let oFltime = oContext.getProperty("Fltime");
                // let oDeptime = oContext.getProperty("Deptime");
                // let oArrtime = oContext.getProperty("Arrtime");
                // let oDistance = oContext.getProperty("Distance");
                // let oDistid = oContext.getProperty("Distid");
                sap.m.MessageToast.show("선택하신 버튼은 항공사: " + oCarrid + ", 항공편: " + oConnid + " 의 정보입니다.");
                
                 // Popup.fragment.xml 을 팝업창으로 호출하는 로직
                 let oView = this.getView();
                 let oDialog = this.byId("idInfo");
 
                 if ( oDialog ){
                    oDialog.bindElement(selectedPath);
                    
                    // let infoCarrid = oView.byId("idCarrid");
                    // infoCarrid.setText(oCarrid)
                    // let infoConnid = oView.byId("idConnid");
                    // infoConnid.setText(oConnid)
                    // let infoFltime = oView.byId("idFltime");
                    // infoFltime.setText(oFltime)
                    // let infoDeptime = oView.byId("idDeptime");
                    // infoDeptime.setText(oDeptime)
                    // let infoArrtime = oView.byId("idArrtime");
                    // infoArrtime.setText(oArrtime)
                    // let infoDistance = oView.byId("idDistance");
                    // infoDistance.setText(oDistance)
                    // let infoDistid = oView.byId("idDistid");
                    // infoDistid.setText(oDistid)
                     oDialog.open(); // Fragment를 Load 한 적이 있으면 byId로 찾을 수 있다.
                                     // 그렇게 찾은 Fragment를 팝업창으로 보여준다.
                 } else {
                     let oFragment = sap.ui.core.Fragment.load({
                         id: oView.getId(),
                         name: "sync.e25.homework12.view.Info",
                         type: "XML",
                         controller: this
                     });
 
                     // Fragment Load 가 완료되면 Main View 에 연결함 ( Main View의 모델도 이용 가능)
                     oFragment.then(function( oDialog ) {
                         oView.addDependent(oDialog); // View에 연결
                        //  let selectedPath = oContext.getPath();
                         oDialog.bindElement(selectedPath);
                        //  let infoCarrid = oView.byId("idCarrid");
                        //  infoCarrid.setText(oCarrid)
                        //  let infoConnid = oView.byId("idConnid");
                        //  infoConnid.setText(oConnid)
                        //  let infoFltime = oView.byId("idFltime");
                        //  infoFltime.setText(oFltime)
                        //  let infoDeptime = oView.byId("idDeptime");
                        //  infoDeptime.setText(oDeptime)
                        //  let infoArrtime = oView.byId("idArrtime");
                        //  infoArrtime.setText(oArrtime)
                        //  let infoDistance = oView.byId("idDistance");
                        //  infoDistance.setText(oDistance)
                        //  let infoDistid = oView.byId("idDistid");
                        //  infoDistid.setText(oDistid)
                         oDialog.open(); // 팝업창 출력
                  });
                 
                 
                 }                   
             },
 
             onDialogClose: function( ) {
                 let oDialog = this.byId("idInfo");
                 if ( oDialog ) {
                     oDialog.close(); // 팝업창을 닫는다.
                 }
 
             }
                
            })
        
    });
