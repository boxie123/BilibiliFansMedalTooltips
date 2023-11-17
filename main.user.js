// ==UserScript==
// @name        Bilibili直播弹幕粉丝勋章弹窗鼠标悬浮显示主播信息
// @namespace   https://space.bilibili.com/35192025
// @version     0.01
// @supportURL  https://space.bilibili.com/35192025
// @grant       none
// @author      铂屑
// @license     MIT
// @include     /https?:\/\/live\.bilibili\.com\/(blanc\/)?\d+\??.*/
// @icon        https://www.google.com/s2/favicons?domain=bilibili.com
// @description 鼠标悬停在粉丝勋章上时提供主播信息
// ==/UserScript==

(async function () {
    'use strict';

    let targetNode = document.getElementById('chat-items');
    addMouseoverEventForNode(targetNode)

    let observerOptions = {
        childList: true,
        subtree: true
    };

    let observer = new MutationObserver(addMouseoverEvent);

    while (targetNode == null){
        console.warn(`找不到聊天区元素，等待3秒。`)
        await new Promise((res,) => setTimeout(res, 3000)) // wait 3 seconds
    }

    observer.observe(targetNode, observerOptions);
    let anchorInfoCache = {};

    async function getAnchorInfo(mid) {
        if (!anchorInfoCache[mid]) {
            const response = await fetch(`https://api.bilibili.com/x/web-interface/card?mid=${mid}`);
            const data = await response.json();
            anchorInfoCache[mid] = data.data.card;
        }
        return anchorInfoCache[mid];
    }

    function addMouseoverEvent(mutationList, observer) {
        for (let mutation of mutationList) {
            if (mutation.type === 'childList') {
                for (let node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;
                    addMouseoverEventForNode(node)
                }
            }
        }
    }

    async function addMouseoverEventForNode(node) {
        let medals = node.getElementsByClassName('fans-medal-item-ctnr');
        for (let i = 0; i < medals.length; i++) {
            if (medals[i].hasAttribute('isObserved')) continue;
            medals[i].setAttribute('isObserved', '');
            medals[i].addEventListener('mouseenter', async function (e) {
                let roomId = this.getAttribute('data-room-id');
                let mid = this.getAttribute('data-anchor-id');
                let anchorInfo = await getAnchorInfo(mid);

                let image = document.createElement('img');
                image.src = anchorInfo.face;
                image.style = "border-radius: 50%; width: 64px; height: 64px";

                let anchor = document.createElement("a");
                anchor.href = `https://live.bilibili.com/${roomId}`;
                anchor.target = "_blank";
                anchor.style = "position: absolute; top: 0; left: 0; background-color: #fff; border: 1px solid #000; padding: 5px; z-index: 999; display: flex; align-items: center; text-decoration: none; color: black";

                let text = document.createElement('span');
                text.innerText = anchorInfo.name;

                anchor.appendChild(image);
                anchor.appendChild(text);

                this.appendChild(anchor);
                this.lastChild.style.display = "block";
            });

            medals[i].addEventListener('mouseleave', function (e) {
                this.lastChild.style.display = "none";
            });
        }
    }

})().catch(console.warn);


