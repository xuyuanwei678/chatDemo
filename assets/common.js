/**
 * Created by happok on 2018/10/11.
 */

// 引入配置文件
import appConfig from '@/appConfig'
import http from '@/common/http/axios.js'
var $ = require('@/static/plugins/jquery-3.2.1.min.js')
var jquery = require('@/static/plugins/jquery-3.2.1.min.js')
!(function (doc, win) {
	
	console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++",doc)
	if(doc){
		var docEle = doc.documentElement,
		    evt = "onorientationchange" in window ? "orientationchange" : "resize",
		    fn = function () {
		        var width = docEle.clientWidth;
		        var fs = (width / 1920) * 100
		
		        width && (docEle.style.fontSize = fs + "px");
		        /* document.querySelector('meta[name="viewport"]').setAttribute('content','initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no');*/
		    };
		fn()
		win.addEventListener(evt, fn, false);
		doc.addEventListener("DOMContentLoaded", fn, false);
		
		
		document.addEventListener("error", function (e) {
		
		    var elem = e.target;
		    if (elem.tagName.toLowerCase() == 'img') {
		        elem.src = "static/images/imgLoadFail.jpg";
		    }
		}, true);
	}
   
}(document, window));

var common = {
    vueInit(Vue) {
        Vue.directive('clickoutside', { // 元素添加  v-clickoutside="function"  会让元素在点击除自己和自己子元素以外的其他元素的时候执行函数
            bind(el, binding, vnode) {
                function documentHandler(e) {
                    if (el.contains(e.target)) {
                        return false
                    }
                    if (binding.expression) {
                        binding.value(e)
                    }
                }

                el.__vueClickOutside__ = documentHandler
                document.addEventListener('click', documentHandler)
            },
            unbind(el, binding) {
                document.removeEventListener('click', el.__vueClickOutside__)
                delete el.__vueClickOutside__
            }
        })

        Vue.directive('title', {
            bind(el, binding, vnode) {
                //$(el).css('position', 'relative')
                if (!binding.value) {
                    return
                }
                var html = null
                if ($('.title-box').length === 0) {
                    html = $(`
                        <div class="title-box">
                            <i class="corner"></i>
                            <span>${binding.value}</span>
                        </div>
                    `)
                    $('body').append(html)
                } else {
                    html = $('.title-box')
                }

                $(el).hover(function (e) {
                    var _msg = ''
                    if (el._msg) {
                        _msg = el._msg
                    } else {
                        _msg = binding.value
                    }
                    html.children('span').html(_msg)
                    html.css({
                        left: $(e.target).offset().left,
                        top: $(e.target).offset().top - 40
                    }).show()

                }, function () {
                    html.hide()
                })
                el.titlleHtml = html

            },
            update(el, binding) {
                el._msg = binding.value
            },
            unbind(el, binding) {
                if (!binding.value) {
                    return
                }
                if (el.titlleHtml) {
                    el.titlleHtml.remove()
                }
            }
        })


        Vue.directive('numberonly', { // input 只能输入数字
            bind: function (el) {
                el.handler = function () {
                    // binding.value._this[binding.value.name] = el.value.replace(/\D+/g, '')
                    // vnode.context为绑定位置的vm 对象   binding.expression为指令后面传的值， 值为该input 绑定v-model
                    // 针对传入的参数 是xx.xx 就需要做特殊处理
                    var keys = binding.expression.split('.')
                    if (keys.length === 1) {
                        vnode.context[keys[0]] = el.value.replace(/\D+/g, '')
                    } else if (keys.length === 2) {
                        vnode.context[keys[0]][keys[1]] = el.value.replace(/\D+/g, '')

                    } else if (keys.length === 3) {
                        vnode.context[keys[0]][keys[1]][keys[2]] = el.value.replace(/\D+/g, '')

                    } else if (keys.length === 4) {
                        vnode.context[keys[0]][keys[1]][keys[2]][keys[3]] = el.value.replace(/\D+/g, '')

                    }


                    // v_model = el.value.replace(/\D+/g, '')
                    // el.value = el.value.replace(/\D+/, '')
                    // console.log(el.value)
                }
                el.addEventListener('input', el.handler)
            },
            unbind: function (el) {
                el.removeEventListener('input', el.handler)
            }
        })

        Vue.filter('formatTime', (value, type, isToString) => {  // 时间过滤器

            var addZero = (val) => {
                if (val < 10) {
                    return '0' + val
                } else {
                    return val
                }
            }

            var dataTime = ''
            var data = new Date()
            data.setTime(value)
            var year = data.getFullYear()
            var month = addZero(data.getMonth() + 1)
            var day = addZero(data.getDate())
            var hour = addZero(data.getHours())
            var minute = addZero(data.getMinutes())
            var second = addZero(data.getSeconds())
            if (type === 'YMD') {
                dataTime = year + '-' + month + '-' + day
            } else if (type === 'YMDHMS') {
                dataTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
            } else if (type === 'HMS') {
                dataTime = hour + ':' + minute + ':' + second
            } else if (type === 'YM') {
                dataTime = year + '年' + month + '月'
            }

            var getDateDiff = (dateTimeStamp) => {
                var minute = 1000 * 60;
                var hour = minute * 60;
                var day = hour * 24;
                var halfamonth = day * 15;
                var month = day * 30;
                var now = new Date().getTime();
                var diffValue = now - dateTimeStamp;
                if (diffValue < 0) {
                    //若当前时间 大于 发送时间
                    return '刚刚'
                }
                var monthC = diffValue / month;
                var weekC = diffValue / (7 * day);
                var dayC = diffValue / day;
                var hourC = diffValue / hour;
                var minC = diffValue / minute;
                var result = ''
                if (monthC >= 1) {
                    result = dataTime;
                } else if (weekC >= 1) {
                    result = parseInt(weekC) + "周前";
                } else if (dayC >= 1) {
                    result = parseInt(dayC) + "天前";
                } else if (hourC >= 1) {
                    result = parseInt(hourC) + "小时前";
                } else if (minC >= 1) {
                    result = parseInt(minC) + "分钟前";
                } else {
                    result = "刚刚";
                }
                return result;
            }
            if (isToString) {
                dataTime = getDateDiff(value)
            }
            return dataTime // 将格式化后的字符串输出到前端显示
        })

        Vue.prototype.post = function (url, data, succFun, errFun) {
            Vue.http.post(url, data, {
                //emulateJSON:true,
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                contentType: 'application/json'
            }).then(
                (res) => {
                    var data = res.data
                    if (typeof res.data === 'string') {
                        data = JSON.parse(res.data)
                    }
                    succFun(data)
                },
                (res) => {
                    if (errFun) {
                        var msg
                        try {
                            if (typeof res.data === 'string') {
                                msg = JSON.parse(res.data).message
                            } else {
                                msg = res.data.message
                            }
                        } catch (e) {
                        }
                        if (errFun) {
                            console.log(msg)
                            if (!msg) {
                                switch (res.status) {
                                    case 400 :
                                        msg = '参数错误！';
                                        break;
                                    case 420 :
                                        msg = '参数内容错误！';
                                        break;
                                    case 404 :
                                        msg = '访问失败！';
                                        break;
                                    case 409 :
                                        msg = '重复！';
                                        break;
                                    case 500 :
                                        msg = '服务器请求错误'
                                        break;
                                    default :
                                        msg = '不可识别错误，请联系管理员！'
                                }
                                errFun({
                                    code: res.status,
                                    msg
                                })
                            } else {
                                errFun({
                                    code: res.status,
                                    msg
                                })
                            }

                        }
                    }
                }
            )
        }
        Vue.prototype.get = function (url, succFun, errFun) {

           http.get(url, {
                //emulateJSON:true,
                "Cache-Control": 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0',
                contentType: 'application/json',
                // cache: true
            }).then(
                (res) => {
                    var data = res.data
                    if (typeof res.data === 'string') {
                        data = JSON.parse(res.data)
                    }
                    succFun(data)
                },
                (res) => {
                    if (errFun) {
                        var msg
                        try {
                            if (typeof res.data === 'string') {
                                msg = JSON.parse(res.data).message
                            } else {
                                msg = res.data.message
                            }
                        } catch (e) {
                        }
                        if (errFun) {
                            if (!msg) {
                                switch (res.status) {
                                    case 400 :
                                        msg = '参数错误！';
                                        break;
                                    case 420 :
                                        msg = '参数内容错误！';
                                        break;
                                    case 404 :
                                        msg = '访问失败！';
                                        break;
                                    case 409 :
                                        msg = '重复！';
                                        break;
                                    case 500 :
                                        msg = '服务器请求错误'
                                        break;
                                    default :
                                        msg = '不可识别错误，请联系管理员！'
                                }
                                errFun({
                                    code: res.status,
                                    msg
                                })
                            } else {
                                errFun({
                                    code: res.status,
                                    msg
                                })
                            }

                        }
                    }
                }
            )
        }
        Vue.prototype.put = function (url, data, succFun, errFun) {
            Vue.http.put(url, data, {
                //emulateJSON:true,
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                contentType: 'application/json'
            }).then(
                (res) => {
                    var data = res.data
                    if (typeof res.data === 'string') {
                        data = JSON.parse(res.data)
                    }
                    succFun(data)
                },
                (res) => {
                    var msg
                    try {
                        if (typeof res.data === 'string') {
                            msg = JSON.parse(res.data).message
                        } else {
                            msg = res.data.message
                        }
                    } catch (e) {
                    }
                    if (errFun) {
                        if (!msg) {
                            switch (res.status) {
                                case 400 :
                                    msg = '参数错误！';
                                    break;
                                case 420 :
                                    msg = '参数内容错误！';
                                    break;
                                case 404 :
                                    msg = '访问失败！';
                                    break;
                                case 409 :
                                    msg = '重复！';
                                    break;
                                case 500 :
                                    msg = '服务器请求错误'
                                    break;
                                default :
                                    msg = '不可识别错误，请联系管理员！'
                            }
                            errFun({
                                code: res.status,
                                msg
                            })
                        } else {
                            errFun({
                                code: res.status,
                                msg
                            })
                        }

                    }
                }
            )
        }
        Vue.prototype.delete = function (url, succFun, errFun) {
            http.del(url, {
                contentType: 'application/json'
            }).then(
                (res) => {
                    var data = res.data
                    if (typeof res.data === 'string') {
                        data = JSON.parse(res.data)
                    }
                    succFun(data)
                },
                (res) => {
                    if (errFun) {
                        var msg
                        try {
                            if (typeof res.data === 'string') {
                                msg = JSON.parse(res.data).message
                            } else {
                                msg = res.data.message
                            }
                        } catch (e) {
                        }
                        if (errFun) {
                            if (!msg) {
                                switch (res.status) {
                                    case 400 :
                                        msg = '参数错误！';
                                        break;
                                    case 420 :
                                        msg = '参数内容错误！';
                                        break;
                                    case 404 :
                                        msg = '访问失败！';
                                        break;
                                    case 409 :
                                        msg = '重复！';
                                        break;
                                    case 500 :
                                        msg = '服务器请求错误'
                                        break;
                                    default :
                                        msg = '不可识别错误，请联系管理员！'
                                }
                                errFun({
                                    code: res.status,
                                    msg
                                })
                            } else {
                                errFun({
                                    code: res.status,
                                    msg
                                })
                            }

                        }
                    }
                }
            )
        }
        // 文件上传
        Vue.prototype.fileUpload = function (url, formData, progress, succFun, errFun) {
            var requestObj
            Vue.http.post(url, formData, {
                progress,
                before(request) {
                    // 将req 对象返回回去 以便终止上传
                    requestObj = request
                }
            }).then((res) => {
                var data = res.data
                if (typeof res.data === 'string') {
                    var data = JSON.parse(res.data)
                }
                succFun(data)
            }, (res) => {
                if (errFun) {
                    var msg
                    try {
                        if (typeof res.data === 'string') {
                            msg = JSON.parse(res.data).message
                        } else {
                            msg = res.data.message
                        }
                    } catch (e) {
                    }
                    switch (res.status) {
                        case 400 :
                            msg = '参数错误！';
                            break;
                        case 420 :
                            msg = '参数内容错误！';
                            break;
                        case 404 :
                            msg = '访问失败！';
                            break;
                        case 409 :
                            msg = '重复！';
                            break;
                        case 500 :
                            msg = '服务器请求错误'
                            break;
                        default :
                            msg = '不可识别错误，请联系管理员！'
                    }
                    errFun({
                        code: res.status,
                        msg
                    })
                }
            })
            return requestObj
        }


        // 搜索结果高亮显示
        Vue.prototype.keywordLight = (val, keyword) => {
            if (!keyword) {
                return val
            }
            return val.replace(new RegExp(keyword, 'gi'), (s0, s1) => {
                return `<s class="red" style="text-decoration: none; font-weight: bold">${s0}</s>`
            })
        }

        // $alert 用于在common 中调用 延续element 中的功能
        // Vue.prototype.$alert = (msg, title, opt) => {
        //     opt = opt || {}
        //     title = title || '提示'
        //     var btnMsg = opt.confirmButtonText || '确定'
        //     var cab = opt.callback
        //     $('#alertMsgBox').remove()
        //     var html = `
        //     <div id="alertMsgBox" class="shade animated fadeIn">
        //
        //         <div class="alertMsg" >
        //             <div class="msgContent">
        //                 <div class="title">${title}</div>
        //                 <div class="msg">${msg}</div>
        //             </div>
        //             <p class="btnBlock" >${btnMsg}</p>
        //
        //         </div>
        //
        //     </div>`
        //     $('body').append($(html))
        //     $('#alertMsgBox .btnBlock').click(() => {
        //         $('#alertMsgBox').removeClass('fadeIn').addClass('fadeOut')
        //         setTimeout(() => {
        //             $('#alertMsgBox').remove()
        //         }, 500)
        //         cab()
        //     })
        //
        // }

        // 加载刷新页面进度
        Vue.prototype.loadPage = () => {
            var obj = {}
            var elem = `
            <div id="loadPageStyle" class="animated fadeIn">
                <div class="precon">
                    <img src="static/images/loading.gif" alt="">
                </div>
                <p>加载中...</p>

            </div>`
            $('body').append($(elem))

            obj.close = () => {
                $('#loadPageStyle').removeClass('fadeIn').addClass('fadeOut')
                setTimeout(() => {
                    $('#loadPageStyle').remove()
                }, 500)
            }
            return obj
        }

        // 参数序列化
        Vue.prototype.seParams = (obj) => {
            // 该方法会把值为0 的项过滤掉
            // 如果所有项都会空 则不会返回 ‘?’
            var str = ''
            for (var key in obj) {
                var item = obj[key]
                if (item !== null && item !== undefined && item !== '') {
                    str += `${key}=${item}&`
                }
            }
            if (str.length !== 0) {
                str = '?' + str.substr(0, str.length - 1)
            }
            return str
        }


        Vue.prototype.each = (arr, fun) => {
            var i, len, res
            if (typeof arr !== 'object') {
                for (i = 0, len = parseInt(arr); i < len; i++) {
                    res = fun(i)
                    if (res) {
                        break
                    }
                }
            } else {
                for (i = 0, len = arr.length; i < len; i++) {
                    res = fun(arr[i], i)
                    if (res) {
                        break
                    }
                }
            }
        }


        Vue.prototype.getItem = (list, key, value) => { // 根据对象数组中对象的一个属性 查找该对象在 数组中的位置
            var item, index
            for (var i = 0; i < list.length; i++) {
                if (list[i][key] === value) {
                    item = list[i]
                    index = i
                    break
                }
            }
            return {item, index}
        }
        Vue.prototype.removeByValue = (arr, val) => { // 删除数组中的 一个数值
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] === val) {
                    arr.splice(i, 1)
                    i--
                }
            }
        }

        Vue.prototype.pictureFn = (IsPip) => {
            try {
                if (!document.pictureInPictureElement) {
                    var video = document.getElementById('picture')
                    video.requestPictureInPicture()
                    video.addEventListener('enterpictureinpicture', function (ev) {
                        IsPip(true)
                    })
                    video.addEventListener('leavepictureinpicture', function () {
                        IsPip(false)
                    })
                    if (window.win) {
                        win.minimize();
                    }
                } else {
                    document.exitPictureInPicture();
                    if (window.win) {
                        win.maximize();
                    }
                }
            } catch (reason) {
                console.error(reason);
            }
        }

        Vue.prototype.closeApp = () => {

            if (window.win) {
                win.hide();
            }
        }

        Vue.prototype.miniApp = () => {
            if (window.win) {
                win.minimize();
            } else {
                window.minimize()
            }
        }

        Vue.prototype.quitApp = (vm) => {
            console.log(window.__wxjs_environment === 'miniprogram')
            // 先执行退出
            console.log(vm.$Ics)
            // 如果没有执行join就没有userInfo  用此判断 用户是否是直接打开 并没有传参
            try {
                vm.$Ics.conference.leave()
                if (vm.$Ics.publicationGlobal) {
                    vm.$Ics.publicationGlobal.stop()
                }

                // 安卓退出
                jsInterface.quite()


            } catch (err) {
                console.error("退出错误:" + err)
            }
            if (window.win) {
                win.close(true);
                gui.App.quit();
            } else {
                window.open("about:blank", "_self").close()
            }
            if (window.__wxjs_environment === 'miniprogram') {
                wx.miniProgram.postMessage({data:{msg:'wx-test'}})
                wx.miniProgram.navigateTo({url: '/pages/login/login'})
            }

        }


        Vue.prototype.api = (key) => {
            var apis = appConfig.apis
            return apis[key]
        }

        Vue.prototype.Base64 = function () {

            // private property
            var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

            // public method for encoding
            this.encode = function (input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;
                input = _utf8_encode(input);
                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output +
                        _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                        _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
                }
                return output;
            }

            // public method for decoding
            this.decode = function (input) {
                var output = "";
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;
                try {
                    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                } catch (e) {
                    console.log('传入参数不属于base64')
                    return ''
                }
                while (i < input.length) {
                    enc1 = _keyStr.indexOf(input.charAt(i++));
                    enc2 = _keyStr.indexOf(input.charAt(i++));
                    enc3 = _keyStr.indexOf(input.charAt(i++));
                    enc4 = _keyStr.indexOf(input.charAt(i++));
                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;
                    output = output + String.fromCharCode(chr1);
                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }
                }
                output = _utf8_decode(output);
                return output;
            }

            // private method for UTF-8 encoding
            var _utf8_encode = function (string) {
                string = string.replace(/\r\n/g, "\n");
                var utftext = "";
                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }

                }
                return utftext;
            }

            // private method for UTF-8 decoding
            var _utf8_decode = function (utftext) {
                var string = "";
                var i = 0, c1, c2;
                var c = c1 = c2 = 0;
                while (i < utftext.length) {
                    c = utftext.charCodeAt(i);

                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    } else if ((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i + 1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    } else {
                        c2 = utftext.charCodeAt(i + 1);
                        c3 = utftext.charCodeAt(i + 2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }
                }
                return string;
            }
        }

        // 添加token
        //console.log(Vue.prototype.beforeCreate )

        /* Vue.http.interceptors.push(function (request, next) {
            var me = Vue.prototype
            if ('-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style) {
                Vue.http.headers.common['Cache-Control'] = 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0'
                Vue.http.headers.common['Pragma'] = 'no-cache'
                Vue.http.headers.common['Expires'] = '-1'
            }

            function nextStep (response){
                // 由于使用记录时间 来判断是否过期， 所以这里就不用判断 是不是 499了
                // 如果token 30分钟失效， 则使用刷新 token 获取新的token
                if (response.status === 499) {
                    var userToken = sessionStorage.getItem('userToken')
                    if (!userToken) {
                        me.$alert('账号已过期，请重新登录！', '提示', {
                            confirmButtonText: '确定',
                            callback: action => {
                                location.href = '../#/home/login'
                            }
                        })

                    } else {

                    }
                } else if (response.status === 451) {
                    location.href = '../#/home/login'
                    me.$alert('登录token错误，请重新登录！', '提示', {
                        confirmButtonText: '确定',
                        callback: action => {
                            location.href = '../#/home/login'
                        }
                    })
                }
                return response
            }
            // 针对以下请求 直接过

            switch(request.url) {
                case '/api/personal/login/refresh' :
                case '/api/personal/login' :
                    next(nextStep)
                    return
            }


            //return
            // 获取token
            const token = JSON.parse(sessionStorage.getItem('userToken'))
            //判断有没有token
            if (token) {
                Vue.http.headers.common.Authorization = 'Bearer ' + token.access_token
                // Vue.http.headers.common.User = 'eyJpZCI6MSwicm9sZSI6MSwib3JnYW5pemF0aW9uX2lkIjoxLCJkYXRhX3Blcm1zIjpbMSwyNzMsMjc0LDI3NSwyNzgsMjgxLDI5NSwyOTYsMjk3LDI3OSw0NzEsNDcyLDQ3MywyODAsMjgzLDI4NCwyOTEsMjkyLDI5MywyOTQsMzY1LDM2MiwyODUsMjg2LDI4OCwyNzA2LDM2NiwzNjMsMzY0LDE0NTYsMTQ1N10sIm5hbWUiOiLnrqHnkIblkZgifQ==='
                var now = Date.now()
                // 游客和其他用户的token 时间不一样，所以这里需要做个判断
                if (token.isGuest) {
                    // 如果是游客登录
                    if (now - token.time < appConfig.guestTimeout) {
                        next(nextStep)
                    } else {
                        // 如果超过一个小时 重新使用游客登录后 在执行下一步
                        var params = {
                            account: 'guest',
                            password: ''
                        };
                        me.post(me.api('sys') + '/personal/login', params, function (data) {
                            var user = {
                                access_token: data.result.access_token,
                                refresh_token: data.result.refresh_token,
                                time: Date.now(),
                                isGuest: true
                            };
                            sessionStorage.setItem('userToken', JSON.stringify(user));
                            me.get(me.api('sys') + '/personal/me/permissions', function (data) {
                                var powerList = {};
                                for (var key in data.result) {
                                    var item = data.result[key];
                                    powerList[key] = true;
                                    me.each(item, function (item2) {
                                        powerList[key + ':' + item2] = true;
                                    });
                                }
                                sessionStorage.setItem('power', JSON.stringify(powerList));
                                next(nextStep)
                            }, function (data) {
                                console.log('获取游客权限失败')
                            });
                        }, function (data) {
                            console.log('游客登录失败')
                            // 登录失败之后 返回到登录页
                            location.href = '../#/home/login'
                        })
                    }
                } else {
                    // 当前时间和token 刷新时间进行对比，
                    // 如果小于 60分钟 则让请求通过
                    // 如果超过60 且小于120 分钟 则让请求通过 并重新刷新token
                    // 否则 说明等待时间已经大于120分钟
                    // 然后判断有没有记住我并且有没有过期 如过有记住我并且没有过期 则先刷新token 在执行下一步
                    // 否则让重新登录


                }
            } else {
                delete Vue.http.headers.common.Authorization
                next(nextStep)
            }
        }); */


        return Vue


    }


}

export default common




