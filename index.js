/**
 * @file index.js ~ 2016-10-19 19:34:15
 * @author DestinyXie (xber1986@gmail.com)
 * @description
 * 社交化日志工具
 */

var socialLog;
(function () {
    // 默认设置
    var defaultConfig = {
        logApi: 'http://139.224.2.8:8999/api/sharelog', // 统计日志接口
        debug: false
    };

    /**
     * 加载图片
     * @param {string} src 图片地址
     * @param {Function} callback 图片加载结束回调
     */
    function loadImage(src, callback) {
        var image = new Image();
        image.onload = callback;
        image.onerror = callback;
        image.src = src;
    }

    /**
     * @type {Object}
     * 判断浏览器
     */
    var browser = {
        versions: function() {
            var u = navigator.userAgent
              , app = navigator.appVersion;
            return {
                trident: u.indexOf('Trident') > -1,
                //IE内核
                presto: u.indexOf('Presto') > -1,
                //opera内核
                webKit: u.indexOf('AppleWebKit') > -1,
                //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1,
                //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/),
                //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
                //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
                //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1,
                //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1,
                //是否iPad
                webApp: u.indexOf('Safari') > -1,
                //是否web应该程序，没有头部与底部
                weixin: u.indexOf('MicroMessenger') > -1,
                //是否微信 （2015-01-22新增）
                weibo: u.indexOf('weibo') > -1,
                //是否微博
                qq: u.indexOf('QQ') > -1,
                //是否QQ,
                uc: u.indexOf('UCBrowser') > -1,
                //是否UC,
                P8: u.indexOf('P8') > -1,
                //是否P8,
                wechatdevtools: u.indexOf('wechatdevtools') > -1//是否微信调试工具,
            };
        }(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase()
    }

    // 粗略判断手机型号
    var getDeviceName = function () {
        var deviceName = 'unknow';

        if (browser.versions.android) {
            deviceName = 'android';
        }

        if (browser.versions.iPad) {
            deviceName = 'ipad';
        }

        if (browser.versions.iPhone) {
            deviceName = 'iphone';
            var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            if (width > 400) {
                deviceName = "iPhone6 plus";
            }
            else if (width > 370) {
                deviceName = "iphone6";
            }
            else if (width > 315) {
                if (height > 500) {
                    deviceName = "iphone5 or iphone5s";
                }
                else {
                    deviceName = "iphone4 or iphone4s";
                }
            }
            else {
                    deviceName = "iphone";
            }
        }

        return deviceName;
    };

    var _toString = Object.prototype.toString;

    /**
     * @type {Function}
     * @param {*} object 需要判断的对象
     * @return {boolean}
     * 判断输入对象是否是字符串
     */
    var isString = function (object) {
        return ('[object String]' === _toString.call(object));
    };

    /**
     * 生成随机字符串，字符范围：0-9a-zA-Z
     * @param {string=} opt_length 生成的字符串长度，默认16位
     * @return {string} 生成的字符串
     */
    function genNonceStr(opt_length) {
        var str = "";
        var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        var pos;

        for(var i = 0; i < (opt_length || 16); i++) {
            pos = Math.round(Math.random() * (arr.length - 1));
            str += arr[pos];
        }
        return str;
    };

    /**
     * 设置cookie
     * @param {string} name cookie名
     * @param {string} value cookie值
     */
    function setCookie(name, value) {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
    }

    /**
     * 读取cookie
     * @param {string} name cookie名
     * @return {string} cookie值
     */
    function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if(arr = document.cookie.match(reg)) {
            return unescape(arr[2]);
        }
        else {
            return null;
        }
    }

    /**
     * 清空cookie
     * @param {string=} name cookie名，没有则清空所有cookie
     */
    function clearCookie(name) {
        if (name) {
            document.cookie=name+'=0;expires=' + new Date(0).toUTCString();
        }
        else {
            //删除所有cookies
            var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
            if (keys) {
                for (var i = keys.length; i--;) {
                    document.cookie=keys[i]+'=0;expires=' + new Date(0).toUTCString();
                }
            }
        }
    }

    /**
     * 读取url上带的参数
     * @param {string=} opt_url url地址
     * @return {string} cookie值
     */
    function getUrlQuery(opt_url) {
        var url = opt_url || location.href;
        var queryObj = {};

        if (url.lastIndexOf('?') < 0) {
            return queryObj;
        }
        var queryStr = url.substring(url.lastIndexOf('?') + 1);
        var queryArr = queryStr.split('&');

        var queryKV;
        for (var i = queryArr.length - 1; i >= 0; i--) {
            queryKV = queryArr[i].split('=');
            try {
                queryObj[queryKV[0]] = decodeURIComponent(queryKV[1]);
            }
            catch (e) {
                queryObj[queryKV[0]] = '';
            }
        }

        return queryObj;
    }

    /**
     * 拼接url参数
     * @param {Object} paramObj 参数对象
     * @return {string} url参数字符串
     */
    function buildUrlQuery(paramObj) {
        if (isString(paramObj)) {
            return paramObj;
        }

        if (!paramObj) {
            return '';
        }

        var queryArr = [];
        for (var key in paramObj) {
            queryArr.push(key + '=' + encodeURIComponent(paramObj[key]));
        }

        return queryArr.join('&');
    }

    /**
     * 发送统计及修改分享相关链接
     * @param {string=} opt_appid 项目id
     * @param {string=} opt_openid 用户唯一id，如果没有则生成唯一id并存入
     * @param {string=} opt_shareLink 传入原始分享链接，用户客户端可以通过微信js sdk修改分享链接
     * @return {string} 修改fromid之后的分享链接
     */
    socialLog = function (opt_appid, opt_openid, opt_shareLink) {
        var appName = (opt_appid || location.pathname.replace('/', '_'));
        var saveOpenid = opt_openid || getCookie(appName + '_social_log_openid');
        var deviceType = getDeviceName();

        if (!saveOpenid) {
            saveOpenid = appName + '_' + new Date().getTime() + '_' + genNonceStr(9); // 随机id
            setCookie(appName + '_social_log_openid', saveOpenid);
        }
        var queryParams = getUrlQuery();

        if (!queryParams.fromid) {
            queryParams = getUrlQuery(location.hash.replace('#', ''));
        }
        var logConfig = {
            app_name: appName,
            nickname: '',// 用户名
            headimgurl: '',// 头像
            sex: '',// 性别
            country: '',// 国家
            city: '',// 城市
            province: '',// 区
            openid: saveOpenid,// 当前用户openid
            unioinid: ''// 开放平台统一id，平台接入的公众号公用
        }
        logConfig.fromid = queryParams.fromid || 'root';
        logConfig.device = deviceType; // 设备
        logConfig.de_width = document.body.offsetWidth; // 屏幕宽度
        logConfig.de_height = document.body.offsetHeight; // 屏幕高度
        logConfig.spreadtype = queryParams.spreadtype || 'other'; // 传播来源
        logConfig.refer = location.href; // 页面链接

        shareLink = opt_shareLink || location.href;

        if (shareLink.indexOf('?') < 0) {
            shareLink = shareLink + '?fromid=' + saveOpenid;
        }
        else {
            if (shareLink.indexOf('fromid=') < 0) {
                shareLink = shareLink + '&fromid=' + saveOpenid;
            }
            else {
                shareLink = shareLink.replace(/fromid=[^&]*/, 'fromid=' + saveOpenid);
            }
        }

        logConfig.nettype = 'unknow';

        // 发送日志
        loadImage(defaultConfig.logApi + '?' + buildUrlQuery(logConfig));

        if ('unknow' == deviceType) {// pc的情况不让看到url变化
            return;
        }

        // 修改url链接，有隐患，知道这个特性的才可以用
        if ('replaceState' in history && !opt_shareLink) {
            history.replaceState( '分享', '分享', shareLink);
        }

        return shareLink;
    }

})(socialLog);

module.exports = socialLog;
