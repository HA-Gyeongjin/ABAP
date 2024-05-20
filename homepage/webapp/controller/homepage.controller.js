sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("sync.zec.homepage.controller.homepage", {
            onInit: function () {
                // Add press event listeners to VBoxes
                this.byId("regularProductSection").attachBrowserEvent("click", this.onRegularProductPress.bind(this));
                this.byId("subscriptionProductSection").attachBrowserEvent("click", this.onSubscriptionProductPress.bind(this));
            },
    
            onRegularProductPress: function () {
                // 일반 상품 섹션 클릭 시 실행할 코드
                sap.m.MessageToast.show("일반 상품 섹션이 클릭되었습니다.");
            },
    
            onSubscriptionProductPress: function () {
                // 구독 상품 섹션 클릭 시 실행할 코드
                sap.m.MessageToast.show("구독 상품 섹션이 클릭되었습니다.");
            }
        });
    });
