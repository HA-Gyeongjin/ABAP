sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/f/LayoutType",
    "sap/ui/Device",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/core/UIComponent"
], function (Controller, JSONModel, LayoutType, Device, MessageBox, History, UIComponent) {
    "use strict";

    return Controller.extend("sync.zec.sales1.controller.Home", {
        onInit: function () {
            var oCartModel = this.getOwnerComponent().getModel("cart");
            this.getView().setModel(oCartModel, "cart");

            // 초기 레이아웃 설정
            var oLayoutModel = new JSONModel({
                layout: LayoutType.TwoColumnsMidExpanded
            });
            this.getView().setModel(oLayoutModel, "appView");

            // Listen to screen size changes
            Device.media.attachHandler(this._onResize.bind(this), null, Device.media.RANGESETS.SAP_STANDARD);

            
        },

        onToggleCart: function (oEvent) {
            var oFlexibleColumnLayout = this.byId("flexibleColumnLayout");
            var bPressed = oEvent.getParameter("pressed");

            if (bPressed) {
                oFlexibleColumnLayout.setLayout(LayoutType.ThreeColumnsMidExpanded);
            } else {
                oFlexibleColumnLayout.setLayout(LayoutType.TwoColumnsMidExpanded);
            }
        },

        onAddToCart: function () {
            var oCartModel = this.getView().getModel("cart");
            var oSelectedProduct = oCartModel.getProperty("/selectedProduct");

            // Check if selectedProduct is defined and not empty
            if (!oSelectedProduct || !oSelectedProduct.Maktx) {
                sap.m.MessageToast.show("No product selected to add to the cart.");
                return;
            }

            var aCartItems = oCartModel.getProperty("/cartItems");
            var oExistingItem = aCartItems.find(function(item) {
                return item.Maktx === oSelectedProduct.Maktx;
            });

            if (oExistingItem) {
                oExistingItem.Quantity += 1;
            } else {
                oSelectedProduct.Quantity = 1;
                oSelectedProduct.Image = "../images/" + oSelectedProduct.Maktx + ".jpg"; // 이미지 경로 추가
                aCartItems.push(oSelectedProduct);
            }

            oCartModel.setProperty("/cartItems", aCartItems);
            // Update total price
            this._updateTotalPrice();
        },

        _updateTotalPrice: function () {
            var oCartModel = this.getView().getModel("cart");
            var aCartItems = oCartModel.getProperty("/cartItems");
            var fTotalPrice = aCartItems.reduce(function (fSum, oItem) {
                return fSum + (oItem.Netpr * oItem.Quantity);
            }, 0);
            oCartModel.setProperty("/totalPrice", fTotalPrice);
        },

        onSelectProduct: function (oEvent) {
            var oProduct = oEvent.getSource().getBindingContext().getObject();
            var oView = this.getView();
            var oCartModel = oView.getModel("cart");

            
            oCartModel.setProperty("/selectedProduct", oProduct);
            
            // Set additional text based on the value of oProduct.Maktx
            switch (oProduct.Maktx) {
                case "B-아르기닌":
                    oCartModel.setProperty("/selectedProduct/AdditionalText", "상품설명 : Special text for B-아르기닌");
                    break;
                case "B-비타민B플러스":
                    oCartModel.setProperty("/selectedProduct/AdditionalText", "상품설명 : Details for B-비타민B플러스");
                    break;
                case "B-밀크씨슬":
                    oCartModel.setProperty("/selectedProduct/AdditionalText", "상품설명 : Information about B-밀크씨슬");
                    break;
                default:
                    oCartModel.setProperty("/selectedProduct/AdditionalText", "상품설명 : Default additional text");
                    break;
            }

        },

        _onResize: function (oEvent) {
            var oLayoutModel = this.getView().getModel("appView");
            var sLayout = oLayoutModel.getProperty("/layout");

            if (oEvent.name === "Phone") {
                if (sLayout !== LayoutType.OneColumn) {
                    oLayoutModel.setProperty("/layout", LayoutType.OneColumn);
                }
            } else if (oEvent.name === "Tablet") {
                if (sLayout !== LayoutType.TwoColumnsStartExpanded) {
                    oLayoutModel.setProperty("/layout", LayoutType.TwoColumnsStartExpanded);
                }
            } else {
                if (sLayout !== LayoutType.ThreeColumnsMidExpandedEndHidden) {
                    oLayoutModel.setProperty("/layout", LayoutType.ThreeColumnsMidExpandedEndHidden);
                }
            }
        },

        onEditCart: function () {
            var oCartModel = this.getView().getModel("cart");
            oCartModel.setProperty("/editMode", true); // 편집 모드 활성화
        },

        onSaveChanges: function () {
            var oCartModel = this.getView().getModel("cart");
            oCartModel.setProperty("/editMode", false); // 편집 모드 비활성화
        },
        onDeleteItem: function (oEvent) {
            var oButton = oEvent.getSource();
            var oItemContext = oButton.getBindingContext("cart");
            var sEntryId = oItemContext.getObject().Maktx;
            var oCartModel = oItemContext.getModel();
            var aCartItems = oCartModel.getProperty("/cartItems");
        
            MessageBox.confirm("장바구니에서 상품을 삭제하시겠습니까?", {
                title: "상품 삭제",
                actions: ["삭제", "취소"],
                onClose: function (oAction) {
                    if (oAction === "삭제") {
                        var aUpdatedCartItems = aCartItems.filter(function(item) {
                            return item.Maktx !== sEntryId;
                        });
        
                        oCartModel.setProperty("/cartItems", aUpdatedCartItems);
                        this._updateTotalPrice(); // Update total price
                    }
                }.bind(this)
            });
        },

        onPayment: function () {
            var oRouter = UIComponent.getRouterFor(this);
            var oCartModel = this.getView().getModel("cart");
            var aCartItems = oCartModel.getProperty("/cartItems");

            if (aCartItems.length > 0) {
                // 아이템이 존재할 경우 'Payment1' 뷰로 이동
                oRouter.navTo("RoutePayment", {
                    cartItems: encodeURIComponent(JSON.stringify(aCartItems))
                });
            } else {
                // 카트에 아이템이 없을 경우 메시지 표시
                sap.m.MessageToast.show("장바구니에 상품이 없습니다.");
            }
        }
        
    });
});