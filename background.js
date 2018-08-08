function openViewer(opt) {

    if (typeof browser !== typeof undefined && typeof browser.tabs !== typeof undefined) {
        browser.tabs.query({
            currentWindow: true,
            active: true
        }).then(onLoadTab).catch(onError);
        return;
    }

    if (typeof chrome !== typeof undefined && typeof chrome.tabs !== typeof undefined) {
        chrome.tabs.query({
            currentWindow: true,
            active: true
        }).then(onLoadTab).catch(onError);
        return;
    }

    function onLoadTab(tabs) {
        for (let tab of tabs) {
            browser.tabs
                .sendMessage(
                    tab.id, {
                        action: "show",
                        options: opt
                    }
                )
                .then(response => {})
                .catch(onError);
        }
    }
}

function load() {
    var getting;
    if (typeof browser !== typeof undefined && typeof browser.browserAction !== typeof undefined) {
        getting = browser.storage.local.get(["minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection"]);
    } else if (typeof chrome !== typeof undefined && typeof chrome.browserAction !== typeof undefined) {
        getting = chrome.storage.local.get(["minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection"]);
    }

    getting.then(onGot, onError);

    function onGot(item) {

        let iOptToSend = {
            minWidthShow: typeof item.minWidthShow !== typeof undefined ? parseInt(item.minWidthShow, 10) : 32,
            minHeightShow: typeof item.minHeightShow !== typeof undefined ? parseInt(item.minHeightShow, 10) : 32,
            orderDefault: typeof item.orderDefault !== typeof undefined ? item.orderDefault : "DESC",
            orderDefaultDirection: typeof item.orderDefaultDirection !== typeof undefined ? item.orderDefaultDirection : "A01"
        };

        openViewer(iOptToSend);
    }
}

function onError(error) {
    console.log(`Error: ${error}`);
}

if (typeof chrome !== typeof undefined && typeof chrome.browserAction !== typeof undefined) {
    chrome.browserAction.onClicked.addListener(load);
} else if (typeof browser !== typeof undefined && typeof browser.browserAction !== typeof undefined) {
    browser.browserAction.onClicked.addListener(load);
}