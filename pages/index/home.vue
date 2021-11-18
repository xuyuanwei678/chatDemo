<template>
    <div id="home">
        <header  v-if="showHeader">
            <img src="@/assets/images/logo.png" alt="">
            <span>{{ params.name || '视频会议' }}</span>
            <span class="samll_span">
                <i v-if="win" title="最小化" @click="miniApp()">&minus;</i>
                <i v-if="win" title="关闭" @click="quit()">&times;</i>
            </span>
        </header>
        <div class="body clearfix" :class="showHeader?'':'bodyInfo'">
            <div class="info_tools">
                <div class="head_img">
                    <img v-if="userInfo" :src="userInfo.head_image || require('@/assets/images/userDef.png')" alt="">
                </div>

                <ul class="tools">
                    <li v-if="$Ics.publicationGlobal" v-title="video_mute ? '开启本地视频': '关闭本地视频'">
                        <i
                            class="iconfont"
                            :class="{'iconshexiang': !video_mute, 'iconic_videocam_off_px' : video_mute}"
                            @click="switchVideo()"></i>
                    </li>
                    <li v-if="$Ics.publicationGlobal" v-title="audio_mute ? '开启本地音频': '关闭本地音频'">
                        <i
                            class="iconfont"
                            :class="{'iconaudio': !audio_mute, 'iconjingyin' : audio_mute}"
                            @click="switchAudio()"></i>
                    </li>
                    <li v-if="$Ics.publicationGlobal&&userInfo && userInfo.role == 'normal'">
                        <i
                            class="iconfont iconjushou"
                            @click="handUp()"></i>
                    </li>

                    <li @click="getCode()" v-title="'分享二维码'">
                        <i class="iconfont iconweibiaoti--"></i>
                    </li>
                    <li @click="$refs.mainObj.openSettingBox()" v-if="showHeader" v-title="'设置'">
                        <i class="iconfont icon0702shezhi"></i>
                    </li>
                    <li v-if="userInfo && userInfo.role !== 'normal'" v-title="allAudio ? '关闭全员音频': '开启全员音频'">
                        <i
                            class="iconfont"
                            :class="{'iconquanyuanshengyinkaiqi': !allAudio, 'iconquanyuanshengyinguanbi' : allAudio}"
                            @click="switchAllAudio()"></i>
                    </li>

                    <!--<li @click="screen" :class="{active: isScreenShare}" v-if="userInfo && userInfo.role !== 'normal'"
                        v-title="'屏幕共享'">
                        <i class="iconfont iconhuiyizhongpingmugongxiang"></i>
                    </li>-->
                    <li @click="hangup" v-if="userInfo && userInfo.role !== 'normal'"
                        v-title="'结束会议'">
                        <i class="iconfont iconguaduan1"></i>
                    </li>
                </ul>
                <div class="quit">
                    <i class="iconfont icontuichu" @click="quit()"></i>
                </div>
            </div>
				
            <main-tem class="main" ref="mainObj" :info="userInfo"></main-tem>
        </div>
        <confirm ref="confirmObj"></confirm>
        <transition name="el-fade-in-linear">
            <div id="u-cofirm" class="shade" v-show="appShow">
                <div class="shade_box">
                    <div class="shade_title">智慧教育云手机平台<i @click="appShow = false">×</i>
                    </div>
                    <div class="u-content">
                        <div class="phone_code phoneCode"></div>
                    </div>
                </div>
            </div>
        </transition>
        <!-- <toast v-model="msg.show" width="auto" :type="msg.type">{{msg.text}}</toast> -->
        <!--https://localhost:9090/#/?user=1&role=presenter&room=5c6a236d65b9c63a1d390fc2&name=测试模板&is_audio_forbid=yes&basePath=http://192.168.1.138:8888&serverPath=-->
    </div>
</template>
<script type="text/ecmascript-6">
import mainTem from './common/main'
//import { Toast } from 'vux'
import appConfig from '@/appConfig'
import {version} from '@/static/info.json'
var $ = require('@/static/plugins/jquery-3.2.1.min.js')
var jquery = require('@/static/plugins/jquery-3.2.1.min.js')
export default {
    assname: '',

    data() {
        console.log("进入home")
        var me = this
        var query 
        // if (me.$route.query.to) {
        //     query = this.decryptUrl(me.$route.query.to)
        // }
		query = this.decryptUrl("dXNlciUzRDE4JTI2cm9sZSUzRHByZXNlbnRlciUyNmlzX2F1ZGlvX2ZvcmJpZCUzRHllcyUyNnJvb20lM0Q2MTI0YWZmOTc5ZDg3YjU3MWQxZTQ2MmElMjZuYW1lJTNEJUU4JUJGJTlDJUU3JUE4JThCJUU0JUJDJTlBJUU4JUFGJThBOTQ")
        // if (!me.$route.query.to) {
        //     me.$router.push({name: 'login'})
        // }
        console.info(query)
        if (!window.params && !query.user) { // 如果没有params 并且 query 是空 则没有传入任何参数
            this.$alert(`当前会议不存在！`, '提示', {
                confirmButtonText: '确定',
                callback: action => {
                    // 判断是在 网页 还是exe
                    this.quitApp(this)
                }
            })
            return
        }
        // me.$router.push({name:'login'})
        var params
        if (query.user) {
            params = query
            params.basePath = 'https://meeting.happok.com'
        } else if (window.params) {
            params = window.params
        } else {
            params = {basePath: ''}
        }
        window.params = params
        var basePath = params.basePath
        return {
            userInfo: null,
            version,
            params,
            basePath,
            msg:{
                show:false,
                type:'',
                text:''
            },
            audio_mute: false,
            video_mute: false,
            allAudio: true,
            isScreenShare: false,
            isPip: false,
            showHeader:true,
            // 屏幕共享 添加结束事件的时候 保存的一组 track  使用其进行结束
            tracks: [],
            appShow: false,
            win: window.win
        }
    },
    components: {
        mainTem,//Toast
    },
    mounted() {
        let htmlWidth = document.documentElement.clientWidth || document.body.clientWidth;
        let clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
        if (clientHeight > htmlWidth) {
            htmlWidth = clientHeight
        }
        //得到html的Dom元素
        let htmlDom = document.getElementsByTagName('html')[0];
        //设置根元素字体大小
        setTimeout(() => {
            htmlDom.style.fontSize = (htmlWidth / 1920) * 100 + 'px';
        }, 1000)
        console.log((htmlWidth / 1920) * 100 + 'px')
        // 进入页面之后 需要从后台获取当前自己id 的相关用户信息 储存入userInfo中 然后执行init
        try {
            jsInterface.horizontal()
            //将要给原生调用的方法挂载到 window 上面
            window.callJsQuit = this.quit
        } catch (e) {
            console.error("非手机用户")
        }
        if (window.__wxjs_environment === 'miniprogram') {
            this.showHeader=false
            // wx.miniProgram.postMessage({data:{msg:this.$route.name}})
        }
        this.init()
        /* if (window.history) {
            console.log(window.history);
            history.pushState(null, null, document.URL);
            window.addEventListener('popstate', function () {
                history.pushState(null, null, document.URL);
            })
        } */
        
        console.info(this.win)
    },
    methods: {
        /*举手发言*/
        handUp(){
            console.log(this.userInfo);
            this.each(this.$refs.mainObj.memberList,(ele)=>{
                if (ele.id == this.userInfo.id) {
                    console.log(ele);
                    if (ele.media.audio.status == 'inactive') {
                        var msg = {
                            action: 'handup',
                            message: {
                                id:this.userInfo.id,
                                name:this.userInfo.user_name
                            },
                        }
                        this.$Ics.conference.send(JSON.stringify(msg))
                        let info='举手发言'
                        this.$refs.mainObj.sendOpLog(this.userInfo.user_id, info)
                    }else{
                        this.msg.show=true
                        this.msg.type='text'
                        this.msg.text='麦克风已打开,可以直接发言'
                    }
                }
            })

        },

        decryptUrl(val) {
            try {
                let decryStr = window.atob(val); // 解码
                decryStr = window.decodeURIComponent(decryStr)
                return this.getUrlVars("?" + decryStr)
            } catch (err) {
                console.error('%c url-decry-error：' + JSON.stringify(err.stack), 'color:red;');
            }
            return "";
        },
        getUrlVars(url) {
            var hash;
            var myJson = {};
            var hashes = url.slice(url.indexOf('?') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                myJson[hash[0]] = hash[1];
            }
            return myJson;
        },
        getCode() {
            this.appShow = true
            if (!window.location.origin) {
                window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            }
            var jumpUrl = window.location.origin + '/#/login?meetingId=' + params.room
            console.log(params.room);
            this.appShowFun(jumpUrl)
        },
        appShowFun(url) {
            $('.phoneCode').html('')
            // 生成二维码
            var bw = document.body.clientWidth;
            var rem = bw / 1920 * 100;
            if (rem < 72) {
                rem = 72;
            }
            $('.phoneCode').qrcode({
                render: "canvas", //也可以替换为table
                width: '140',
                height: '140',
                text: url
            })
        },
        init() {
            // 在网页打开的时候 是没有这个方法的 所以try catch
            try {
                window.updateApp.init(this)
            } catch (e) {
                console.error(e)
            }

            if (this.params.user) {
                this.join()
            } else {
                this.$alert(`当前会议不存在！`, '提示', {
                    confirmButtonText: '确定',
                    callback: action => {
                        // 判断是在 网页 还是exe
                        this.quitApp(this)
                    }
                })
            }
        },
        //  退出屏幕共享合成
        IsPip(pip) {
            this.F = pip
        },
        quitScreenShare() {

            this.isScreenShare = false
            this.$Ics.screenpubGlobal && this.$Ics.screenpubGlobal.stop()

            this.$Ics.screenpubGlobal = null
            this.$refs.mainObj.pos_3_show = false
            if (this.isPip) {
                this.pictureFn(this.IsPip)
            }
        },
        hangup() {
            this.$refs.confirmObj.confirm('是否结束会议?', '提示', () => {
                this.delete(this.basePath + `/meeting-control/meetings/${this.params.room}/hangup`, (data) => {
                    this.$message({
                        message: '操作成功！',
                        duration: 1000,
                        type: 'success'
                    })
                }, (data) => {
                    this.$message({
                        message: '操作失败！',
                        duration: 1000,
                        type: 'error'
                    })
                })
            })
        },
        switchAllAudio() {
            this.allAudio = !this.allAudio
            console.log(this.userInfo);
            this.$refs.mainObj.closeAllAudio(this.allAudio)
        },

        screen() {
            if (this.$Ics.screenpubGlobal) { // 如果本地屏幕共享对象存在 就关闭 否则创建
                this.isScreenShare = false
                this.each(this.tracks, (track) => {
                    track.stop()
                })
                this.quitScreenShare()
                // 如果在清除的时候  屏幕共享刚好处于最大屏幕 则将合成画面显示在上面
                var screen_video = $('.screen_video')
                if (screen_video.is('.pos_1')) {
                    this.$refs.mainObj.switchScreen({currentTarget: $('.compound')[0]})
                }
                this.$refs.mainObj.sendScreenChange()

            } else {
                // 获取main。vue 中layout 列表 遍历 查找其中有没有屏幕共享的流
                var isHaveScreen = false
                this.each(this.$refs.mainObj.layoutList, (item) => {
                    if (item.source === 'screen-cast') {
                        isHaveScreen = true
                        return true
                    }
                })
                if (isHaveScreen) { // 如果已经有人共享 则提示  否则才能共享
                    this.$alert(`合成画面最多添加一个屏幕共享！`, '提示', {
                        confirmButtonText: '确定',
                    })

                } else {
                    this.$Ics.createScreen((screenPublish) => {
                        this.isScreenShare = true
                        this.$refs.mainObj.pos_3_show = true
                        // 添加屏幕共享后 自动静音
                        this.$Ics.screenpubGlobal.mute('audio')
                        this.tracks = []

                        // 调用res.screenStream 监听浏览器上的是否取消共享
                        this.$Ics.screenStream.mediaStream.getTracks().forEach(track => {
                            this.tracks.push(track)
                            track.onended = () => {
                                this.quitScreenShare()
                            }
                        })

                        if (!this.isPip) {
                            this.pictureFn(this.IsPip)
                        }

                        //
                        // this.$refs.confirmObj.confirm('是否进入画中画模式?', '提示', () => {
                        //
                        // })

                    }, (err) => {
                        // 没有安装的时候
                        if (err.toString().indexOf('Could not establish connection. Receiving end does not exist') !== -1) {
                            this.$confirm('您尚未安装谷歌屏幕共享插件，点击前往下载', '提示', {
                                confirmButtonText: '下载',
                                cancelButtonText: '取消',
                            }).then(() => {
                                window.open(this.basePath + '/meeting-control/update/extension')
                            }).catch(() => {
                            })
                        } else {

                            if (err.toString().indexOf("Permission denied")) {
                                console.warn("取消共享：" + err)
                            } else {
                                this.$alert(`调用屏幕共享失败！`, '提示', {
                                    confirmButtonText: '确定',
                                })
                            }
                        }

                    }, (err) => {
                        console.error(err)
                        this.$alert(`调用屏幕共享失败！`, '提示', {
                            confirmButtonText: '确定',
                        })
                    })
                }
            }
        },
        // 加入会议
        join() {
			
			
			console.log("进入join")
			
            // 将url 上面的数据获取出来 传递生成token 然后加入会议
            this.params.origin = 'phone'
            if (window.__wxjs_environment === 'miniprogram') {
                this.params.origin ='wx'
            }
		
            this.$Ics.runSocketIOSample(
                this.params, // 传入参数
                this.basePath, // 传入服务器路径
                (resp) => { // 加入会议后回调
                    this.userInfo = JSON.parse(uni.getStorageSync('userInfo'))
                    this.queryHeadImg([this.userInfo], 'user_id')
					
					console.log("this.$refs",this.$refs)
					
                    // 初始化main
                    this.$refs.mainObj.init(this.userInfo)

                    // 添加分辨率数组
                    this.$refs.mainObj.loadResolutions(resp.remoteStreams)
					console.log("resp.remoteStreams",resp.remoteStreams)
                },
            )

        },
        // 本地视频
        switchVideo() {
            this.video_mute = !this.video_mute
            var msg = '关闭本地视频'
            if (!this.video_mute) {
                msg = '打开本地视频'
            }
            this.$refs.mainObj.sendOpLog(this.userInfo.user_id, msg)

            var videoTracks = this.$Ics.localStream.mediaStream.getVideoTracks()
            if (this.video_mute && videoTracks) {
                videoTracks.forEach(track => {
                    //this.$Ics.changeDevice('forbidden', null)
                    track.enabled = false
                })

            } else if (videoTracks) {
                //this.$Ics.changeDevice(null, null)
                videoTracks.forEach(track => {
                    track.enabled = true
                })
            } else {
                console.info("switchVideo error" + this.$Ics.localStream)
            }
        },
        // 本地音频
        switchAudio() {
            this.audio_mute = !this.audio_mute
            var msg = '关闭本地音频'
            if (!this.audio_mute) {
                msg = '打开本地音频'
            }
            this.$refs.mainObj.sendOpLog(this.userInfo.user_id, msg)

            var audioTracks = this.$Ics.localStream.mediaStream.getAudioTracks()
            if (this.audio_mute && audioTracks) {
                audioTracks.forEach(track => {
                    track.enabled = false
                })
            } else if (audioTracks) {
                audioTracks.forEach(track => {
                    track.enabled = true
                })
            } else {
                console.info("switchAudio error" + this.$Ics.localStream)
            }
        },

        // 退出
        quit() {
            this.$refs.confirmObj.confirm('确认退出当前会议？', '提示', () => {
                this.quitApp(this)
            })
        },
    }
}
</script>
<style scoped lang="less" type="text/less">
#home {
    & > header {
        position: relative;
        width: 100%;
        height: 0.7rem;
        background: #fff;
        border: 1px solid #EDEDED;
        text-align: center;
        line-height: 0.7rem;

        & > img {
            width: 1rem;
            height: 0.24rem;
            position: absolute;
            left: 0.5rem;
            top: 0.23rem;
        }

        & > span {
            font-weight: bold;
            color: #4c4c4c;
            font-size: 0.24rem;
        }

        & > .samll_span {
            position: absolute;
            top: 0;
            right: 0.2rem;
            display: flex;
            justify-content: flex-start;
            cursor: pointer;

            & > i {
                width: 0.5rem;
                font-size: 0.24rem;
                color: #666;
            }

            & > i:hover {
                color: #1194f6;
            }
        }

    }
    & > .body {
        width: 100%;
        height: calc(100% - 0.7rem);

        & > div {
            float: left;
        }

        i {
            cursor: pointer;
        }

        & > .info_tools {
            width: 0.7rem;
            height: 100%;
            background: #2E2D2B;
            color: #fff;
            text-align: center;
            padding: 0.35rem 0.1rem 0;
            position: relative;

            & > .head_img {
                width: 0.5rem;
                height: 0.5rem;
                border: 2px solid #fff;
                border-radius: 50%;
                overflow: hidden;
                margin-bottom: 0.5rem;


                & > img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }

            & > .tools {
                height: calc(100% - 5.5rem);
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-direction: column;

                & > li {
                    width: 100%;
                    height: 0.5rem;
                    line-height: 0.5rem;
                    text-align: center;
                    margin-bottom: 0.2rem;

                    & > i {
                        font-size: 0.45rem;
                    }
                }

                & > li.active {
                    border-radius: 0.05rem;
                    background: #1194f6;
                    color: #fff;
                }
            }
            & > .quit {
                position: absolute;
                bottom: 0.5rem;
                left: 0;
                width: 100%;
                height: 0.3rem;
                text-align: center;
                line-height: 0.3rem;

                & > i {
                    font-size: 0.5rem;
                }
            }
        }

        & > .main {
            width: calc(100% - 0.7rem);
            height: 100%;
        }


    }
    & > .bodyInfo{
        height: 100%!important;
    }

}

.u-content {
    width: 350px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.phone_code {
    margin: 25px 0;
    width: 140px;
    height: 140px;
    display: inline-block;
}

</style>
