/* global RspamdSpamness:false */

"use strict";

var prefObserver = {
    register: function() {
        this.branch = Services.prefs.getBranch("extensions.rspamd-spamness.");

        // This is only necessary prior to Gecko 13
        if (!("addObserver" in this.branch)) {
            this.branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
        }

        this.branch.addObserver("", this, false);
    },
    unregister: function() {
        this.branch.removeObserver("", this);
    },
    observe: function(aSubject, aTopic, aData) {
        if (aTopic !== "nsPref:changed") {
            return;
        }
        if (aData === "trainingButtons.defaultAction") {
            RspamdSpamness.setBtnCmdLabels();
        }
    }
};

var toolbarObserver = {
    observe: function (aSubject, aTopic, aData) {
        document.getElementById("header-view-toolbar")
            .addEventListener("drop", this.setBtnCmdLabels, false);
    },
    setBtnCmdLabels: function () {
        RspamdSpamness.setBtnCmdLabels();
    }
};

RspamdSpamness.onLoad = function() {
    const prefs = Services.prefs;

    RspamdSpamness.previousSpamnessHeader = prefs.getCharPref("extensions.rspamd-spamness.header").toLowerCase();
    RspamdSpamness.syncHeaderPrefs(RspamdSpamness.previousSpamnessHeader);
    RspamdSpamness.setBtnCmdLabels();

    // whether this column gets default status
    var defaultCol = prefs.getBoolPref("extensions.rspamd-spamness.isDefaultColumn");
    if (defaultCol) {
        RspamdSpamness.addSpamnessColumn();
    }
    
    // first time info, should only ever show once
    var greet = prefs.getBoolPref("extensions.rspamd-spamness.installationGreeting");
    if (greet) {
        RspamdSpamness.greet();
        prefs.setBoolPref("extensions.rspamd-spamness.installationGreeting", false);
        prefs.savePrefFile(null);
    }

    prefObserver.register();
    Services.obs.addObserver(toolbarObserver, "mail:updateToolbarItems", false);
};

RspamdSpamness.onUnload = function() {
    Services.obs.removeObserver(optionObserver, "addon-options-displayed", false);
    window.removeEventListener("load", RspamdSpamness.onLoad, false);
    window.removeEventListener("unload", RspamdSpamness.onUnload, false);
};

window.addEventListener("load", RspamdSpamness.onLoad, false);
window.addEventListener("unload", RspamdSpamness.onUnload, false);
