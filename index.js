(function () {

    var DIRECTION_HEIGHT = "A01";
    var DIRECTION_WIDTH = "A02";

    // Init space form vars into webpage
    if (typeof document.__vz === typeof undefined) {
        document.__vz = {};
    }

    if (typeof document.__vz.imageReader === typeof undefined) {
        document.__vz.imageReader = {};
    }

    // Constants
    var imageReaderCurrentImage = 0;
    var images = new Array();

    // Functions
    document.__vz.imageReader.openImageReaderViewer = openImageReaderViewer;
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
        }

        document.addEventListener('keyup', keyupEvents, false);
    }

    function onMessageListener(request) {

        document.__vz.imageReader.setConfigImageReader(request.options);

        switch (request.action) {
            case "show":
                document.__vz.imageReader.openImageReaderViewer();
                break;

            case "hide":
                removeUI();
                break;
        }


        return Promise.resolve({
            response: "Hi from content script"
        });
    }

    function getAllImages() {
        let imgs = document.querySelectorAll('img');
        let src = new Array();
        for (let i = 0; i < imgs.length; i++) {
            if (imgs[i] && imgs[i].src) {

                let toPush = {
                    width: !imgs[i].naturalWidth ? 1 : imgs[i].naturalWidth,
                    height: !imgs[i].naturalHeight ? 1 : imgs[i].naturalHeight,
                    src: imgs[i].src
                };

                if (toPush.height >= document.__vz.imageReader.cnf.minHeightShow && toPush.width >= document.__vz.imageReader.cnf.minWidthShow) {
                    src.push(toPush);
                }

            }
        }

        return src;
    }

    function reloadImages() {
        images = getAllImages();
        images.sort(function (a, b) {
            return a.height < b.height;
        });
    }

    function prepareViewer() {
        reloadImages();
        if (images.length <= 0) {
            alert("No Images");
            return;
        }

        let styleBtns = 'background: white; border: none; cursor: pointer; color: black; font-size: 11px; margin: 0; padding: 0;';
        let shadow = '-webkit-box-shadow: 0px 10px 10px -11px rgba(0,0,0,0.75); -moz-box-shadow: 0px 10px 10px -11px rgba(0,0,0,0.75); box-shadow: 0px 10px 10px -11px rgba(0,0,0,0.75);';
        let htmlViewer = '\
    <div style="width: 100vw; height: 100vh; position: fixed; background: black; opacity: 0.8; z-index: 9000; top: 0px; left: 0px;" id="imageReaderBGID"></div>\
    <div style="width: 100vw; height: 100vh; position: fixed; z-index: 9001; top: 0px; left: 0px; display: table;" id="imageReaderContainerID">\
        <div style="display: table-cell; vertical-align: middle; text-align: center;">\
            <img id="currentImage" style="max-width: 95vw; max-height: 95vh;" />\
        </div>\
    </div>\
    ';

        let htmlButtons = '\
        <div style="padding-top: 5px; position: fixed; z-index: 9002; width: 250px; height: 32px; top: 0; left: 50%; background-color: white; text-align: center; margin-left: -125px; border-radius: 0 0 2px 2px;' + shadow + '">\
            <button style="' + styleBtns + '" id="imageReaderContainerBtnPrevID">\
                Back\
            </button>\
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
            <button style="' + styleBtns + '" id="imageReaderContainerBtnCloseID">\
                Close\
            </button>\
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\
            <button style="' + styleBtns + '" id="imageReaderContainerBtnNextID">\
                Next\
            </button>\
        </div>';

        let mainContainer = document.createElement("DIV");
        mainContainer.setAttribute("style", "");
        mainContainer.setAttribute("id", "imageReaderMainContainerID");
        mainContainer.innerHTML = htmlButtons + htmlViewer;
        document.body.appendChild(mainContainer);

        imageReaderCurrentImage = 0;
        document.getElementById('currentImage').src = images[imageReaderCurrentImage].src;

        document.getElementById('imageReaderBGID').addEventListener('click', removeUI);
        document.getElementById('imageReaderContainerBtnPrevID').addEventListener('click', leftImage);
        document.getElementById('imageReaderContainerBtnNextID').addEventListener('click', rightImage);
        document.getElementById('imageReaderContainerBtnCloseID').addEventListener('click', removeUI);
    }

    function removeUI() {
        if (!document.getElementById('imageReaderBGID')) {
            return;
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

        imageReaderCurrentImage++;
        if (imageReaderCurrentImage >= images.length) {
            imageReaderCurrentImage = 0;
        }

        document.getElementById('currentImage').src = images[imageReaderCurrentImage].src;
    };

    function leftImage() {
        if (!document.getElementById('imageReaderBGID')) {
            return;
        }

        imageReaderCurrentImage--;
        if (imageReaderCurrentImage < 0) {
            imageReaderCurrentImage = images.length - 1;
        }

        document.getElementById('currentImage').src = images[imageReaderCurrentImage].src;
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
        console.log(document.__vz.imageReader.cnf);
    }

}());