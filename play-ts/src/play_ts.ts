import { ResponseMessage } from "../../server/ws_api";
import { BMLBrowser, BMLBrowserFontFace, EPG } from "../../client/bml_browser";
import { RemoteControl } from "../../client/remote_controller_client";
import { decodeTS } from "../../server/decode_ts";

// 動画が入っている要素
const videoContainer = document.querySelector(".arib-video-container") as HTMLElement;
// BMLが非表示になっているときに動画を前面に表示するための要素
const invisibleVideoContainer = document.querySelector(".arib-video-invisible-container") as HTMLElement;
// BML文書が入る要素
const contentElement = document.querySelector(".data-broadcasting-browser-content") as HTMLElement;
// BML用フォント
const roundGothic: BMLBrowserFontFace = { source: "url('KosugiMaru-Regular.ttf'), url('/rounded-mplus-1m-arib.ttf'), local('MS Gothic')" };
const boldRoundGothic: BMLBrowserFontFace = { source: "url('KosugiMaru-Regular.ttf'), url('/rounded-mplus-1m-arib.ttf'), local('MS Gothic')" };
const squareGothic: BMLBrowserFontFace = { source: "url('Kosugi-Regular.ttf'), url('/rounded-mplus-1m-arib.ttf'), local('MS Gothic')" };

// リモコン
const remoteControl = new RemoteControl(document.querySelector(".remote-control")!, document.querySelector(".remote-control-receiving-status")!);

const epg: EPG = {
    tune(originalNetworkId, transportStreamId, serviceId) {
        console.error("tune", originalNetworkId, transportStreamId, serviceId);
        return false;
    }
};

const bmlBrowser = new BMLBrowser({
    containerElement: contentElement,
    mediaElement: videoContainer,
    indicator: remoteControl,
    fonts: {
        roundGothic,
        boldRoundGothic,
        squareGothic
    },
    epg,
});

let invisibleState = true;
let forceInvisible = false;
let browserInvisible = false;
let windowWidth = 0;
let windowHeight = 0;
let contentWidth = 0;
let contentHeight = 0;

function onVisibleSizeChanged() {
    if (!invisibleState && contentWidth > 0 && contentHeight > 0) {
        contentElement.style.width = windowWidth + "px";
        contentElement.style.height = windowHeight + "px";
        const scaleX = windowWidth / contentWidth;
        const scaleY = windowHeight / contentHeight;
        const s = Math.min(scaleX, scaleY);
        contentElement.style.transform = `translate(${(contentWidth * s + windowWidth) / 2 - contentWidth * s}px, ${(contentHeight * s + windowHeight) / 2 - contentHeight * s}px) scale(${s})`;
        contentElement.style.transformOrigin = `0px 0px`;
    }
}

function onInvisibleChanged() {
    if (invisibleState && !forceInvisible && !browserInvisible) {
        invisibleState = false;
        invisibleVideoContainer.style.display = "none";
        contentElement.style.display = "block";
        onVisibleSizeChanged();
        videoContainer.style.width = "100%";
        videoContainer.style.height = "100%";
        const video = videoContainer.querySelector("video");
        if (video != null) {
            video.style.display = "block";
            video.style.width = "100%";
            video.style.height = "100%";
        }
        const obj = bmlBrowser.getVideoElement();
        if (obj != null) {
            obj.appendChild(videoContainer);
        }
    } else if (!invisibleState && (forceInvisible || browserInvisible)) {
        invisibleState = true;
        invisibleVideoContainer.style.display = "";
        contentElement.style.display = "";
        contentElement.style.transform = "";
        videoContainer.style.width = "";
        videoContainer.style.height = "";
        const video = videoContainer.querySelector("video");
        if (video != null) {
            video.style.display = "";
            video.style.width = "";
            video.style.height = "";
        }
        invisibleVideoContainer.appendChild(videoContainer);
    }
}

remoteControl.content = bmlBrowser.content;
// trueであればデータ放送の上に動画を表示させる非表示状態
bmlBrowser.addEventListener("invisible", (evt) => {
    console.log("invisible", evt.detail);
    browserInvisible = evt.detail;
    onInvisibleChanged();
});

bmlBrowser.addEventListener("load", (evt) => {
    console.log("load", evt.detail);
    contentWidth = evt.detail.resolution.width;
    contentHeight = evt.detail.resolution.height;
    onVisibleSizeChanged();
});

let lastPcr = -1;

function onMessage(msg: ResponseMessage) {
    bmlBrowser.emitMessage(msg);
}

// PES(字幕)には対応しない
const tsStream = decodeTS({ sendCallback: onMessage });

// TSパケットを追加する
(window as any).bmlBrowserPlayTS = (data: Uint8Array, pcr?: number) => {
    // TSパケットにPCRを含まず引数で直接指定する場合
    if ((pcr ?? -1) >= 0 && lastPcr !== pcr!) {
        onMessage({
            type: "pcr",
            pcrBase: pcr!,
            pcrExtension: 0,
        });
        lastPcr = pcr!;
    }
    tsStream.parse(Buffer.from(data.buffer, data.byteOffset, data.byteLength));
};

// BML画面を非表示にする。動画コンテナは非表示用の要素の下に戻る
(window as any).bmlBrowserSetInvisible = (invisible: boolean) => {
    forceInvisible = invisible;
    onInvisibleChanged();
};

// BML画面のサイズを指定する
(window as any).bmlBrowserSetVisibleSize = (width: number, height: number) => {
    windowWidth = width;
    windowHeight = height;
    onVisibleSizeChanged();
};
