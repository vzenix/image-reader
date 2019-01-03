(function () {

    // let DIRECTION_HEIGHT = "A01";
    // let DIRECTION_WIDTH = "A02";

    // Init space form vars into webpage
    if (typeof document.__vz === typeof undefined) {
        document.__vz = {};
    }

    if (typeof document.__vz.imageReader === typeof undefined) {
        document.__vz.imageReader = {};
    }

    // Constants
    document.__vz.imageReader.currentImage = 0;
    document.__vz.imageReader.images = new Array();

    // Functions
    document.__vz.imageReader.openImageReaderViewer = openImageReaderViewer;
    document.__vz.imageReader.hideImageReaderViewer = removeUI;
    document.__vz.imageReader.setConfigImageReader = setConfigImageReader;

    // Script
    document.__vz.imageReader.setConfigImageReader({
        minWidthShow: 32,
        minHeightShow: 32,
        orderDefault: "DESC",
        orderDefaultDirection: "A01"
    });
    prepare();

    // Methods
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
    }

    function onMessageListener(request) {

        document.__vz.imageReader.setConfigImageReader(request.options);

        switch (request.action) {
            case "hide":
                document.__vz.imageReader.hideImageReaderViewer();
                break;

            default:
            case "show":
                document.__vz.imageReader.openImageReaderViewer();
                break;
        }

        return Promise.resolve({
            response: "Hi"
        });
    }

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

        return src;
    }

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

    function prepareViewer() {
        reloadImages();

        if (document.__vz.imageReader.images.length <= 0) {
            console.warn("ImageReader: can't read the images");
            alert("No images");
            return;
        }

        console.log("Images: ", document.__vz.imageReader.images);

        let htmlViewer = '\
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" /> \
    <div style="width: 100vw; height: 100vh; position: fixed; background: black; opacity: 0.8; z-index: 9000; top: 0px; left: 0px;" id="imageReaderBGID"></div>\
    <div style="width: 100vw; height: 100vh; position: fixed; z-index: 9001; top: 0px; left: 0px; display: table;" id="imageReaderContainerID">\
        <div style="display: table-cell; vertical-align: middle; text-align: center;" id="imageReaderContainerCurrentImageContainer">\
            <img id="imageReaderContainerCurrentImage" />\
        </div>\
    </div> \
    ';

        let htmlButtons = '\
        <div class="vz-button-container">\
            <button id="imageReaderContainerBtnPrevID" class="vz-button">\
            <i class="material-icons"> arrow_back_ios </i> \
            </button>\
            <span class="vz-button-separator"></span>\
            <button id="imageReaderContainerBtnNextID" class="vz-button">\
                <i class="material-icons"> arrow_forward_ios </i>\
            </button>\
        </div>\
        <div class="vz-bottom-container"> \
            <span id="imageReaderContainerCountID"> 1 / ' + document.__vz.imageReader.images.length + ' </span> \
            <span class="vz-button-separator"></span> \
            <button id="imageReaderContainerBtnMoreID" class="vz-button-secundary">\
                <i class="material-icons"> apps </i> \
            </button> \
            <button id="imageReaderContainerBtnCloseID" class="vz-button-secundary">\
                <i class="material-icons"> close </i> \
            </button> \
        </div>\
        <style type="text/css">\
            /* Top */ \
            div.vz-button-container { \
                background: none; \
                position: fixed; \
                z-index: 9003; \
                max-width: 90vw; \
                width: 100vw; \
                margin-left: 5vw; \
                height: 50px; \
                top: 15px; \
                left: 0; \
                text-align: center; \
                border-radius: 0 0 2px 2px; \
                background-color: transparent; \
                display: flex; \
            } \
            button.vz-button {\
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
                width: 50px; \
                height: 50px; \
                font-family: Arial,Helvetica Neue,Helvetica,sans-serif; \
                font-size: 12px; \
                border-radius: 50%; \
            } \
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
            } \
            /* Separator */ \
            span.vz-button-separator { \
                flex: 1; \
            } \
            #imageReaderContainerCountID { padding: 0 15px 0 25px; } \
            #imageReaderContainerCurrentImage { max-width: 95vw; max-height: 95vh; } \
        </style>';

        let mainContainer = document.createElement("DIV");
        mainContainer.setAttribute("style", "");
        mainContainer.setAttribute("id", "imageReaderMainContainerID");
        mainContainer.innerHTML = htmlButtons + htmlViewer;
        document.body.appendChild(mainContainer);

        document.__vz.imageReader.currentImage = 0;
        document.getElementById('imageReaderContainerCurrentImage').src = document.__vz.imageReader.images[document.__vz.imageReader.currentImage].src;

        document.getElementById('imageReaderBGID').addEventListener('click', removeUI);
        document.getElementById('imageReaderContainerBtnPrevID').addEventListener('click', leftImage);
        document.getElementById('imageReaderContainerBtnNextID').addEventListener('click', rightImage);
        document.getElementById('imageReaderContainerBtnCloseID').addEventListener('click', removeUI);
        document.getElementById('imageReaderContainerBtnMoreID').addEventListener('click', moreImages);
    }

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
    }

    function rightImage() {
        if (!document.getElementById('imageReaderBGID')) {
            return;
        }

        document.__vz.imageReader.currentImage++;
        if (document.__vz.imageReader.currentImage >= document.__vz.imageReader.images.length) {
            document.__vz.imageReader.currentImage = 0;
        }

        document.getElementById('imageReaderContainerCurrentImage').remove();
        document.getElementById('imageReaderContainerCurrentImageContainer').innerHTML = '<img id="imageReaderContainerCurrentImage" />';
        document.getElementById('imageReaderContainerCurrentImage').src = document.__vz.imageReader.images[document.__vz.imageReader.currentImage].src;

        if (document.getElementById('imageReaderContainerCountID')) {
            document.getElementById('imageReaderContainerCountID').innerHTML = (document.__vz.imageReader.currentImage + 1) + ' / ' + document.__vz.imageReader.images.length;
        }
    };

    function leftImage() {
        if (!document.getElementById('imageReaderBGID')) {
            return;
        }

        document.__vz.imageReader.currentImage--;
        if (document.__vz.imageReader.currentImage < 0) {
            document.__vz.imageReader.currentImage = document.__vz.imageReader.images.length - 1;
        }

        document.getElementById('imageReaderContainerCurrentImage').remove();
        document.getElementById('imageReaderContainerCurrentImageContainer').innerHTML = '<img id="imageReaderContainerCurrentImage" />';
        document.getElementById('imageReaderContainerCurrentImage').src = document.__vz.imageReader.images[document.__vz.imageReader.currentImage].src;
        // document.getElementById('imageReaderContainerCurrentImage').src = document.__vz.imageReader.images[document.__vz.imageReader.currentImage].src;

        if (document.getElementById('imageReaderContainerCountID')) {
            document.getElementById('imageReaderContainerCountID').innerHTML = (document.__vz.imageReader.currentImage + 1) + ' / ' + document.__vz.imageReader.images.length;
        }
    };

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

    function openImageReaderViewer() {
        if (document.getElementById('imageReaderBGID')) {
            removeUI();
            return;
        }

        prepareViewer();
    };

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

            default:
                onError("The key doesn't exist");
                console.error(key);
                return null;
        }

        return null;
    }


    function moreImages() {
        alert("Dev. in progess");
    }

}());