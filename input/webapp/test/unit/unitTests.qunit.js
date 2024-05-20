/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"synce25/input/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
