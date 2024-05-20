/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"synce25/exercise8/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
