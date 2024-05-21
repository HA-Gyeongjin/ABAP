sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/ValidateException"
], function (Controller,
	JSONModel,
	MessageToast,
	ValidateException) {
    "use strict";

    return Controller.extend("sync.zec.sales1.controller.Payment", {
        onInit: function () {

            
            var oCartModel = this.getOwnerComponent().getModel("cart");
            // this.getView().setModel(oCartModel, "paymentCart");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var oRoute = oRouter.getRoute("RoutePayment");

            if (oRoute) {
                oRoute.attachPatternMatched(this._onPatternMatched, this);
            }

            // Summary route
            var oSummaryRoute = oRouter.getRoute("RouteSummary");
            if (oSummaryRoute) {
                oSummaryRoute.attachPatternMatched(this._onSummaryPatternMatched, this);
            }
            
            // 결제 관련 모델 초기화
            oCartModel.setProperty("/cardOwner", "");
            oCartModel.setProperty("/cardNumber", "");
            oCartModel.setProperty("/cvc", "");
            oCartModel.setProperty("/expiryDate", "");

            // 결제 단계 모델 초기화
            oCartModel.setProperty("/selectedPaymentType", "Card");
            oCartModel.setProperty("/paymentTypeSelected", false);
            oCartModel.setProperty("/showCardInfo", false);
            oCartModel.setProperty("/isCardInfoValid", false); // Initialize validation state

            // Daum Postcode API 스크립트 로드
            this._loadDaumPostcodeScript().then(() => {
                console.log("Daum Postcode script loaded successfully");
            }).catch((error) => {
                console.error("Failed to load Daum Postcode script:", error);
            });

        },

        // New method to handle summary route pattern matched
        _onSummaryPatternMatched: function (oEvent) {

        },

        _onPatternMatched: function (oEvent) {
            var sCartItems = oEvent.getParameter("arguments").cartItems;
            var aCartItems = JSON.parse(decodeURIComponent(sCartItems));
            var oCartModel = this.getView().getModel("cart");
            oCartModel.setProperty("/cartItems", aCartItems);

            var sStepId = oEvent.getParameter("arguments").stepId;
            if (sStepId) {
                this._goToStep(sStepId);
            }
        },

        _goToStep: function (sStepId) {
            var oWizard = this.byId("paymentWizard");
            var oStep = this.byId(sStepId);
            if (oStep) {
                oWizard.discardProgress(oStep);
                oWizard.goToStep(oStep);
            }
        },

        onPaymentTypeSelect: function (oEvent) {
            var oCartModel = this.getView().getModel("cart");
            var sSelectedKey = oEvent.getParameter("button").data("paymentType");

            // summaryData의 selectedPaymentType 경로에 값을 설정합니다.
            oCartModel.setProperty("/selectedPaymentType", sSelectedKey);
            oCartModel.setProperty("/paymentTypeSelected", true);
            oCartModel.setProperty("/showCardInfo", sSelectedKey === "Card");

            // 설정된 값을 로그로 확인합니다.
            console.log("Selected Payment Type:", sSelectedKey);
            console.log("Cart Model:", oCartModel.getProperty("/summaryData/selectedPaymentType"));
        },

        onNextStep: function () {
            var oCartModel = this.getView().getModel("cart");
            var sSelectedPaymentType = oCartModel.getProperty("/selectedPaymentType");
            var oWizard = this.byId("paymentWizard");

            if (sSelectedPaymentType === "KakaoPay") {
                // Skip to the idAddress step
                var oSteps = oWizard.getSteps();
                for (var i = oWizard.getProgress(); i < oSteps.length; i++) {
                    oWizard.nextStep();
                }
            } else {
                oWizard.nextStep();
            }
        },

        onNavBack: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteHome");
        },

        validateCardInfo: function () {
            var oView = this.getView();
            var bValid = oView.byId("creditCardHolderName").getValueState() === "None" && oView.byId("creditCardHolderName").getValue().trim() !== "" &&
                         oView.byId("creditCardNumber").getValueState() === "None" && oView.byId("creditCardNumber").getValue().trim() !== "" &&
                         oView.byId("creditCardSecurityNumber").getValueState() === "None" && oView.byId("creditCardSecurityNumber").getValue().trim() !== "" &&
                         oView.byId("creditCardExpirationDate").getValueState() === "None" && oView.byId("creditCardExpirationDate").getValue().trim() !== "";
        
            this.getView().getModel("cart").setProperty("/isCardInfoValid", bValid);
        },

        checkCardHolderName: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var oRegex = /^[a-zA-Z가-힣]+$/;
            if (sValue.length >= 2 && oRegex.test(sValue)) {
                oInput.setValueState("None");
            } else {
                oInput.setValueState("Error");
            }
            this.validateCardInfo();
        },

        checkCardNumber: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var oRegex = /^[0-9-]+$/;
            var isValid = sValue.length === 19 && oRegex.test(sValue); // 19 includes 16 digits + 3 hyphens
            
            if (isValid) {
                oInput.setValueState("None");
            } else {
                oInput.setValueState("Error");
                oInput.setValueStateText("유효한 카드번호를 입력해주세요.");
            }
            this.validateCardInfo();
        },

        checkSecurityCode: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var oRegex = /^[0-9]{3}$/;
            var isValid = oRegex.test(sValue);
            
            if (isValid) {
                oInput.setValueState("None");
            } else {
                oInput.setValueState("Error");
                oInput.setValueStateText("3자리의 숫자만 입력해주세요.");
            }
            this.validateCardInfo();
        },

        checkExpirationDate: function(oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();
            var isValidFormat = /^(0[1-9]|1[0-2])\/\d{4}$/.test(sValue); // Check if the format is MM/YYYY
        
            if (!isValidFormat) {
                oInput.setValueState("Error");
                oInput.setValueStateText("유효한 날짜를 입력해주세요.");
                return;
            }
        
            var aDateParts = sValue.split("/");
            var nInputMonth = parseInt(aDateParts[0], 10);
            var nInputYear = parseInt(aDateParts[1], 10);
        
            var oToday = new Date();
            var nCurrentMonth = oToday.getMonth() + 1; // getMonth() is 0-based
            var nCurrentYear = oToday.getFullYear();
        
            if (nInputYear < nCurrentYear || (nInputYear === nCurrentYear && nInputMonth < nCurrentMonth)) {
                oInput.setValueState("Error");
                oInput.setValueStateText("유효기간이 만료되었습니다.");
            } else {
                oInput.setValueState("None");
            }

            this.validateCardInfo();
        },

        _loadDaumPostcodeScript: function () {
            return new Promise((resolve, reject) => {
                if (typeof daum !== "undefined") {
                    // 이미 로드된 경우 바로 resolve
                    resolve();
                    return;
                }
                var script = document.createElement("script");
                script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
                script.onload = () => {
                    console.log("Daum Postcode script loaded");
                    resolve();
                };
                script.onerror = () => {
                    console.error("Failed to load Daum Postcode script");
                    reject(new Error("Failed to load Daum Postcode script"));
                };
                document.head.appendChild(script);
            });
        },

        onFindAddress: function () {
            console.log("onFindAddress 호출됨");
            if (typeof daum === "undefined") {
                console.error("Daum Postcode API 스크립트가 로드되지 않았습니다.");
                return;
            }
            new daum.Postcode({
                oncomplete: function(data) {
                    console.log("API 호출 후 데이터 반환: ", data);
                    var addr = ''; // 주소 변수
                    var extraAddr = ''; // 참고항목 변수

                    if (data.userSelectedType === 'R') { // 도로명 주소
                        addr = data.roadAddress;
                    } else { // 지번 주소
                        addr = data.jibunAddress;
                    }

                    if(data.userSelectedType === 'R'){
                        if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
                            extraAddr += data.bname;
                        }
                        if(data.buildingName !== '' && data.apartment === 'Y'){
                            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                        }
                        if(extraAddr !== ''){
                            extraAddr = ' (' + extraAddr + ')';
                        }
                        this.getView().byId("idExtraAddress").setValue(extraAddr);
                    } else {
                        this.getView().byId("idExtraAddress").setValue('');
                    }

                    this.getView().byId('idPostcode').setValue(data.zonecode);
                    this.getView().byId("idAddress").setValue(addr);
                    this.getView().byId("idDetailAddress").focus();
                }.bind(this)
            }).open();
        },
        onCheck: function () {
            var oCartModel = this.getView().getModel("cart");
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            var oSummaryData = {
                cartItems: oCartModel.getProperty("/cartItems"),
                selectedPaymentType: oCartModel.getProperty("/selectedPaymentType"),
                cardOwner: oCartModel.getProperty("/cardOwner"),
                cardNumber: oCartModel.getProperty("/cardNumber"),
                cvc: oCartModel.getProperty("/cvc"),
                expiryDate: oCartModel.getProperty("/expiryDate"),
                totalPrice: oCartModel.getProperty("/totalPrice"),
                deliveryAddress: {
                    postcode: this.getView().byId("idPostcode").getValue(),
                    address: this.getView().byId("idAddress").getValue(),
                    detailAddress: this.getView().byId("idDetailAddress").getValue(),
                    extraAddress: this.getView().byId("idExtraAddress").getValue()
                }
            };

            // cart 모델에 summaryData를 설정합니다.
            oCartModel.setProperty("/summaryData", oSummaryData);

            // 페이지 이동
            oRouter.navTo("RouteSummary");
        },

        // onCheck: function () {
        // var oCartModel = this.getView().getModel("cart");
            // var oGlobalModel = this.getView().getModel("globalModel");
        // var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            
            // var oSummaryData = {
            //     items: oCartModel.getProperty("/cartItems"),
            //     paymentType: oCartModel.getProperty("/selectedPaymentType"),
            //     bankDetails: {
            //         beneficiaryName: "Singapore Hardware e-Commerce LTD",
            //         bankName: "CITY BANK, SINGAPORE BRANCH",
            //         accountNumber: "06110702027218"
            //     },
            //     invoiceAddress: {
            //         address: "sdasasd",
            //         city: "sesadsa"
            //     },
            //     total: this._calculateTotal(oCartModel.getProperty("/cartItems"))
            // };

            // 글로벌 모델에 데이터 설정
            // oGlobalModel.setProperty("/summaryData", oSummaryData);

            // 페이지 이동
        // oRouter.navTo("RouteSummary");
        // },
        
        _calculateTotal: function (aCartItems) {
            return aCartItems.reduce(function (acc, item) {
                return acc + (item.price * item.quantity);
            }, 0);
        },

        onInputChange: function () {
            var bAllFilled = this._checkAllInputFilled();
            this.getView().byId("checkButton").setEnabled(bAllFilled);
        },

        _checkAllInputFilled: function () {
            var aInputIds = [
                "idPostcode",
                "idAddress",
                "idDetailAddress",
                "idExtraAddress"
            ];

            return aInputIds.every(function (sId) {
                var oInput = this.getView().byId(sId);
                return oInput && oInput.getValue().trim() !== "";
            }, this);
        },

    });
});
