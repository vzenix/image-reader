/* minWidthShow minHeightShow orderDefault orderDefaultDirection */

function saveOptions(e) {
    e.preventDefault();
    browser.storage.local.set({
        minWidthShow: document.querySelector("#minWidthShow").value,
        minHeightShow: document.querySelector("#minHeightShow").value,
        orderDefault: document.querySelector("#orderDefault").value,
        orderDefaultDirection: document.querySelector("#orderDefaultDirection").value
    });
}

function restoreOptions() {
    function setCurrentChoice(result) {
        document.querySelector("#minWidthShow").value = result.minWidthShow || 32;
        document.querySelector("#minHeightShow").value = result.minHeightShow || 32;
        document.querySelector("#orderDefault").value = result.orderDefault || "A01";
        document.querySelector("#orderDefaultDirection").value = result.orderDefaultDirection || "DESC";
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var getting = browser.storage.local.get(["minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection"]);
    getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
