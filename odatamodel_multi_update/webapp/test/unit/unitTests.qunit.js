/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"synce25/odatamodel_multi_update/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
