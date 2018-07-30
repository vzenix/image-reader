function openViewer() {
    if (typeof chrome !== typeof undefined && typeof chrome.tabs !== typeof undefined) {
        chrome.tabs.executeScript({
            code: `window.openImageReaderViewer()`
        });

        return;
    }

    if (typeof browser !== typeof undefined && typeof browser.tabs !== typeof undefined) {
        browser.tabs.executeScript({
            code: `window.openImageReaderViewer()`
        });

        return;
    }
}

function loadSettings() {
    var getting = browser.storage.local.get("color");
    getting.then(onGot, onError);

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    function onGot(item) {
        var color = "blue";
        if (item.color) {
            color = item.color;
        }
        document.body.style.border = "10px solid " + color;
    }
}

if (typeof chrome !== typeof undefined && typeof chrome.browserAction !== typeof undefined) {
    chrome.browserAction.onClicked.addListener(openViewer);
} else if (typeof browser !== typeof undefined && typeof browser.browserAction !== typeof undefined) {
    browser.browserAction.onClicked.addListener(openViewer);
}
