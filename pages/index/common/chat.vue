<template>
    <div id="chat">
        <div class="chatContent">
            <ul class="list clearfix">
                <li class="clearfix" :class="item.type" v-for="(item, index) in msgList">
                    <div class="head" v-if="item.type !== 'alert'">
                        <img :src="item.head_image || require('@/assets/images/userDef.png')" alt="">
                        <!--<span class="z-center">打防守的</span>-->
                    </div>

                    <div class="msg" v-if="item.type !== 'alert'">
                        <p class="info clearfix">
                            <span class="name">{{item.sender_name}}</span>
                            <span class="time">{{item.create_time | formatTime('YMD', true, now)}}</span>
                        </p>

                        <div class="content" @mouseup="openBigImg($event,item)" v-html="item.content" ></div>
                    </div>

                    <!--提示-->
                    <div class="alert" v-if="item.type === 'alert'">
                        {{item.content}}
                    </div>
                </li>

            </ul>


        </div>

        <div class="tools">
            <div class="btn iconfont iconbiaoqing-copy" onmousedown="return false;" v-clickoutside="closeFaceBox"
                 @click="openFaceBox()">
                <i class="u-icon" v-show="faceShow"></i>
                <ul onmousedown="return false;" v-show="faceShow" class="clearfix">
                    <li class="u-icon"></li>
                    <li onmousedown="return false;" @click="appendFace(item)" v-for="item in 16"><img
                        :src="'static/images/face/' + item  + '.gif'"/></li>
                </ul>

            </div>
            <div class="btn float_r" >
                <el-tooltip :content="liveMsg?'打开直播消息':'关闭直播消息'" placement="top" effect="light">
                    <el-switch
                        v-model="liveMsg"
                        active-color="#13ce66"
                        @change="changeLiveMsg"
                        inactive-color="#ff4949">
                    </el-switch>
                </el-tooltip>

            </div>

        </div>

        <div class="edit">
            <div placeholder="说点啥呢..." @paste="pasteFilter" @focus="addEven" @blur="removeEven"
                 contenteditable="plaintext-only" @input="testAt()" class="u-textarea"></div>
            <button @click="sendChate()">发送</button>

        </div>

        <!--查看 大图-->
        <div v-show="bigImg.show" class="g-shade">
            <i class="close iconfont icon-guanbi" @click="closeBigImg"></i>
            <div @click="closeBigImg" class="u-viewBigImgBox" @mousewheel="bigImg.scrollEvent($event)">

                <img @click.stop="" :width="bigImg.imgWidth + 'px'" @mousedown="bigImg.dragEvent($event)" class="sm"
                     :src="bigImg.src"/>

            </div>
        </div>
        <!--@人私聊的时候  显示的人员列表-->
        <div class="memberList" v-clickoutside="closeMemberList" v-show="member.show">
            <ul>
                <li class="empty" v-if=" member.list.length === 0">暂无成员</li>
                <li v-for="(item, index) in member.list" @click="member.affirm(item)">
                    <div class="head">
                        <img :src="item.head_image || require('@/assets/images/userDef.png')" alt="">
                    </div>
                    <p>{{item.user_name}}</p>
                </li>
            </ul>

        </div>

    </div>
</template>

<script type="text/ecmascript-6">
	var $ = require('@/static/plugins/jquery-3.2.1.min.js')
	var jquery = require('@/static/plugins/jquery-3.2.1.min.js')
    export default {
        data() {
            return {
                faceShow: false,
                userInfo: null,
                msgList: [],
                // 是否自动滚动
                autoScroll: true,
                bigImg: {
                    isDragging: false, // 是否正在拖动
                    show: false,
                    src: null,
                    scrollEvent: null,
                    dragEvent: null,
                    imgWidth: null
                },
                fmtimer: null,
                now: Date.now(), // 该属性是为了定时刷新的时候 更新过滤器的状态
                member: {
                    show: false,
                    list: [],
                    affirm: null
                },
                websocket:null,
                liveMsg:true
            }
        },
        props: {
            userinfo: Object,
            userList:Array
        },
        watch: {
            userinfo() {
                console.info(this.userinfo)
                this.userInfo = this.userinfo
            },
            userList(){
                this.userList = this.userList
            }
        },
        mounted() {

        },
        methods: {
            getTime() {
                const nowDate = new Date();
                const date = {
                    hours: nowDate.getHours(),
                    minutes: nowDate.getMinutes(),
                    seconds: nowDate.getSeconds(),
                }

                const hours = date.hours > 9 ? date.hours : '0' + date.hours
                const minutes = date.minutes > 9 ? date.minutes : '0' + date.minutes
                const seconds = date.seconds > 9 ? date.seconds : '0' + date.seconds

                return hours + ":" + minutes + ":" + seconds
            },
            init(basePath, roomId) {
                // 添加时间定时器 每10秒更新一次列表时间状态
                if (this.fmtimer) {
                    clearInterval(this.fmtimer)
                }
                this.basePath = basePath
                this.roomId = roomId
                this.fmtimer = setInterval(() => {
                    // 定时修改now 会使视图中的事件过滤器 刷新 从而适应 页面上显示的时间状态
                    this.now = Date.now()
                }, 10000)

                this.$Ics.conference.addEventListener('messagereceived', this.messagereceivedHander)
                this.getMsg(roomId)
                this.initWebSocket(basePath,roomId)
            },
            changeLiveMsg(data){
                console.log(data);
                if (data) {
                    this.initWebSocket(this.basePath,this.roomId)
                }else{
                    this.closeWebSocket();
                }
            },

            initWebSocket(basePath,roomId) {
                // WebSocket与普通的请求所用协议有所不同，ws等同于http，wss等同于https
                var url = window.location.origin.replace("https://","wss://").replace("http://","ws://")+"/meeting-ws/chatmsg/"+roomId;
                // let url='ws://192.168.1.132/meeting-ws/chatmsg/'+roomId
                this.websocket = new WebSocket(url);
                this.websocket.onopen = this.websocketOnopen;
                this.websocket.onerror = this.websocketOnerror;
                this.websocket.onmessage = this.websocketOnmessage;
                this.websocket.onclose = this.websocketOnclose;
            },
            // 连接发生错误的回调方法
            websocketOnerror() {
                console.log('连接发生错误的回调方法');
            },
            // 连接成功建立的回调方法
            websocketOnopen() {
                console.log('连接成功建立的回调方法');
            },
            // 接收到消息的回调方法
            websocketOnmessage(event) {
                let data = JSON.parse(event.data);
                console.log(data);
                this.live_chat(data,'live')
            },
            live_chat(data, origin) {
                let user=this.userList.filter((ele)=>{
                    return Number(ele.user)==data.sender_id
                })

                var msg = {
                    type:'other',
                    chat_type: 'group',
                    content: data.content.content ? data.content.content : data.content,
                    sender_name: data.sender,
                    head_image: user[0]?user[0].head_image:null,
                    org_image: '',
                    origin:data.origin,
                    create_time:  Date.now(),
                    receiver_id: '',
                    receiver_name: '',
                }
                msg.content=msg.content+`<span style="color: #2196F3"> [直播消息]</span>`
                //this.saveMsg(JSON.stringify(msg))
                msg.content = this.codeFilter(msg, true)
                var contentEl = $('#chat>.chatContent>.list')

                if (contentEl.scrollTop() + contentEl[0].clientHeight !== contentEl[0].scrollHeight) {
                    this.newMsg = true
                }
                this.msgList.push(msg)
//                this.queryHeadImg([msg], 'sender_id')
            },
            // 连接关闭的回调方法
            websocketOnclose() {
                console.log('连接关闭的回调方法');
            },
            // 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常
            websocketOnbeforeunload() {
                this.closeWebSocket();
            },
            // 关闭WebSocket连接
            closeWebSocket() {
                this.websocket.close();
            },
            getMsg(room) {
				console.log("romm++++++++++++++++++++++++++++++++++++++++++")
                this.$http.get(this.basePath + `/meeting-control/meetings/${room}/chatmsg`).then(data=>{
					console.log('进入请求')
					var resultList = data.result
					this.each(resultList, (data) => {
						this.dealMesg(data)
					})
					
				})
            },

            saveMsg(msgBody) {
                //msgBody = msgBody.parseJSON()
                msgBody = JSON.stringify(msgBody)
                this.post(this.basePath + `/meeting-control/meetings/${this.roomId}/chatmsg`, msgBody, (data) => {
                    console.info(data)
                }, (data) => {
                    console.error(data)
                })
            },


            // 粘贴的时候过滤掉粘贴的文字样式
            pasteFilter(e) {
                e.preventDefault();
                var text;
                var clp = (e.originalEvent || e).clipboardData;
                if (clp === undefined || clp === null) {
                    text = window.clipboardData.getData("text") || "";
                    if (text !== "") {
                        this.insertHtmlAtCaret(text)
                    }
                } else {
                    text = clp.getData('text/plain') || "";
                    if (text !== "") {
                        this.insertHtmlAtCaret(text)
                        //document.execCommand('insertText', false, text);
                    }
                    // 粘贴图片
                    var items, item, types;
                    items = clp.items;

                    if (!items) {
                        return;
                    }
                    item = items[0];
                    // 保存在剪贴板中的数据类型
                    types = clp.types || [];

                    for (var i = 0; i < types.length; i++) {
                        if (types[i] === 'Files') {
                            item = items[i];
                            break;
                        }
                    }

                    // 判断是否为图片数据
                    if (item && item.kind === 'file' && item.type.match(/^image\//i)) {
                        // 读取该图片
                        var file = item.getAsFile(),
                            reader = new FileReader();

                        // 读取文件后将其显示在网页中
                        reader.onload = (e) => {
                            this.canvasDataURL(e.target.result, 0.2, (b64, opt) => {
                                this.sendImg(e.target.result, b64, opt)
                            })
                        };
                        // 读取文件
                        reader.readAsDataURL(file);
                    }
                }

            },
            // 压缩base64
            canvasDataURL(path, quality, callback) {
                var img = new Image();
                img.src = path;
                img.onload = function () {
                    var that = this;
                    // 默认按比例压缩
                    var w = that.width,
                        h = that.height,
                        scale = w / h;

                    if (w > 300) {
                        // 按照300的宽度 等比缩
                        h = (300 / w) * h
                        w = 300
                    }
                    //生成canvas
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    // 创建属性节点
                    var anw = document.createAttribute("width");
                    anw.nodeValue = w;
                    var anh = document.createAttribute("height");
                    anh.nodeValue = h;
                    canvas.setAttributeNode(anw);
                    canvas.setAttributeNode(anh);
                    ctx.drawImage(that, 0, 0, w, h);


                    console.info(path.substring(0, 50))
                    var imgType = path.split(';base64')[0].replace('data:', '')
                    // quality值越小，所绘制出的图像越模糊
                    var base64 = canvas.toDataURL(imgType, quality);
                    // 回调函数返回base64的值
                    callback(base64, {
                        width: that.width,
                        height: that.height,
                    });
                }
            },
            // 插入图片类型的字符 到编辑框
            sendImg(big_img, sm_img, opt) {
                var text = $('#chat>.edit .u-textarea').html()

                var img = `<img class="img" width="${opt.width}px"  src="${big_img}" >`
                this.insertHtmlAtCaret(img)
            },
            joinEventHander(e) {
                // 使用用户id 查询用户名称
                // 添加一个消息 xxx 加入会议
                console.info(e.participant.userId)
                var arr = [{id: e.participant.userId}]
                this.queryHeadImg(arr, 'id', () => {
                    // 发送文字内容
                    var msg = {
                        type: 'alert',
                        action: 'group_chat',
                        content: arr[0].user_name + '加入会议',
                    }
                    var contentEl = $('#chat>.chatContent>.list')

                    if (contentEl.scrollTop() + contentEl[0].clientHeight !== contentEl[0].scrollHeight) {
                        this.newMsg = true
                    }
                    this.msgList.push(msg)
                })

            },
            // 本地音视频操作
            changeAvEventHander(data) {

                var arr = [{id: data.userId}]
                var message = data.message;

                this.queryHeadImg(arr, 'id', () => {
                    // 发送文字内容
                    var msg = {
                        type: 'alert',
                        action: 'group_chat',
                        content: arr[0].user_name + ' ' + message,
                    }
                    var contentEl = $('#chat>.chatContent>.list')
                    if (contentEl.scrollTop() + contentEl[0].clientHeight !== contentEl[0].scrollHeight) {
                        this.newMsg = true
                    }

                    this.msgList.push(msg)
                    //this.$Ics.conference.send(JSON.stringify(msg))

                })

            },
            // 离开房间
            leaveEventHander(data) {
                var arr = [{id: data.participant.userId}]
                this.queryHeadImg(arr, 'id', () => {
                    // 发送文字内容
                    var msg = {
                        type: 'alert',
                        action: 'group_chat',
                        content: arr[0].user_name + '离开会议',
                    }
                    var contentEl = $('#chat>.chatContent>.list')

                    if (contentEl.scrollTop() + contentEl[0].clientHeight !== contentEl[0].scrollHeight) {
                        this.newMsg = true
                    }
                    this.msgList.push(msg)
                })
            },
            // 被踢出房间
            kickEventHander(data) {
                var msg = {
                    type: 'alert',
                    action: 'group_chat',
                    content: `${data.data.user_name}被${data.sender_name}踢出房间！`,
                }
                var contentEl = $('#chat>.chatContent>.list')

                if (contentEl.scrollTop() + contentEl[0].clientHeight !== contentEl[0].scrollHeight) {
                    this.newMsg = true
                }
                this.msgList.push(msg)
            },
            dealMesg(data, origin) {
                switch (data.action) {
                    case 'group_chat': // 群聊
                        this.group_chat(data, origin)
                        break
                    case 'personal_chat': // 私聊
                        this.personal_chat(data, origin)
                        break
                    case 'log': // 私聊
                        this.scrollToBottom('#chat>.chatContent')
                        break

                }
            },

            // 收到消息回调

            messagereceivedHander(res) {
                var data = JSON.parse(res.message)
                this.dealMesg(data, res.origin)
            },
            // 接收私聊消息
            personal_chat(data, origin) {
                var type
                if (data.sender_id === this.userInfo.user_id) {
                    type = 'me'
                } else {
                    type = 'other'
                }
                // 只有自己的私聊消息才会显示
                if ((data.receiver_id !== this.userInfo.user_id) && (type !== 'me')) {
                    return
                }

                var msg = {
                    id: data.record_id ? data.record_id : data.id,
                    type,
                    chat_type: 'personal',
                    content_type: data.content.type ? data.content_type : data.content.type,
                    content: data.content.content ? data.content.content : data.content,
                    sender_id: data.sender_id,
                    sender_name: data.sender_name,
                    head_image: data.head_image,
                    org_image: '',
                    create_time: data.create_time ? data.create_time : Date.now(),
                    receiver_id: data.receiver_id,
                    receiver_name: data.receiver_name,
                }

                //this.saveMsg(JSON.stringify(msg))
                msg.content = this.codeFilter(msg, true)
                var contentEl = $('#chat>.chatContent>.list')

                if (contentEl.scrollTop() + contentEl[0].clientHeight !== contentEl[0].scrollHeight) {
                    this.newMsg = true
                }
                this.msgList.push(msg)


            },

            // 接收群聊消息
            group_chat(data, origin) {

                var type
                if (data.sender_id === this.userInfo.user_id) {
                    type = 'me'
                } else {
                    type = 'other'
                }
                var msg = {
                    id: data.record_id ? data.record_id : data.id,
                    type,
                    chat_type: 'group',
                    ontent_type: data.content.type ? data.content_type : data.content.type,
                    content: data.content.content ? data.content.content : data.content,
                    sender_id: data.sender_id,
                    sender_name: data.sender_name,
                    head_image: data.head_image,
                    org_image: '',
                    create_time: data.create_time ? data.create_time : Date.now(),
                    receiver_id: '',
                    receiver_name: '',
                }
                //this.saveMsg(JSON.stringify(msg))
                msg.content = this.codeFilter(msg, true)
                var contentEl = $('#chat>.chatContent>.list')

                if (contentEl.scrollTop() + contentEl[0].clientHeight !== contentEl[0].scrollHeight) {
                    this.newMsg = true
                }
                this.msgList.push(msg)
//                this.queryHeadImg([msg], 'sender_id')
            },
            // 接收到的代码 过滤成html
            codeFilter(item, sendOne) {
                if (!item) { // 如果没有传参数 则只是alert 消息 直接执行滚动条就行
                    if (this.autoScroll) {
                        this.scrollToBottom('#chat>.chatContent>.list')
                    }
                    return
                }
                var result

                result = item.content.replace(/\[emoji:(\d+)\]/g, (s0, s1) => {
                    var html = `<img data-src='${s1}' data-type="face" src="static/images/face/${s1}.gif"/>`
                    return html
                });
                if (item.chat_type === 'personal') {
                    if (item.type === 'me') {
                        result = `你对${item.receiver_name}说：` + result
                    } else {
                        result = `对你说：` + result
                    }
                }
                // 如果是自己的消息 让滚动条到最下面
                console.info(this.autoScroll || (sendOne && (item.sender_id === this.userInfo.user_id)))
                if (this.autoScroll || (sendOne && (item.sender_id === this.userInfo.user_id))) {
                    this.scrollToBottom('#chat>.chatContent')
                }

                return result
            },
            // 打开表情框
            openFaceBox() {
                this.faceShow = true
            },
            // 关闭表情框
            closeFaceBox() {
                this.faceShow = false
            },
            //  获取焦点添加键盘按下事件
            addEven() {
                var me = this
                $(document).keydown(function (event) { // 获取焦点后 绑定键盘事件  禁止回车和空格的默认事件 以防和播放器中的相关功能冲突
                    me.scrollToBottom('#chat>.edit .u-textarea')  // 插入文字时候 让滚动条保持在下面
                    if (event.keyCode === 32) {
                        me.insertHtmlAtCaret('&nbsp;')
                        return false
                    }
                    if (event.keyCode === 13) {
                        me.sendChate()
                        return false
                    }
                })

            },
            // 失去焦点之后 清除键盘按下事件
            removeEven() {
                $(document).off('keydown');
            },
            // 添加私聊相关消息样式
            addPersonalMsg(obj) {
                var textarea = $('#chat>.edit .u-textarea')
                textarea.html(textarea.html().replace('@', ''))
                var text = $('#chat>.edit .u-textarea').html()
                var html = `<input type="button" data-id="${obj.user}" data-name="${obj.user_name}" class="personalBtn" value="对${obj.user_name}私聊:">` + text
//                textarea.html(html)
                this.insertHtmlAtCaret(html)
            },
            //把html片段参数插入当前获取焦点的元素
            insertHtmlAtCaret(html) {
                // 编辑框获取焦点的时候才能执行以下方法 ，但是添加表情的时候 会使其失去焦点，所以要给点击的元素添加onmousedown="return false;" 确保 点击它的时候不使 编辑框失去焦点
                var sel, range, writeBox = $('#chat>.edit .u-textarea');
                if (window.getSelection) {
                    sel = window.getSelection();
//                    if (!$(sel.focusNode).is('#chat>.edit .u-textarea') && !$(sel.focusNode).parent().is('#chat>.edit .u-textarea') &&  !$(sel.focusNode).parent().parent().is('#chat>.edit .u-textarea')) {
//                        $('#chat>.edit .u-textarea').append($(html));//使输入框获取焦点
////                        return
//                    } // 如果 当前编辑框没有获取焦点 就会把元素放在第一位， 为了解决此问题，判断当前获取焦点的元素是不是 编辑框(获取焦点的元素可能是编辑框中的文字) 所以判断获取焦点的是是不是编辑框 或者获取焦点的父对象是不是编辑框 如果都不是 就给编辑框后面 append   图片
                    writeBox.focus()

                    if (sel.getRangeAt && sel.rangeCount) {
                        range = sel.getRangeAt(0);
                        range.deleteContents();
                        var el = document.createElement('div');
                        el.innerHTML = html;
                        var frag = document.createDocumentFragment(), node, lastNode;
                        while ((node = el.firstChild)) {
                            lastNode = frag.appendChild(node);
                        }
                        range.insertNode(frag);
                        if (lastNode) {
                            range = range.cloneRange();
                            range.setStartAfter(lastNode);
                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    }
                } else if (document.selection && document.selection.type != 'Control') {
                    writeBox.focus(); //在非标准浏览器中 要先让你需要插入html的div 获得焦点
                    ierange = document.selection.createRange();//获取光标位置
                    ierange.pasteHTML(html);    //在光标位置插入html 如果只是插入text 则就是fus.text="..."
                    writeBox.focus();
                }
            },
            // 点击表情 给输入框添加表情
            appendFace(index) {
                var html = `<img data-src='${index}' data-type='face' src='static/images/face/${index}.gif'/>`
                this.insertHtmlAtCaret(html);//调用插入函数
                this.scrollToBottom('#chat>.edit .u-textarea') // 插入图片时候 让滚动条保持在下面
                return false
            },
            // 使聊天的滚动条始终保持在最下面
            scrollToBottom(select) {
                // 现在所有的消息 始终会使滚动条在 底下， 后面需要判断下
                // 如果他网上滚动了滚动条  就设置一个属性 这个属性为true  就不再执行来消息 固定拉倒下面， 而是弹框提示有新消息
                // 只有再次拉倒最下面 才会解除

                if (!select) {
                    select = '#chat>.chatContent'
                }
                setTimeout(() => {
                    $(select).scrollTop($(select)[0].scrollHeight)
                }, 100)
            },
            // 检测 发送的内容中 有没有@
            testAt() {
                var text = $('#chat>.edit .u-textarea').html()
                if (text.indexOf('@') !== -1) {
                    this.showMemberList()
                }
            },
            // 发送聊天
            sendChate() {
                var text = $('#chat>.edit .u-textarea').html()
                if (!text) {
                    return
                }
                // 判断是否有私聊
                var action = 'group_chat', receiver_id = '', receiver_name = ''
                var result = text.replace(/<input[^>]*>/gi, (s0, s1) => {
                    if (s0) {
                        var el = $(s0)
                        action = 'personal_chat'
                        receiver_id = el.attr('data-id')
                        receiver_name = el.attr('data-name')
                    }
                    return ''
                });
                // 将图片类型 html 单独拿出来 组成数组
                var imgList = []

                result = result.replace(/<img[^>]*>/gi, (s0, s1) => {
                    var el = $(s0)
                    var faceIndex = el.attr('data-src')
                    var type = el.attr('data-type')
                    if (type === 'face') {
                        return `[emoji:${faceIndex}]`
                    } else {

                        imgList.push({
                            content: `<img width="${el.attr('width')}" src="${el.attr('src')}">`,
                            //content: `${el.attr('src')}`,
                            //content: "图片",
                            org_image: el.attr('data-big-src')
                        })
                        return ''
                    }
                });
                // 去掉首尾空格
                result = result.replace(/(^(&nbsp;)*)/, "").replace(/(&nbsp;)*$/, "")
                // 去掉首尾 换行
                result = result.replace(/(^(<br>)*)/, "").replace(/(<br>)*$/, "")
                if (result) {
                    // 发送文字内容
                    var msg = {
                        action,
                        receiver_id,
                        receiver_name,
                        content: {
                            type: 'words',
                            content: result,
                            org_image: ''
                        },
                        sender_id: this.userInfo.user_id,
                        head_image: this.userInfo.head_image,
                        sender_name: this.userInfo.user_name
                    }

                    this.$Ics.conference.send(JSON.stringify(msg))
                    this.saveMsg(msg)
                }
                // 遍历发送图片内容
                this.each(imgList, (item) => {
                    var sg = {
                        action,
                        receiver_id,
                        receiver_name,
                        content: {
                            type: 'image',
                            content: item.content,
                            org_image: item.org_image
                        },
                        sender_id: this.userInfo.user_id,
                        head_image: this.userInfo.head_image,
                        sender_name: this.userInfo.user_name
                    }
                    this.$Ics.conference.send(JSON.stringify(sg))
                    this.saveMsg(sg)
                })

                // 发送完成以后 需要让消息列表滚动条 在最下面

                $('#chat>.edit .u-textarea').html('')
            },

            // 聊天内容点击事件处理   (查看大图, 弹出菜单， 播放音频)
            openBigImg(e, item) {
                if (e.which === 3) { // 如果是右键点击
                    return false
                }
                // 如果点击的是表情 或者不是图片  则反回  如果点击的是语音 则执行播放
                if ($(e.target).is('#chat>.chatContent [data-type="face"]') || e.target.nodeName !== 'IMG') {
                    return
                }
                // 查看大图
                this.viewBigImg(e, item)

            },
            viewBigImg(e, obj) {
                this.bigImg.imgWidth = Number($(e.target).attr('width').replace('px', ''))
                var step = this.bigImg.imgWidth * 0.1,
                    stepNum = 0,
                    startWidth = this.bigImg.imgWidth,
                    bigImgDiv = $('#chat>.g-shade .u-viewBigImgBox')

                this.bigImg.show = true

                this.bigImg.src = $(e.target).attr('src')

                this.bigImg.scrollEvent = (e) => { //滚轮放大缩小事件

                    e = e || window.event
                    if (e.wheelDelta < 0 && stepNum > -5) {
                        stepNum--
                    } else if (e.wheelDelta > 0 && stepNum < 20) {
                        stepNum++

                    }
                    var bodyWidth = document.documentElement.clientWidth
                    // 图片的宽度不能超过屏幕宽度的百分之90
                    var imgWidth = startWidth + step * stepNum
                    if (imgWidth > bodyWidth * 0.9) {
                        this.bigImg.imgWidth = bodyWidth * 0.9
                    } else {
                        this.bigImg.imgWidth = imgWidth

                    }
                    e.preventDefault()
                }
                this.bigImg.dragEvent = (e) => { // 拖动事件
                    var oBox = e.target, disX = 0, disY = 0;
                    var e = e || window.event;
                    disX = e.clientX - oBox.offsetLeft;
                    disY = e.clientY - oBox.offsetTop;

                    document.onmousemove = (e) => {
                        var e = e || window.event;
                        var _x = e.clientX - disX
                        var _y = e.clientY - disY
                        if (_x < bigImgDiv.width() && _x > 0) {
                            $(oBox).css('left', _x)
                        }
                        if (_y < bigImgDiv.height() && _y > 0) {
                            $(oBox).css('top', _y)
                        }

                        this.bigImg.isDragging = true
                    };
                    document.onmouseup = () => {
                        setTimeout(() => {
                            this.bigImg.isDragging = false
                        })
                        document.onmousemove = null;
                        document.onmouseup = null;
                    };
                    e.preventDefault()

                }
            },
            // 关闭查看大图
            closeBigImg(e) {
                if ($(e.target).is('#chat>.chatContent .content img') || this.bigImg.isDragging) {
                    return
                }
                $('#chat>div.g-shade .u-viewBigImgBox>img').css({
                    top: '50%',
                    left: '50%'
                })
                this.bigImg.imgWidth = null

                this.bigImg.show = false
            },

            // 显示成员列表
            showMemberList() {
                this.member.show = true
                // 在父组件中获取成员列表
                this.$emit('getMemberList', (list) => {
                    console.info(list)
                    var copyList = JSON.parse(JSON.stringify(list))

                    // 去除自己
                    for (var i = 0; i < copyList.length; i++) {
                        var item = copyList[i]
                        if (item.user === this.userInfo.user_id) {
                            copyList.splice(i, 1)
                        }
                    }

                    this.member.list = copyList
                })
                this.member.affirm = (obj) => {
                    this.member.show = false
                    this.addPersonalMsg(obj)
                }
            },

            // 关闭成员列表
            closeMemberList() {
                this.member.show = false

            },

        }
    }
</script>

<style scoped lang="less" type="text/less">
    #chat {
        background: #F3F3F3;
        position: relative;

        & > .title {
            width: 100%;
            height: 0.4rem;
            line-height: 0.4rem;
            border-bottom: 1px solid #eee;
            text-align: center;
            font-size: 0.14rem;
            background: #fff;
        }

        .chatContent {
            width: 100%;
            height: 3.2rem;
            background: #fff;
            overflow-y: auto;


            & > .list {
                width: 100%;
                padding-bottom: 0.3rem;

                & > li.alert {
                    width: 100%;
                    height: 0.2rem;
                    line-height: 0.2rem;
                    margin-top: 0.1rem;
                    text-align: center;
                    color: #999;
                    font-size: 0.14rem;
                }

                & > li.other {
                    padding-left: 0.1rem;

                    & > .head {
                        float: left;
                        margin-right: 0.1rem;
                    }

                    & > .msg {
                        float: left;

                        & > .info {
                            text-align: left;

                            span {
                                float: left;
                            }

                            & > .name {
                                margin-right: 0.1rem;
                            }
                        }

                        & > .content {
                            background: #f2f2f2;
                        }
                    }

                }

                & > li.me {
                    padding-right: 0.1rem;

                    & > .head {
                        float: right;
                        margin-left: 0.1rem;

                    }

                    & > .msg {
                        float: right;
                        text-align: right;

                        & > .info {
                            text-align: right;

                            span {
                                float: right;
                            }

                            & > .name {
                                margin-left: 0.1rem;
                            }
                        }

                        & > .content {
                            background: rgba(17, 148, 246, .7);
                            color: #fff;
                        }
                    }
                }


                & > li {
                    width: 100%;
                    height: auto;
                    margin-top: 0.2rem;

                    & > .head {
                        height: 0.5rem;
                        width: 0.5rem;
                        border-radius: 50%;
                        overflow: hidden;
                        position: relative;

                        img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                        }

                        span {
                            font-size: 0.12rem;
                            width: 0.35rem;
                            line-height: 1;
                        }
                    }

                    & > .msg {
                        float: left;
                        width: calc(100% - 1.2rem);

                        & > .info {
                            margin-bottom: 0.1rem;

                            & > .name {
                                color: #333;
                                font-size: 0.18rem;
                            }

                            & > .time {
                                color: #999;
                                font-size: 0.18rem;
                            }
                        }

                        & > .content {
                            display: inline-block;
                            width: auto;
                            padding: 0.05rem;
                            text-align: left;
                            min-height: 0.35rem;
                            line-height: 0.35rem;
                            background: #f2f2f2;
                            border-radius: 0.05rem;
                            word-break: break-all;
                            font-size: 0.2rem;
                        }
                    }
                }
            }


        }

        .tools {
            width: 100%;
            height: 0.4rem;
            padding: 0 0.1rem;
            line-height: 0.4rem;

            & > .btn {
                display: inline-block;
                color: #9C9C9C;
                font-size: 0.26rem;
                cursor: pointer;
            }

            & > .btn.iconbiaoqing-copy {
                position: relative;

                & > ul {
                    position: absolute;
                    background: #fff;
                    width: 4.1rem;
                    bottom: 0.5rem;
                    left: -0.1rem;
                    z-index: 200;
                    padding: 0.1rem 0 0 0.1rem;
                    border-radius: 5px;
                    box-shadow: 2px 0 4px #ccc;

                    & > li:not(.u-icon) {
                        float: left;
                        width: 0.4rem;
                        height: 0.4rem;
                        margin-right: 0.1rem;
                        margin-bottom: 0.1rem;
                        line-height: 0.3rem;
                        padding: 0.05rem;
                        text-align: center;
                        border: 1px solid transparent;
                        border-radius: 3px;

                        img {
                            width: 0.3rem;
                            height: 0.3rem;
                        }
                    }

                    & > .u-icon {
                        position: absolute;
                        z-index: 1;
                        width: 0.1rem;
                        transform: rotate(45deg);
                        height: 0.1rem;
                        background: #fff;
                        bottom: -0.05rem;
                        left: 0.18rem;
                    }

                    & > li:not(.u-icon):hover {
                        border-color: #8f8f8f;
                    }

                }

                & > .u-icon {
                    position: absolute;
                    z-index: 1;
                    width: 0.1rem;
                    transform: rotate(45deg);
                    height: 0.1rem;
                    background: #fff;
                    bottom: 0.45rem;
                    left: 0.07rem;
                    box-shadow: 2px 0 4px #ccc;
                }


            }
        }


        .edit {
            width: 100%;
            height: calc(100% - 3.6rem);
            background: #fff;
            position: relative;
            display: flex;
            & > .u-textarea {
                width: 60%;
                height: 100%;
                max-height: 100%;
                padding: 0.05rem;
                overflow-y: auto;
                line-height: 0.25rem;
                outline: none;
                font-size: 0.2rem;
            }

            & > button {
                float: right;
                width: 40%;
                height: 0.5rem;
                font-size: 0.12rem;
                border-radius: 0.05rem;
                border: none;
                color: #fff;
                background: #1194F6;
                vertical-align: bottom;
                cursor: pointer;
            }
        }


        /*查看大图*/

        .g-shade {
            position: fixed;
            background: rgba(0, 0, 0, .6);
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10001;

            & > .close {
                font-size: 0.3rem;
                position: absolute;
                top: 0.2rem;
                right: 0.2rem;
                z-index: 1010;
                color: #fff;
                cursor: pointer;
            }

            .u-viewBigImgBox {
                position: absolute;
                top: 0;
                left: 0;
                z-index: 1009;
                width: 100%;
                height: 100%;
                background: transparent;
                overflow: hidden;
                /*box-shadow: 2px 4px 4px #ccc;*/
                border-radius: 5px;
                /*border: 0.1rem solid #f9f9f9;*/
            }

            .u-viewBigImgBox > img {
                position: relative;
                top: 50%;
                left: 50%;
                -webkit-transform: translate(-50%, -50%);
                -moz-transform: translate(-50%, -50%);
                -ms-transform: translate(-50%, -50%);
                -o-transform: translate(-50%, -50%);
                transform: translate(-50%, -50%);
                cursor: move;
                max-width: 90%;
            }
        }


    }

    .memberList {
        width: 2rem;
        max-height: 4rem;
        overflow-y: auto;
        box-shadow: 0 0 0.1rem #ddd;
        position: absolute;
        border-radius: 0.05rem;
        left: 0.3rem;
        bottom: 1.7rem;
        background: #fff;

        & > ul {

            & > li:not(.empty):hover {
                background: #1194f6;
                color: #fff;
            }

            & > .empty {
                text-align: center;
                line-height: 0.4rem;
                color: #999;
                cursor: default;
            }

            & > li {
                width: 100%;
                height: 0.5rem;
                padding: 0.05rem;

                & > .head {
                    width: 0.4rem;
                    height: 0.4rem;
                    overflow: hidden;
                    border-radius: 50%;
                    float: left;
                    margin-right: 0.05rem;

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                }

                & > p {
                    width: calc(100% - 0.45rem);
                    height: 0.4rem;
                    line-height: 0.4rem;
                    font-size: 0.12rem;
                    float: left;
                }
            }
        }

    }


</style>
<style>
    #chat > .chatContent > .list > li .content img:not([data-type="face"]) {
        max-width: 100%;
        display: block;

    }

    #chat > .chatContent > .list > li .content img[data-type="face"] {
        width: 0.3rem;
        height: 0.3rem;
        margin: 0 0.02rem;

        vertical-align: text-bottom;
    }

    #chat > .edit > .u-textarea img[data-type="face"] {
        width: 0.25rem;
        height: 0.25rem;
        margin: 0 0.02rem;
        vertical-align: text-bottom;
    }

    #chat > .edit > .u-textarea input {
        padding: 0.02rem 0.05rem;
        border-radius: 0.03rem;
        background: #9CCB31;
        border: none;
        margin: 0 0.02rem;
    }

    #chat > .edit > .u-textarea img:not([data-type="face"]) {
        width: 1rem;
    }

    #chat > .edit > .u-textarea input {
        padding: 0.02rem 0.05rem;
        border-radius: 0.03rem;
        background: #9CCB31;
        border: none;
        margin: 0 0.02rem;
    }
</style>
