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
// @require     https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js
// ==/UserScript==

(async function () {
    'use strict';

    let anchorInfoCache = {};

    async function getAnchorInfo(mid) {
        if (!anchorInfoCache[mid]) {
            const response = await fetch(`https://api.bilibili.com/x/web-interface/card?mid=${mid}`);
            const data = await response.json();
            anchorInfoCache[mid] = data.data.card;
        }
        return anchorInfoCache[mid];
    }

    while ($('#chat-items').children().length == 0) {
        console.warn(`找不到弹幕框元素，等待3秒。`)
        await new Promise((res,) => setTimeout(res, 3000)) // wait 3 seconds
    }

    $(document).on('mouseenter', '.fans-medal-item-ctnr', async function (e) {
        if ($(this).hasClass('isObserved')) {
            $(this).find('.medal-anchor-tooltip').show();
            return;
        }

        let roomId = $(this).attr('data-room-id');
        let mid = $(this).attr('data-anchor-id');
        let anchorInfo = await getAnchorInfo(mid);
        $(this).addClass('isObserved');

        let tooltip = $('<div>', {
            class: "medal-anchor-tooltip",
            style: "position: absolute; top: 0; left: 0; background-color: #fff; border: 1px solid #000; padding: 5px; z-index: 999; display: flex; align-items: center; text-decoration: none; color: black",
            html: `
                <a herf="https://live.bilibili.com/${roomId}" target="_blank">
                    <img src="${anchorInfo.face}" style="border-radius: 50%; width: 64px; height: 64px">
                    <div>${anchorInfo.name}</div>
                </a>
            `
        });

        $(this).append(tooltip);
    });

    $(document).on('mouseleave', '.fans-medal-item-ctnr.isObserved', function (e) {
        $(this).find('.medal-anchor-tooltip').hide();
    });

})().catch(console.warn);
