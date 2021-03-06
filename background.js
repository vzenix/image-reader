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
        let getting = browser.storage.local.get(["minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection", "duplicates", "openAuto"]);
        getting.then(onGot, onError);
    } else if (typeof chrome !== typeof undefined && typeof chrome.storage !== typeof undefined) {
        chrome.storage.local.get(["minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection", "duplicates", "openAuto"], onGot);
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
            duplicates: typeof item.duplicates !== typeof undefined ? item.duplicates : 0,
            openAuto: typeof item.openAuto === typeof 'string' ? item.openAuto : ''
        };

        openViewer(iOptToSend);
    }
}

function tabsController(tabId, action, changeInfo, tab) {

    if (typeof browser !== typeof undefined && typeof browser.storage !== typeof undefined) {
        let getting = browser.storage.local.get(["minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection", "duplicates", "openAuto"]);
        getting.then((item) => sendMessageToWebpage(item, tabId, action, changeInfo, tab), onError);
    } else if (typeof chrome !== typeof undefined && typeof chrome.storage !== typeof undefined) {
        chrome.storage.local.get(["minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection", "duplicates", "openAuto"], (item) => sendMessageToWebpage(item, tabId, action, changeInfo, tab));
    } else {
        onError("Can't load 'chrome.storage.local' or 'browser.storage.local'");
        return;
    }

}

/**
 * Send message to webpage
 * @param {*} item browser|chrome.storage.local.get result
 * @param {*} tabId browser|chrome.tabs.onUpdated.addListener result
 * @param {*} action 
 * @param {*} changeInfo browser|chrome.tabs.onUpdated.addListener result
 * @param {*} tab 
 */
function sendMessageToWebpage(item, tabId, action, changeInfo, tab) {

    let iOptToSend = {
        minWidthShow: typeof item.minWidthShow !== typeof undefined ? parseInt(item.minWidthShow, 10) : 32,
        minHeightShow: typeof item.minHeightShow !== typeof undefined ? parseInt(item.minHeightShow, 10) : 32,
        orderDefault: typeof item.orderDefault !== typeof undefined ? item.orderDefault : "DESC",
        orderDefaultDirection: typeof item.orderDefaultDirection !== typeof undefined ? item.orderDefaultDirection : "A01",
        duplicates: typeof item.duplicates !== typeof undefined ? item.duplicates : 0,
        openAuto: typeof item.openAuto === typeof 'string' ? item.openAuto : ''
    };

    if (typeof browser !== typeof undefined && typeof browser.tabs !== typeof undefined) {
        browser.tabs
            .sendMessage(
                tabId, {
                    url: changeInfo.url,
                    action: action,
                    options: iOptToSend
                }).then(response => {}).catch(onError);

        return;
    }

    if (typeof chrome !== typeof undefined && typeof chrome.tabs !== typeof undefined) {
        try {
            chrome.tabs
                .sendMessage(
                    tabId, {
                        // url: changeInfo.url,
                        action: action,
                        options: iOptToSend
                    }, (r) => console.log(r));
        } catch (ex) {

        }

        return;
    }

    console.warn('Can\'t find "chrome.tabs.sendMessage" or "browser.tabs.sendMessage" or tabId', tabId);
}

function onError(error) {
    console.warn(`Error: ${error}`);
}

if (typeof browser !== typeof undefined && typeof browser.browserAction !== typeof undefined) {
    browser.browserAction.onClicked.addListener(load);

    try {
        browser.contextMenus.create({
            id: "vz-view-gallery",
            title: 'Image reader',
            contexts: ["all"],
            onclick: load
        });
    } catch (ex) {
        console.warn(ex);
    }

    browser.tabs.onCreated.addListener((tabId, changeInfo, tab) => tabsController(tabId, "created", changeInfo, tab));
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => tabsController(tabId, "updated", changeInfo, tab));

} else if (typeof chrome !== typeof undefined && typeof chrome.browserAction !== typeof undefined) {
    chrome.browserAction.onClicked.addListener(load);

    try {
        chrome.contextMenus.create({
            id: "vz-view-gallery",
            title: 'Image reader',
            contexts: ["all"],
            onclick: load
        });
    } catch (ex) {
        console.warn(ex);
    }

    chrome.tabs.onCreated.addListener((tabId, changeInfo, tab) => tabsController(tabId, "created", changeInfo, tab));
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => tabsController(tabId, "updated", changeInfo, tab));

} else {
    onError("Can't load 'chrome.browserAction.onClicked' or 'browser.browserAction.onClicked'");
}