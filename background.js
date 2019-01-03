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
        }, onLoadTab);
        return;
    }

    onError("Can't load 'chrome.tabs' or 'browser.tabs'");

    function onLoadTab(tabs) {
        for (let tab of tabs) {
            if (typeof browser !== typeof undefined && typeof browser.tabs !== typeof undefined) {
                browser.tabs
                    .sendMessage(
                        tab.id, {
                            url: tab.url,
                            action: "show",
                            options: opt
                        }).then(response => {}).catch(onError);
            } else if (typeof chrome !== typeof undefined && typeof chrome.tabs !== typeof undefined) {
                chrome.tabs
                    .sendMessage(
                        tab.id, {
                            url: tab.url,
                            action: "show",
                            options: opt
                        });
            }
        }
    }
}

function load() {
    if (typeof browser !== typeof undefined && typeof browser.storage !== typeof undefined) {
        let getting = browser.storage.local.get(["minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection", "duplicates"]);
        getting.then(onGot, onError);
    } else if (typeof chrome !== typeof undefined && typeof chrome.storage !== typeof undefined) {
        chrome.storage.local.get(["minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection", "duplicates"], onGot);
    } else {
        onError("Can't load 'chrome.storage.local' or 'browser.storage.local'");
        return;
    }

    function onGot(item) {

        let iOptToSend = {
            minWidthShow: typeof item.minWidthShow !== typeof undefined ? parseInt(item.minWidthShow, 10) : 32,
            minHeightShow: typeof item.minHeightShow !== typeof undefined ? parseInt(item.minHeightShow, 10) : 32,
            orderDefault: typeof item.orderDefault !== typeof undefined ? item.orderDefault : "DESC",
            orderDefaultDirection: typeof item.orderDefaultDirection !== typeof undefined ? item.orderDefaultDirection : "A01",
            duplicates: typeof item.duplicates !== typeof undefined ? item.duplicates : 0
        };

        openViewer(iOptToSend);
    }
}

function onError(error) {
    console.log(`Error: ${error}`);
}

if (typeof browser !== typeof undefined && typeof browser.browserAction !== typeof undefined) {
    browser.browserAction.onClicked.addListener(load);

    browser.contextMenus.create({
        id: "vz-view-gallery",
        title: 'Image reader',
        contexts: ["all"],
        onclick: load
    });

} else if (typeof chrome !== typeof undefined && typeof chrome.browserAction !== typeof undefined) {
    chrome.browserAction.onClicked.addListener(load);

    chrome.contextMenus.create({
        id: "vz-view-gallery",
        title: 'Image reader',
        contexts: ["all"],
        onclick: load
    });

} else {
    onError("Can't load 'chrome.browserAction.onClicked' or 'browser.browserAction.onClicked'");
}