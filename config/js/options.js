/* minWidthShow minHeightShow orderDefault orderDefaultDirection */

// let DIRECTION_HEIGHT = "A01";
// let DIRECTION_WIDTH = "A02";

function saveOptions(e) {
    e.preventDefault();

    if (typeof browser !== typeof undefined && typeof browser.storage !== typeof undefined && typeof browser.storage.local !== typeof undefined) {
        browser.storage.local.set({
            minWidthShow: document.querySelector("#minWidthShow").value,
            minHeightShow: document.querySelector("#minHeightShow").value,
            orderDefault: document.querySelector("#orderDefault").value,
            orderDefaultDirection: document.querySelector("#orderDefaultDirection").value,
            duplicates: document.querySelector("#duplicates").value,
            openAuto: document.querySelector("#openAuto").value
        });
    } else if (typeof chrome !== typeof undefined && typeof chrome.storage !== typeof undefined && typeof chrome.storage.local !== typeof undefined) {
        chrome.storage.local.set({
            minWidthShow: document.querySelector("#minWidthShow").value,
            minHeightShow: document.querySelector("#minHeightShow").value,
            orderDefault: document.querySelector("#orderDefault").value,
            orderDefaultDirection: document.querySelector("#orderDefaultDirection").value,
            duplicates: document.querySelector("#duplicates").value,
            openAuto: document.querySelector("#openAuto").value
        }, () => {});
    }

    document.querySelector("#msgOk").style.display = "block";
    setTimeout(() => {
        document.querySelector("#msgOk").style.display = "none";
    }, 5000);
}

function restoreOptions() {
    function setCurrentChoice(result) {
        if (document.querySelector("#minWidthShow")) {
            document.querySelector("#minWidthShow").value = result.minWidthShow || 32;
        }

        if (document.querySelector("#minHeightShow")) {
            document.querySelector("#minHeightShow").value = result.minHeightShow || 32;
        }

        if (document.querySelector("#orderDefault")) {
            document.querySelector("#orderDefault").value = result.orderDefault || "A01";
        }

        if (document.querySelector("#orderDefaultDirection")) {
            document.querySelector("#orderDefaultDirection").value = result.orderDefaultDirection || "DESC";
        }

        if (document.querySelector("#duplicates")) {
            document.querySelector("#duplicates").value = result.duplicates || 0;
        }

        if (document.querySelector("#openAuto")) {
            document.querySelector("#openAuto").value = result.openAuto || '(http|https):\\/\\/(sample.es)\\/(something)\\/(.*).jpg\n';
        }
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    if (typeof browser !== typeof undefined && typeof browser.storage !== typeof undefined && typeof browser.storage.local !== typeof undefined) {
        let getting = browser.storage.local.get(["minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection", "duplicates", "openAuto"]);
        getting.then(setCurrentChoice, onError);
    } else if (typeof chrome !== typeof undefined && typeof chrome.storage !== typeof undefined && typeof chrome.storage.local !== typeof undefined) {
        chrome.storage.local.get(["minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection", "duplicates", "openAuto"], setCurrentChoice);
    } else {
        onError("Can't find 'chrome.storage.local' or 'browser.storage.local'");
        return;
    }


}

document.addEventListener("DOMContentLoaded", restoreOptions);

if (document.querySelector("form")) {
    document.querySelector("form").addEventListener("submit", saveOptions);
}