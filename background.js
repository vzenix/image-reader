function openViewer() {
    if (typeof chrome !== typeof undefined && typeof chrome.tabs !== typeof undefined) {
        chrome.tabs.executeScript({
            code: `document.__vz.imageReader.openImageReaderViewer()`
        });

        return;
    }

    if (typeof browser !== typeof undefined && typeof browser.tabs !== typeof undefined) {
        browser.tabs.executeScript({
            code: `document.__vz.imageReader.openImageReaderViewer()`
        });

        return;
    }
}

/* minWidthShow minHeightShow orderDefault orderDefaultDirection */
function loadSettings() {
    var getting;
    if (typeof chrome !== typeof undefined && typeof chrome.browserAction !== typeof undefined) {
        getting = chrome.storage.local.get("minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection");
    } else if (typeof browser !== typeof undefined && typeof browser.browserAction !== typeof undefined) {
        getting = browser.storage.local.get("minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection");
    }

    getting.then(onGot, onError);

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    function onGot(item) {
        var minWidthShow = 32;
        if (item.minWidthShow) {
            minWidthShow = item.minWidthShow;
        }
    }
}

if (typeof chrome !== typeof undefined && typeof chrome.browserAction !== typeof undefined) {
    chrome.browserAction.onClicked.addListener(openViewer);
} else if (typeof browser !== typeof undefined && typeof browser.browserAction !== typeof undefined) {
    browser.browserAction.onClicked.addListener(openViewer);
}
