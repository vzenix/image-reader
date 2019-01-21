(function () {

    //
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //  Globals and initializations
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    //

    // Init space form vars into webpage
    if (typeof document.__vz === typeof undefined) {
        document.__vz = {};
    }

    if (typeof document.__vz.imageReader === typeof undefined) {
        document.__vz.imageReader = {};
    }

    // Constants
    document.__vz.imageReader.currentImage = 0;
    document.__vz.imageReader.loadingPage = true;
    document.__vz.imageReader.images = new Array();
    document.__vz.imageReader.checkAutoOpen = false;
    document.__vz.imageReader.configLoaded = false;

    // Functions
    document.__vz.imageReader.openImageReaderViewer = openImageReaderViewer;
    document.__vz.imageReader.hideImageReaderViewer = removeUI;
    document.__vz.imageReader.setConfigImageReader = setConfigImageReader;

    // Script
    document.__vz.imageReader.setConfigImageReader({
        minWidthShow: 32,
        minHeightShow: 32,
        orderDefault: "DESC",
        orderDefaultDirection: "A01",
        openAuto: ""
    });

    // Init events and callbacks
    prepare();

    // Prepare
    function prepare() {
        // On Message
        if (typeof browser !== typeof undefined && typeof browser.runtime != typeof undefined && browser.runtime.onMessage !== typeof undefined) {
            browser.runtime.onMessage.addListener(onMessageListener);
        } else if (typeof chrome !== typeof undefined && typeof chrome.runtime != typeof undefined && chrome.runtime.onMessage !== typeof undefined) {
            chrome.runtime.onMessage.addListener(onMessageListener);
        } else {
            onError("can't get 'browser.runtime.onMessage' or 'chrome.runtime.onMessage'");
            return;
        }

        document.addEventListener('keyup', keyupEvents, false);
        window.addEventListener("load", reloadOnFinishLoad);
        document.body.addEventListener("load", reloadOnFinishLoad);
    }

    //
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //  A little functionallity
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    //

    // Call when event listener load finish
    function reloadOnFinishLoad() {
        if (!document.__vz.imageReader.loadingPage) {
            return;
        }

        document.__vz.imageReader.loadingPage = false;
        reloadImages();
        goToImage(document.__vz.imageReader.currentImage);
        checkLoading();
    }

    // Read images from current webpage
    function getAllImages() {
        let imgs = document.querySelectorAll('img');
        let src = new Array();
        let indexed = new Array();
        let bDuplicates = getConfig("duplicates");

        for (let i = 0; i < imgs.length; i++) {

            if (imgs[i] && imgs[i].src) {

                let toPush = {
                    width: !imgs[i].naturalWidth ? 1 : imgs[i].naturalWidth,
                    height: !imgs[i].naturalHeight ? 1 : imgs[i].naturalHeight,
                    src: imgs[i].src
                };

                let bCanBySize = toPush.height >= getConfig("minHeightShow") && toPush.width >= getConfig("minWidthShow");
                let bCanByDuplucate = bDuplicates || indexed.indexOf(toPush.width + toPush.height + toPush.src) < 0;

                if (bCanBySize && bCanByDuplucate) {
                    src.push(toPush);
                    indexed.push(toPush.width + toPush.height + toPush.src);
                }

            }
        }

        checkLoading();
        return src;
    }

    // Read images from current webpage and order its
    function reloadImages() {
        let order = getConfig("orderDefault");
        let direction = getConfig("orderDefaultDirection");
        document.__vz.imageReader.images = getAllImages();

        document.__vz.imageReader.images.sort(function (a, b) {
            switch (order) {
                // width
                case "A02":
                    return direction === "ASC" ? a.width > b.width : a.width < b.width;

                    // height
                case "A01":
                default:
                    return direction === "ASC" ? a.height > b.height : a.height < b.height;
            }
        });
    }

    // Movement in Image browser view
    function rightImage() {
        goToImage(document.__vz.imageReader.currentImage + 1);
    };

    // Movement in Image browser view
    function leftImage() {
        goToImage(document.__vz.imageReader.currentImage - 1);
    };

    // Movement in Image browser view
    function goToImage(index) {
        if (!document.getElementById('imageReaderBGID')) {
            return;
        }

        document.__vz.imageReader.currentImage = index;
        if (document.__vz.imageReader.currentImage < 0) {
            document.__vz.imageReader.currentImage = document.__vz.imageReader.images.length - 1;
        }

        if (document.__vz.imageReader.currentImage >= document.__vz.imageReader.images.length) {
            document.__vz.imageReader.currentImage = 0;
        }

        document.getElementById('imageReaderContainerCurrentImage').remove();
        document.getElementById('imageReaderContainerCurrentImageContainer').innerHTML = '<img id="imageReaderContainerCurrentImage" />';
        document.getElementById('imageReaderContainerCurrentImage').src = document.__vz.imageReader.images[document.__vz.imageReader.currentImage].src;

        if (document.getElementById('imageReaderContainerCountID')) {
            document.getElementById('imageReaderContainerCountID').innerHTML = (document.__vz.imageReader.currentImage + 1) + ' / ' + document.__vz.imageReader.images.length;
        }
    }

    // Global function for open viewer
    function openImageReaderViewer() {
        if (document.getElementById('imageReaderBGID')) {
            removeUI();
            return;
        }

        prepareViewer();
    };

    //
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //  View Image browser
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    //

    function prepareViewer() {

        reloadImages();

        if (document.getElementById('imageReaderBGID')) {
            return;
        }

        if (document.__vz.imageReader.images.length <= 0) {
            alert("No images");
            return;
        }

        let closeImageBtn = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAAwklEQVR4Ae2WAQbDQBBFB8ndAgL2kCW0VPRsiV19xRwg36eL2HeA/9idmZkYDAb3hYmNEiIUNqbQYWYHGkWMb8DOrAveJI01LmClkTx1wcJJUlkv4ivJyRLhK/R4X6HH64pKUln8ePmFZbmvkJ/PV1jxaqWnwowXejU5OIUm9BWJMEYsxdeP1wRNFvR/Ir2ODg7/k6VO0Mu0f6P1HxX+sOs/rnstnA4r01j6zVDw0puJYpwt1uH1Yf7n6fhgitsyGAx+v01bGP41zTEAAAAASUVORK5CYII=';
        let appsImageBtn = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwAQAAAAB/ecQqAAAAAnRSTlMAAHaTzTgAAAAWSURBVHgBYyAb/Of/8J9kaoibSRgAAApFR7lF7fQlAAAAAElFTkSuQmCC';
        let arrowBackBtn = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAe0lEQVR4Ae2ZAQaAQBAA7xsBBPe3HOAAvSP0wrhHTEgEEe6wmnnBDIBJItIPYAHmqPKFiwOYo8rziMhR5W8aMEWVB9jTOJSvyiuvvPLKK6+88sor3yVg5Z0tRQCo/4owwggjjDDCCCOMMKIY4eAYF9GAHHnyZTfrJ0TkBClecT0ltHfUAAAAAElFTkSuQmCC';
        let arrowNextBtn = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAcklEQVR4Ae3PsRVAQBQFUTkdUKZAZjNtUskI/ViwvHNmKpg7mNn7gB1oqfMrTy12viLi5uMQwAhclBIRswgRIkSIECFChAgRInoDFuD8C8B55513vn/OO++88847P6XOV8SWOl8Re+p8RRyx8xXx7byZ3Z/JYly7B/D+AAAAAElFTkSuQmCC';

        let htmlViewer = '\
    <div style="width: 100vw; height: 100vh; position: fixed; background: black; opacity: 0.8; z-index: 99998; top: 0px; left: 0px;" id="imageReaderBGID"></div>\
    <div style="width: 100vw; height: 100vh; position: fixed; z-index: 99999; top: 0px; left: 0px; display: table;" id="imageReaderContainerID">\
        <div style="display: table-cell; vertical-align: middle; text-align: center;" id="imageReaderContainerCurrentImageContainer">\
            <img id="imageReaderContainerCurrentImage" />\
        </div>\
    </div> \
    ';

        // <i class="material-icons"> close </i>
        let htmlButtons = '\
        <div class="vz-button-container">\
            <span class="vz-button-separator"></span>\
            <button id="imageReaderContainerBtnCloseID" class="vz-button">\
                <img src="' + closeImageBtn + '" /> \
            </button> \
        </div> \
        <div class="vz-bottom-container"> \
            <span class="vz-loading-info vz-button-secundary" style="padding-right: 10px;"> <i class="material-icons vz-animate-loading"> refresh </i> </span> \
            <span class="vz-loading-info">Loading images</span> \
            <span id="imageReaderContainerCountID"> 1 / ' + document.__vz.imageReader.images.length + ' </span> \
            <span class="vz-button-separator"></span> \
            <button id="imageReaderContainerBtnPrevID" class="vz-button-secundary" style="margin-right: 0;">\
                <img src="' + arrowBackBtn + '" /> \
            </button> \
            <button id="imageReaderContainerBtnMoreID" class="vz-button-secundary">\
                <img src="' + appsImageBtn + '" /> \
            </button> \
            <button id="imageReaderContainerBtnNextID" class="vz-button-secundary" style="margin-right: 25px;">\
                <img src="' + arrowNextBtn + '" /> \
            </button> \
        </div>\
        <style type="text/css">\
            /* Top */ \
            div.vz-button-container { \
                margin: 0; \
                padding: 0; \
                background: none; \
                position: fixed; \
                z-index: 999999; \
                max-width: 100vw; \
                width: 100vw; \
                height: 50px; \
                top: 0px; \
                right: 18px; \
                text-align: center; \
                border-radius: 0 0 2px 2px; \
                background-color: transparent; \
                display: flex; \
            } \
            button.vz-button {\
                background: none; \
                background-color: black; \
                font-weight: normal; \
                border: 0; \
                cursor: pointer; \
                color: white; \
                margin: 0; \
                padding: 0; \
                line-height: 1; \
                display: inline-block; \
                width: 50px; \
                height: 50px; \
                font-family: Arial,Helvetica Neue,Helvetica,sans-serif; \
                font-size: 18px; \
                box-shadow: none; \
            } \
            button.vz-button .material-icons { font-size: 48px; } \
            /* Bottom */ \
            \
            div.vz-bottom-container { \
                padding-top: 10px; \
                padding-bottom: 5px; \
                color: white; \
                font-weight: bold; \
                position: fixed; \
                z-index: 9999999999999; \
                bottom: 0; \
                right: 0; \
                background-color: #000; \
                text-align: center; \
                margin-left: -250px; \
                font-family: Arial,Helvetica Neue,Helvetica,sans-serif; \
                font-size: 12px; \
                display: flex; \
                align-items: center; \
                padding-left: 5px; \
            } \
            button.vz-button-secundary {\
                background: none; \
                background-color: transparent; \
                font-weight: normal; \
                border: 0; \
                cursor: pointer; \
                color: white; \
                margin: 0; \
                padding: 0; \
                line-height: 1; \
                display: inline-block; \
                width: 38px; \
                height: 38px; \
                font-family: Arial,Helvetica Neue,Helvetica,sans-serif; \
                font-size: 10px; \
                border-radius: 50%; \
                margin-right: 10px; \
                box-shadow: none; \
            } \
            /* Separator */ \
            span.vz-button-separator { \
                flex: 1; \
            } \
            #imageReaderContainerCountID { padding: 0 15px 0 25px; } \
            #imageReaderContainerCurrentImage { max-width: 95vw; max-height: 95vh; } \
            .vz-animate-loading { -webkit-animation:spin 2s linear infinite; -moz-animation:spin 2s linear infinite; animation:spin 2s linear infinite; } \
            @-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } } \
            @-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } } \
            @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } } \
        </style>';

        let mainContainer = document.createElement("DIV");
        mainContainer.setAttribute("style", "");
        mainContainer.setAttribute("id", "imageReaderMainContainerID");
        mainContainer.innerHTML = htmlButtons + htmlViewer;
        document.body.appendChild(mainContainer);
        checkLoading();

        document.__vz.imageReader.currentImage = 0;
        document.getElementById('imageReaderContainerCurrentImage').src = document.__vz.imageReader.images[document.__vz.imageReader.currentImage].src;

        document.getElementById('imageReaderBGID').addEventListener('click', removeUI);
        document.getElementById('imageReaderContainerBtnPrevID').addEventListener('click', leftImage);
        document.getElementById('imageReaderContainerBtnNextID').addEventListener('click', rightImage);
        document.getElementById('imageReaderContainerBtnCloseID').addEventListener('click', removeUI);
        document.getElementById('imageReaderContainerBtnMoreID').addEventListener('click', moreImages);
    }

    //
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //  View Gallery
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    //

    function moreImages() {

        if (document.getElementById('imageReaderBrowserContainerID')) {
            return;
        }

        let image = '';
        for (let i = 0; i < document.__vz.imageReader.images.length; i++) {
            image += '\
            <div class="vz-main-browser-container" data-count="' + i + '"> \
                <img src="' + document.__vz.imageReader.images[i].src + '" class="vz-main-browser-container-image" id="vzMainBrowserContainerImage' + i + '" />\
            </div>';
        }

        let imageBrowser = ' \
        <div class="vz-main-browser"> \
             ' + image + ' \
        </div>\
        <style type="text/css">\
            div.vz-main-browser { \
                margin: 0; padding: 0; \
                top: 0; \
                position:fixed; \
                max-width: 100vw; \
                max-height: 100vh; \
                overflow-y: auto; \
                z-index: 99999; \
                width: 100vw; \
                height: 100vh; \
                background-color: #000D; \
                display: grid; \
                grid-template-columns: repeat(5, 1fr); \
                grid-gap: 10px; \
                grid-auto-rows: minmax(100px, 100px); \
                margin-left: 0; margin-top: 0; left: 0; \
            } \
            div.vz-main-browser-container { \
                text-align: center; /* max-width: 50px; max-height: 50px; float: left; */ \
            } \
            img.vz-main-browser-container-image { \
                max-width: 100%; max-height: 100%; cursor: pointer; \
            } \
            html, body { overflow: hidden; } \
            @media only screen and (max-width: 800px) { div.vz-main-browser { grid-template-columns: repeat(3, 1fr); } }\
            @media only screen and (max-width: 600px) { div.vz-main-browser { grid-template-columns: repeat(2, 1fr); } }\
            @media only screen and (max-width: 300px) { div.vz-main-browser { grid-template-columns: repeat(1, 1fr); } }\
        </style>';

        let browserContainer = document.createElement("DIV");
        browserContainer.setAttribute("style", "");
        browserContainer.setAttribute("id", "imageReaderBrowserContainerID");
        browserContainer.innerHTML = imageBrowser;
        document.body.appendChild(browserContainer);

        for (let i = 0; i < document.__vz.imageReader.images.length; i++) {
            let el = document.getElementById('vzMainBrowserContainerImage' + i);
            if (el) {
                el.addEventListener('click', function () {
                    goToImage(i);
                    removeBrowserUI();
                });
            }
        }

    }

    //
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //  Close views
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    //

    function removeUI() {
        if (!document.getElementById('imageReaderBGID')) {
            return;
        }

        if (document.getElementById('imageReaderContainerBtnCloseID')) {
            document.getElementById('imageReaderContainerBtnCloseID').remove();
        }

        if (document.getElementById('imageReaderContainerBtnMoreID')) {
            document.getElementById('imageReaderContainerBtnMoreID').remove();
        }

        document.getElementById('imageReaderBGID').remove();
        document.getElementById('imageReaderContainerBtnNextID').remove();
        document.getElementById('imageReaderContainerBtnPrevID').remove();
        document.getElementById('imageReaderContainerID').remove();
        document.getElementById('imageReaderMainContainerID').remove();

        removeBrowserUI();
    }

    function removeBrowserUI() {
        if (document.getElementById('imageReaderBrowserContainerID')) {
            document.getElementById('imageReaderBrowserContainerID').remove();
        }
    }

    //
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //  Background.js comunication
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    //

    function onMessageListener(request) {

        if (typeof request === typeof undefined) {
            request = {
                url: window.location.href,
                action: 'none'
            };
        }

        if (typeof request.url === typeof undefined) {
            request.url = window.location.href;
        }

        if (typeof request.options !== typeof undefined) {
            document.__vz.imageReader.setConfigImageReader(request.options);
            document.__vz.imageReader.configLoaded = true;
        }

        switch (request.action) {
            case "hide":
                document.__vz.imageReader.hideImageReaderViewer();
                break;

            case "show":
                document.__vz.imageReader.openImageReaderViewer();
                break;

            default:
                reloadImages();
                break;
        }

        return Promise.resolve({
            response: "Hi"
        });
    }

    //
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //  Keyboard events
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    //

    function keyupEvents(evt) {
        evt = evt || window.event;

        // ESC
        if (evt.keyCode === 27) {
            removeUI();
        }

        // left
        if (evt.keyCode === 37) {
            leftImage();
        }

        // left
        if (evt.keyCode === 39) {
            rightImage();
        }
    }

    //
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //  Auto actions
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    //

    function checkLoading() {
        if (document.readyState !== 'complete') {
            return;
        }

        let elements = document.getElementsByClassName('vz-loading-info');
        for (let i = elements.length - 1; i >= 0; i--) {
            elements[i].remove();
        }

        // check if need auto-open
        if (!document.__vz.imageReader.checkAutoOpen &&
            document.__vz.imageReader.configLoaded) {

            document.__vz.imageReader.checkAutoOpen = true;

            let autoUris = getConfig('openAuto');
            for (let i = 0; i < autoUris.length; i++) {
                if (typeof autoUris[i] === typeof 'string' && autoUris[i] !== '') {
                    let patt = new RegExp(autoUris[i]);
                    let res = patt.test(window.location.href);
                    if (res) {
                        prepareViewer();
                    }
                }
            }
        }
    }

    //
    //
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //  Config access functions
    // !!!!!!!!!!!!!!!!!!!!!!!!!!
    //
    //

    function setConfigImageReader(cnf) {
        document.__vz.imageReader.cnf = cnf;
    }

    function getConfig(key) {
        let lKeysAvailable = ["minWidthShow", "minHeightShow", "orderDefault", "orderDefaultDirection", "duplicates"];
        let bExistKey = typeof key === typeof "string" &&
            lKeysAvailable.indexOf(lKeysAvailable) >= 0 &&
            typeof document.__vz !== typeof undefined &&
            typeof document.__vz.imageReader !== typeof undefined &&
            typeof document.__vz.imageReader.cnf !== typeof undefined &&
            typeof document.__vz.imageReader.cnf[key] !== typeof undefined;

        switch (key) {
            case "minHeightShow":
            case "minWidthShow":
                if (!bExistKey) {
                    return 32;
                }

                return parseInt(document.__vz.imageReader.cnf[key], 10);

            case "orderDefault":
                return document.__vz.imageReader.cnf[key] === "A01" ? "A01" : "A02";

            case "orderDefaultDirection":
                return document.__vz.imageReader.cnf[key] === "ASC" ? "ASC" : "DESC";

            case "duplicates":
                return parseInt(document.__vz.imageReader.cnf[key], 10) === 1 ? true : false;

            case "openAuto":
                return typeof document.__vz.imageReader.cnf[key] === typeof "string" ? document.__vz.imageReader.cnf[key].split('\n') : [];

            default:
                onError("The key doesn't exist");
                console.error(key);
                return null;
        }

        return null;
    }

}());