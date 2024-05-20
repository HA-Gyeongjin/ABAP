/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"synce25/hw1review/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
