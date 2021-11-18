<template>

    <div id="main" class="clearfix">
        <div class="left">
            <div class="participant">
                <div class="title clearfix">
                    <div class="nav_item" :class="{active: navType === 'user'}" @click="checkNav('user')">参与人员</div>
                    <div class="nav_item" :class="{active: navType === 'stream'}" @click="checkNav('stream')">外部流</div>
                </div>

                <ul class="userList" v-show="navType === 'user'">
                    <li
                        :draggable="userInfo.role !== 'normal'"
                        class="clearfix"
                        v-for="(item, index) in this.memberList"
                        @dragstart="userInfo.role !== 'normal' && user_dragstart($event, item, index)"
                    >
                        <div class="info clearfix">
                            <div class="head_img">
                                <img :src="item.head_image || require('@/assets/images/userDef.png')" alt="">
                            </div>
                            <p class="name">
                                <span>{{ item.user_name }}</span>
                                <svg class="icon" aria-hidden="true">
                                    <use
                                        :xlink:href="item.origin === 'phone' ? '#iconshouji1' :item.origin === 'wx' ?'#iconweixin1':''"></use>
                                </svg>
                                <svg class="icon" aria-hidden="true">
                                    <use
                                        :xlink:href="item.role === 'presenter' ? '#iconqunzhu1' : item.role === 'manager' ?'#iconchengyuan':''"></use>
                                </svg>

                            </p>
                        </div>
                        <div class="tools">
                            <!--只有上视频的人员才有 iconshexiang 和 iconaudio  通过判断isInMixed 有没有加载-->
                            <i class="iconfont iconguaduan" style="color: red ;" @click="hangUp(item)"
                               v-if="item.role !== 'presenter'&&item.role !== 'manager'&&userInfo.role!='normal'"
                               v-title="'挂断'"></i>
                            <i @click="rollCall(item)"
                               v-if="item.media  && item.media.audio"
                               v-show="item.role !== 'presenter'&&item.role !== 'manager'&&userInfo.role!='normal'"
                               class="iconfont  active icondianming">
                            </i>
                            <i v-if="$Ics.screenpubGlobal && userInfo.id === item.id"
                               :class="{'not-allowed': userInfo.role === 'normal','active': isQuiteScreen}"
                               @click="userInfo.role !== 'normal' && isQuiteScreen ? quite_screen($Ics.screenpubGlobal.id) : open_screen($Ics.screenpubGlobal.id)"
                               class="iconfont iconhuiyizhongpingmugongxiang"
                               style="cursor: default; font-size: 0.24rem"
                            ></i>

                            <i @click="item.role === 'manager' ? setManager(item, true) : setManager(item)"
                               v-if="userInfo.role !== 'normal'"
                               v-show="item.id !== userInfo.id && (item.role !== 'presenter') && userInfo.role !== 'manager'"
                               v-title="item.role === 'manager'? '取消管理员' : '设为管理员'"
                               :class="item.role === 'manager'?'iconquxiaoguanliyuanxian':'iconset-administrator'"
                               class="iconfont  active">
                            </i>
                            <i v-if="item.media && item.media.video && item.isInMixed"
                               :class="{'not-allowed': userInfo.role === 'normal','iconshexiang': item.media.video.status === 'active', 'iconic_videocam_off_px':  item.media.video.status === 'inactive', active: item.media.video.status === 'active'}"
                               @click="userInfo.role !== 'normal' && switchStreams(item, 'video')"
                               class="iconfont iconshexiang"
                               style="cursor: default;"
                            ></i>
                            <i v-if="item.media  && item.media.audio"
                               :class="{'not-allowed': userInfo.role === 'normal', 'iconaudio': item.media.audio.status === 'active', 'iconjingyin':  item.media.audio.status === 'inactive', active: item.media.audio.status === 'active'}"
                               @click="userInfo.role !== 'normal' && switchStreams(item, 'audio')"
                               class="iconfont "
                               style="cursor: default;"
                            ></i>
                            <!--暂时将退出合成的按钮 给操作图标， 后面需要在点击这个图标后 出现菜单 @click="exit_mixed(item.stream)"-->
                            <!--<div class="setting active" v-if="userInfo.role !== 'normal'">
                                <i class="iconfont iconcaozuo1 active" @click.stop="openMenu(item)"></i>
                                <transition name="el-zoom-in-top">
                                    <ul v-show="item.menuShow" v-clickoutside="closeMenu">
                                        <li @click="item.isInMixed ? exit_mixed(item.stream) : join_mixed(item.stream)">
                                            {{item.isInMixed ? '退出合成' : '加入合成'}}
                                        </li>
                                        &lt;!&ndash;只要该用户是房主 则没有挂断按钮&ndash;&gt;
                                        <li @click="hangUp(item)" v-if="item.role !== 'presenter'">挂断</li>
                                        &lt;!&ndash;管理员本人 和房主 没有设为管理员这个按钮&ndash;&gt;
                                        <li @click="item.role === 'manager' ? setManager(item, true) : setManager(item)"
                                            v-if="item.id !== userInfo.id && (item.role !== 'presenter') && userInfo.role !== 'manager'">
                                            {{item.role === 'manager'? '取消管理员' : '设为管理员'}}
                                        </li>
                                    </ul>
                                </transition>

                            </div>-->
                        </div>
                    </li>
                </ul>

                <ul class="streamList" v-show=" navType === 'stream'">
                    <li
                        v-for="(item, index) in ext_streamsList"
                        :draggable="userInfo.role !== 'normal'"
                        @dragstart="userInfo.role !== 'normal' && stream_dragstart($event, item, index)"
                    >
                        <!--后面这里要显示名称  因为现在接口没有名称 暂时以id 代替-->
                        <div class="name">{{ item.info.name }}</div>
                        <div class="tools">
                            <i v-if="item.media && item.isInMixed"
                               :class="{'iconshexiang': item.media.video, 'iconic_videocam_off_px':  !item.media.video, active: item.media.video}"
                               class="iconfont not-allowed"></i>
                            <i v-if="item.media && item.isInMixed"
                               :class="{'iconaudio': item.media.audio, 'iconjingyin':  !item.media.audio, active: item.media.audio}"
                               class="iconfont not-allowed"></i>
                            <i class="iconfont active"
                               :class="{'icon-tuichu1': item.isInMixed, 'icon-get-out': !item.isInMixed}"
                               @click="item.isInMixed ? exit_mixed(item.id) : join_mixed(item.id)"
                               v-if="userInfo.role !== 'normal'"></i>
                            <i class="iconfont icon-shanchu active" @click="del_ext_stream(item.id)"
                               v-if="userInfo.role !== 'normal'"></i>
                        </div>
                    </li>
                </ul>
            </div>

            <div class="chat">
                <div class="title">聊天室</div>
                <chat :userinfo="userInfo" @getMemberList="(cab) => {cab(memberList)}" class="chat-content"
                      ref="chatObj" :class="showWx?'':'chatInfo'" :userList="memberList"></chat>

            </div>


        </div>

        <div class="right">
            <div class="videoContainer pos_1 compound" @click="switchScreen($event)">
                <!--在合成画面的 容器中添加一个ul  这个里面显示的是 对应屏幕中人员的信息-->
                <ul
                    class="layoutList"

                >
                    <!-- @dragover="userInfo.role !== 'normal' && screen_dragover($event)"
                     @dragleave="userInfo.role !== 'normal' && screen_dragleave($event)"
                     @drop="userInfo.role !== 'normal' && out_screen_drop($event, null)"-->
                    <li
                        :id="'screen_' + item.stream"
                        v-for="(item, index) in layoutList"
                        :style="item.style"

                        @dblclick="amplifyVideo(item)"
                        v-show="!backBtn"


                    >
                        <!--    :draggable="userInfo.role !== 'normal'"
                                @dragover="userInfo.role !== 'normal' && screen_dragover($event, item)"
                                @dragleave="userInfo.role !== 'normal' && screen_dragleave($event, item)"
                                @drop.stop="userInfo.role !== 'normal' && screen_drop($event, item, index)"

                                @dragstart="userInfo.role !== 'normal' && screen_dragstart($event, item, index)"-->
                        <span class="name">
                            <span>
                                {{
                                    item.user_name
                                }}{{
                                    item.source === 'streaming' ? '(外部流)' : item.source === 'screen-cast' ? '(屏幕共享)' : ''
                                }}
                            </span> <i v-show="item.speaking" class="test iconfont iconyuyin-2"></i>
                        </span>
                        <span class="screenStream iconfont iconpingmugongxiang"
                              v-show="item.source === 'screen-cast'&&showTab" @click="displayStreamScreen(item.stream)">

                        </span>

                    </li>
                </ul>
                <i class="iconfont icon-fanhui1" @click="reduce()" v-show="backBtn"></i>

                <video  autoplay id="picture" class="remote" volume="0.8"></video>
            </div>

            <div class="toolList clearfix">
                <div class="volume" v-show="toolsShow">
                    <i class="iconfont"
                       :class="{'iconjingyin1': volumeBox.volume === 0, 'iconshengyin-copy' : volumeBox.volume !== 0}"
                       @click.stop="openVolumeBox()"></i>
                    <transition name="el-zoom-in-bottom">
                        <div v-show="volumeBox.show" v-clickoutside="closeVolumeBox">
                            <el-slider
                                v-model="volumeBox.volume"
                                vertical
                                :min="0"
                                :max="1"
                                :step="0.1"
                                :show-tooltip="volumeBox.show"
                                @change="volumeBox.change"
                                :height="(1.7 * rem) + 'px'">
                            </el-slider>
                        </div>
                    </transition>

                </div>
                <div v-show="toolsShow" class="resolution" v-if="resolutions.active || resolutions.active === 0">
                    <span class="btn"
                          @click.stop="openResolutions()">{{
                            resolutions.list[resolutions.active].width
                        }}x{{ resolutions.list[resolutions.active].height }}</span>
                    <transition name="el-zoom-in-bottom">
                        <ul v-show="resolutions.show" v-clickoutside="closeResolutions">
                            <li v-for="(item, index) in resolutions.list"><span
                                :class="{active: index === resolutions.active}" class="btn"
                                @click="resolutions.affirm(item, index)">{{ item.width }}x{{ item.height }}</span></li>
                        </ul>
                    </transition>
                </div>
                <div class="fullScreenBtn" v-if="showWx">
                    <i class="iconfont iconquanping" @click="fullScreen()"></i>
                </div>
                <!-- <div class="pictureFunBtn">
                     <i class="iconfont iconhuazhonghua" @click="pictureFun()"></i>
                 </div>-->
            </div>

            <div class="videoContainer local_video pos_2" @click="switchScreen($event)">
                <video ref="localVideo" id='local-video'  :muted="true" :autoplay="true" class="local"></video>
				 
				
            </div>
            <div class="videoContainer screen_video pos_3" v-show="pos_3_show" @click.stop="switchScreen($event)">
                <i class="iconfont z-center" v-show="screen_mac"
                   :class="{'iconaudio' : pos_3_i_state, 'iconjingyin': !pos_3_i_state}"
                   @click.stop="setScreenAudio()"></i>
                <video id='screen-video' playsinline muted autoplay class="screen"></video>

            </div>

            <div class="aboutVideo clearfix">

            </div>


        </div>

        <!--高级设置弹框-->
        <transition name="el-fade-in-linear">
            <div class="shade" v-show="settingBox.show">
                <div class="shade_box">
                    <div class="shade_title">高级设置<i @click="settingBox.show = false">×</i>
                    </div>
                    <div class="settingBox clearfix">
                        <div class="left">
                            <ul>
                                <li @click="scrollDiv(0)" :class="{active: settingBox.active === 0}">本地设置</li>
                                <li @click="scrollDiv(1)" :class="{active: settingBox.active === 1}"
                                    v-if="userInfo && userInfo.role !== 'normal'">屏幕布局
                                </li>
                                <!-- <li @click="scrollDiv(2)" :class="{active: settingBox.active === 2}"
                                     v-if="userInfo && userInfo.role !== 'normal'">拉流互动
                                 </li>-->
                                <!--<li @click="scrollDiv(3)" :class="{active: settingBox.active === 3}"
                                    v-if="userInfo && userInfo.role !== 'normal'">直播推流
                                </li>-->
                            </ul>
                        </div>
                        <div class="right">
                            <ul>
                                <li>
                                    <div class="title">本地设置</div>
                                    <div class="content">
                                        <div class="item mac">
                                            <label>麦克风：</label>
                                            <el-select v-model="settingBox.mediaSet.mac" placeholder="请选择"
                                                       @change="settingBox.mediaSet.affirm('mac')">
                                                <el-option
                                                    v-for="item in settingBox.mediaSet.mac_list"
                                                    :key="item.deviceId"
                                                    :label="item.label"
                                                    :value="item.deviceId">
                                                </el-option>
                                            </el-select>
                                        </div>
                                        <div class="item camera">
                                            <label>摄像头：</label>
                                            <div class="info">
                                                <el-select v-model="settingBox.mediaSet.camera" placeholder="请选择"
                                                           @change="settingBox.mediaSet.affirm('camera')">
                                                    <el-option
                                                        v-for="item in settingBox.mediaSet.camera_list"
                                                        :key="item.deviceId"
                                                        :label="item.label"
                                                        :value="item.deviceId">
                                                    </el-option>
                                                </el-select>

                                                <!--<video src=""></video>-->
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <!--                                userInfo && userInfo.role !== 'normal'-->
                                <li class="layoutSet" v-if="userInfo && userInfo.role !== 'normal'">
                                    <div class="title">布局设置</div>
                                    <div class="content clearfix">
                                        <div class="s1" :class="{active: settingBox.layoutType === 'singel'}"
                                             @click="settingBox.setLayoutType('singel')">
                                            <div></div>
                                        </div>
                                        <div class="s2" :class="{active: settingBox.layoutType === 'pip'}"
                                             @click="settingBox.setLayoutType('pip')">
                                            <div></div>
                                        </div>
                                        <div class="s_two" :class="{active: settingBox.layoutType === 'two'}"
                                             @click="settingBox.setLayoutType('two')">
                                            <div></div>
                                        </div>
                                        <div class="s3" :class="{active: settingBox.layoutType === 'three'}"
                                             @click="settingBox.setLayoutType('three')">
                                            <div></div>
                                        </div>
                                        <div class="s4" :class="{active: settingBox.layoutType === 'four'}"
                                             @click="settingBox.setLayoutType('four')">
                                            <div></div>
                                        </div>
                                        <div class="s6" :class="{active: settingBox.layoutType === 'six'}"
                                             @click="settingBox.setLayoutType('six')">
                                            <div></div>
                                        </div>
                                        <div class="s9" :class="{active: settingBox.layoutType === 'nine'}"
                                             @click="settingBox.setLayoutType('nine')">
                                            <div></div>
                                        </div>
                                        <div class="s16" :class="{active: settingBox.layoutType === 'sixteen'}"
                                             @click="settingBox.setLayoutType('sixteen')">
                                            <div></div>
                                        </div>
                                    </div>
                                </li>
                                <li v-if="false">
                                    <div class="title">
                                        拉流互动

                                        <!--<span class="btn" @click="settingBox.addExt_streams.affirm()">添加</span>-->
                                    </div>
                                    <div class="content">
                                        <div class="item">
                                            <label><span class="red">*</span>流名称：</label>
                                            <input type="text" v-model="settingBox.addExt_streams.name" class="u-com"
                                                   placeholder="请输入流名称">
                                        </div>
                                        <div class="item">
                                            <label><span class="red">*</span>类型：</label>
                                            <el-radio v-model="settingBox.addExt_streams.type" label="all">音视频
                                            </el-radio>
                                            <el-radio v-model="settingBox.addExt_streams.type" label="video">纯视频
                                            </el-radio>
                                        </div>

                                        <div class="item">
                                            <label><span class="red">*</span>流地址：</label>
                                            <input type="text" v-model="settingBox.addExt_streams.url"
                                                   class="u-com address" placeholder="请输入流地址">
                                        </div>

                                        <div class="item" style="text-align: center;">
                                            <button class="u-com affirm" @click="settingBox.addExt_streams.affirm()">
                                                保存
                                            </button>
                                        </div>
                                    </div>
                                </li>
                                <li v-if="false">
                                    <div class="title">
                                        直播推流
                                    </div>
                                    <div class="content">

                                        <div class="item">
                                            <label><span class="red">*</span>流地址：</label>
                                            <input type="text" v-model="settingBox.live_streams.url"
                                                   class="u-com address" placeholder="请输入流地址">
                                            <button class="u-com affirm" @click="settingBox.live_streams.affirm()">
                                                开始
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </transition>


        <confirm ref="confirmObj"></confirm>

    </div>
</template>

<script type="text/ecmascript-6">
import chat from './chat'
import appConfig from '@/appConfig'
var $ = require('@/static/plugins/jquery-3.2.1.min.js')
var jquery = require('@/static/plugins/jquery-3.2.1.min.js')
export default {
    data() {
        var bw = document.body.clientWidth;
        var rem = bw / 1920 * 100;
        if (rem < 72) {
            rem = 72;
        }
        var me = this
		
        return {
            userInfo: null,
            rem,
            basePath: window.params.basePath || appConfig.basePath,
            params: window.params,
            navType: 'user', //user , stream
            memberList: [], // 成员列表
            ext_streamsList: [], // 外部流列表
            layoutList: [], // 布局列表
            drageType: 'screen', // screen 屏幕拖拽(排序)  user 用户加入合成(排序加 加入)
			src: '',
			srcObject: '',
            settingBox: {
                show: false,
                active: 0,
                addExt_streams: {
                    name: '',
                    type: 'all', // video 纯视频  all 音视频
                    url: '',
                    affirm: null
                },
                live_streams: {
                    url: '',
                    affirm: null
                },
                // 设置音视频相关
                mediaSet: {
                    mac: '',
                    camera: '',
                    mac_list: [],
                    camera_list: [],
                    affirm: null
                },
                // 布局相关
                layoutType: '',
                setLayoutType: null,

            },
            // 清晰度
            resolutions: {
                show: false,
                list: [],
                affirm: null,
                stream: null, // 合成流 (切换分辨率用)
                subscriptionForMixedStream: null, // subscribe 之后返回的对象， 在切换分辨率的时候需要先执行其stop
                active: null
            },
            // 音量
            volumeBox: {
                show: false,
                volume: 0.8,
                change() {
                },
            },
            remoteStreams: [], // 流对象列表
            toolsShow: true,
            isFullScreen: false,
            backBtn: false,
            firstLoad: true,
            // 屏幕共享video 是否显示
            pos_3_show: false,
            screen_mac: false,
            screenSubscribe: null,
            screenStreamId: null,
            showTab: true,
            // 屏幕共享 图标状态
            pos_3_i_state: false,
            isQuiteScreen: true,
            showWx:true
        }
    },
    props: {
        info: Object
    },
    watch: {
        info() {
            this.userInfo = this.info
        },
    },
    components: {
        chat,
    },
    mounted() {
		console.log('进入')
		console.log($('#local-video').get(0));
        // 一会要删除
        if (window.__wxjs_environment === 'miniprogram') {
            this.showWx=false
            wx.miniProgram.postMessage({data:{msg:this.$route.name}})
        }
    },
    methods: {
        leave(e) {
            this.getExt_streams('left') // 更新状态
            this.$refs.chatObj.leaveEventHander(e)

            // 有人离开会议
            if (this.userInfo.id === e.participant.id) {
                // 如果是自己因为种种原因 出去了 则提示
                this.$alert(`您已离开会议！`, '提示', {
                    confirmButtonText: '确定',
                    callback: action => {
                        // 判断是在 网页 还是exe
                        this.quitApp(this)
                    }
                })
            }
        },
        init(userInfo) {

            this.userInfo = userInfo
            console.log("进入main的init",this.userInfo)
            this.getExt_streams('first')
            this.$refs.chatObj.init(this.basePath, this.params.room)
            // 添加布局改变监听

            this.$Ics.conference.addEventListener('messagereceived', (res) => {
                // 有新消息
                try {
                    var data = JSON.parse(res.message)
                } catch (err) {
                    return
                }
                switch (data.action) {
                    case 'layoutChange': // 布局变化
                        this.getExt_streams('layoutChange') // 更新状态
                        break
                    case 'hangup': // 被挂断
                        this.$refs.chatObj.kickEventHander(data)
                        if (data.data.id === this.userInfo.id) {
                            this.$alert(`您已被${data.sender_name}踢出会议！`, '提示', {
                                confirmButtonText: '确定',
                                callback: action => {
                                    // 判断是在 网页 还是exe
                                    this.quitApp(this)
                                }
                            })
                        }
                        break
                    case 'squeeze': // 被挤出去
                        if (data.data.id === this.userInfo.id) {
                            this.$alert(`您的账号在别处登录，已经被挤出会议！`, '提示', {
                                confirmButtonText: '确定',
                                callback: action => {
                                    this.quitApp(this)
                                }
                            })
                        }
                        break
                    case 'manageChange': // 管理员变化
                        this.updateManager() // 查询管理员 更新列表
                        if (data.data.id === this.userInfo.user_id) {
                            var msg = data.data.type ? '您已经被取消了管理员权限！' : '您已被设置为管理员！'
                            this.$alert(msg, '提示', {
                                confirmButtonText: '确定',
                                callback: action => {
                                }
                            })
                        }
                        break
                    case 'closeScreen':
                        this.closeScreen()
                        /*this.pos_3_i_state = false
                        this.pos_3_show = false
                        this.screenStreamId = null
                        this.screenSubscribe && this.screenSubscribe.stop()
                        this.screenSubscribe = null
                        console.log('closeScreen...............')
                        if ($('.screen_video').hasClass('pos_1')) {
                            $('.pos_3').removeClass('pos_3').addClass('pos_1')
                            $('.screen_video').removeClass('pos_1').addClass('pos_3')
                        }*/
                        break
                    case 'audio':
                        this.each(this.memberList, (item) => {
                            if (item.id == data.user_id) {
                                console.log(data, item);
                                if (data.act == 'paused') {
                                    item.media.audio.status = 'inactive'
                                } else {
                                    item.media.audio.status = 'active'
                                }

                            }
                        })
                        break
                    case 'video':
                        this.each(this.memberList, (item) => {
                            if (item.id == data.user_id) {
                                console.log(data, item);
                                if (data.act == 'paused') {
                                    item.media.video.status = 'inactive'
                                } else {
                                    item.media.video.status = 'active'
                                }

                            }
                        })
                        break
                    case 'log':
                        this.$refs.chatObj.changeAvEventHander({"userId": data.user_id, "message": data.msg})
                        break
                    case 'handup':
                        if (this.userInfo.role == 'normal') {
                            return
                        } else {
                            this.$refs.confirmObj.confirm(`${data.message.name}申请发言`, '提示', () => {
                                let obj = {}
                                this.each(this.memberList, (ele) => {
                                    if (ele.id == data.message.id && ele.media.audio.status == 'inactive') {
                                        obj = ele
                                        this.switchStreams(obj, 'audio')
                                        let info = `同意 ${ele.user_name} 发言`
                                        this.sendOpLog(this.userInfo.user_id, info)
                                    }
                                })
                            }, () => {

                            }, ['同意', '拒绝'])
                            /* this.$confirm(`${data.message.name}申请发言`, '提示', {
                                 confirmButtonText: '同意',
                                 cancelButtonText: '拒绝',
                             }).then(() => {
                                 let obj={}
                                 this.each(this.memberList,(ele)=>{
                                     if (ele.id == data.message.id&&ele.media.audio.status == 'inactive') {
                                         obj=ele
                                         this.switchStreams(obj,'audio')
                                     }
                                 })
                                 console.log(obj);

                             }).catch(() => {
                                 return
                             });*/

                        }
                        break
                    case 'rollCall':
                        console.log(data);
                        this.each(this.memberList, (item) => {
                            if (item.id != data.data.id && item.role == 'normal') {
                                console.log(item.media.audio.status);
                                if (item.media.audio.status == 'active') {
                                    this.switchStreams(item, 'audio')
                                }
                            }
                        })
                        this.setScreenToMain(data.data.stream, data.data.id)
                        break

                }
            })
            this.$Ics.conference.addEventListener('participantjoined', (event) => {

                setTimeout(() => {
                    this.getExt_streams('participantjoined') // 更新状态
                }, 1000)

                // 有人加入会议
                this.$refs.chatObj.joinEventHander(event)

                // 监听该人是否退出
                event.participant.addEventListener('left', (e) => {
                    this.leave(e)
                })
            })


            this.$Ics.conference.addEventListener('serverdisconnected', (data) => {
                console.info("服务器断开连接:" + JSON.stringify(data))
                this.getMeetingEnd()
            })
            this.$Ics.conference.addEventListener('streamadded', (event) => {
                // 会议中有新流
                // 如果有人加入 在流对象列表中添加
                this.remoteStreams.push(event.stream)
                this.join_mixed(event.stream.id, () => {
                    // 如果加入成功 则更新状态
                    // this.displayScreen(event.stream)
                    //this.getExt_streams('streamadded_join') // 更新状态
                    // 获取所有流状态 并进行对比
                    this.queryStreams(this.memberList)

                }, () => {
                    console.error("加入流失败")
                })


                event.stream.addEventListener('ended', () => {
                    // 屏幕共享退出后会走这里
                    this.closeScreen(event.stream)
                    //this.getExt_streams('streamadded_ended') // 更新状态
                    for (var i = 0; i < this.remoteStreams.length; i++) {
                        if (this.remoteStreams[i].id === event.stream.id) {
                            this.remoteStreams.splice(i, 1)
                            break
                        }
                    }
                });

                event.stream.addEventListener('updated', (ev) => {
                    console.info("stream updated :" + JSON.stringify(ev))
                });
                if (event.stream.source.video === "screen-cast") {
                    this.screenStreamId = event.stream.id
                    this.setScreenToMain(this.screenStreamId)
                    if (event.stream.source.audio) {
                        this.screen_mac = true
                    }
                }
            })

            // 跟据有没有 win 对象判断是在exe 还是浏览器 从而执行不同的监听
            if (window.win) {
                win.on('close', () => {
                    // 如果本地没有摄像头 则没有 publicationGlobal
                    this.$Ics.publicationGlobal && this.$Ics.publicationGlobal.stop();
                    this.$Ics.conference.leave()
                })
            } else {
                window.onbeforeunload = (event) => {
                    // 离开页面的时候 执行离开方法
                    this.$Ics.publicationGlobal && this.$Ics.publicationGlobal.stop();
                    this.$Ics.conference.leave()
                }
            }

            document.addEventListener('fullscreenchange', this.fullScreenEvent);

            // 设置框添加 滚动监听 改变焦点
            this.$nextTick(this.settingBoxAddevent)
            // 加载本地设备列表
            this.loadLocalMedia()
        },
        closeAllAudio(type) {
            let params = {
                track: "audio"
            }
            let url = '', act = ""
            this.each(this.memberList, (item) => {
                // item.
                if (item.id !== this.userInfo.id) {
                    if (type) {
                        url = `/meeting-control/meetings/${this.params.room}/users/${item.id}/player`
                        act = "player"
                    } else {
                        url = `/meeting-control/meetings/${this.params.room}/users/${item.id}/paused`
                        act = "paused"
                    }

                    this.$http.put(this.basePath + url, params).then(data=>{
						this.sendMediaChange("audio", item.id, act)
					})
                }

            })
        },

        setScreenToMain(stream) {
            setTimeout(() => {
                var streamId = stream;
                var index = 0;
                //默认将屏幕共享设置为第一个画面
                this.$http.put(this.basePath + `/meeting-control/meetings/${this.params.room}/streams/${streamId}/region/${index + 1}`).then(data=>{
					
				})
            }, 1000)
        },
        closeScreen(stream) {
            if (stream.source.video === "screen-cast" || !stream) {
                this.pos_3_i_state = false
                this.pos_3_show = false
                this.screenStreamId = null
                this.screenSubscribe && this.screenSubscribe.stop()
                this.screenSubscribe = null
            }
            console.log('closeScreen.........stream..........')
            if ($('.screen_video').hasClass('pos_1')) {
                $('.pos_3').removeClass('pos_3').addClass('pos_1')
                $('.screen_video').removeClass('pos_1').addClass('pos_3')
            }
            if ($('.screen_video').hasClass('fullScreen')) {
                $('.screen_video').removeClass('fullScreen')
                $('.compound>ul').css({top: 0})
                $('.layoutList').css({
                    height: '100%'
                })
                $('.right>.toolList').css({
                    position: 'absolute',
                    top: 'calc(79% - 1rem)',
                    bottom: 'auto',
                    'z-index': 20
                })
            }
        },
        displayStreamScreen(id) {
            let stream = null
            console.log(stream, this.remoteStreams);
            this.each(this.remoteStreams, (ele) => {
                if (ele.id == id) {
                    stream = ele
                }
            })
            console.log(stream);
            this.$Ics.conference.subscribe(stream, {
                audio: false,
                video: true
            }).then((screenSubscribe) => {
                this.pos_3_show = true
                this.screen_mac = false
                this.showTab = false
                this.screenSubscribe = screenSubscribe
				
				console.log("++++++++++++++++++++++++++++++++++++++++++++++", $('#screen-video'))
				
                $('#screen-video').get(0).srcObject = stream.mediaStream;

                var event = $('.pos_1')
                $('.screen_video').removeClass('pos_3').addClass('pos_1')
                event.removeClass('pos_1').addClass('pos_3')

            });
        },

        displayScreen(stream) {
            if (this.$Ics.screenpubGlobal == null && stream.source.video === "screen-cast") {
                this.$Ics.conference.subscribe(stream, {
                    audio: false,
                    video: true
                }).then((screenSubscribe) => {
                    this.pos_3_show = true
                    this.screen_mac = false

                    this.screenSubscribe = screenSubscribe
                    $('video.screen').get(0).srcObject = stream.mediaStream;

                    var event = $('.pos_1')
                    $('.screen_video').removeClass('pos_3').addClass('pos_1')
                    event.removeClass('pos_1').addClass('pos_3')
                });
            }
        },

        // 手动点击
        scrollDiv(nav) {
            var scrollTop = 0
            if (nav === 0) {
                scrollTop = 0
            } else {
                if (!(this.userInfo && this.userInfo.role !== 'normal')) {
                    scrollTop = 0
                } else if (nav === 1) {
                    scrollTop = 0.7 * this.rem
                } else if (nav === 2) {
                    scrollTop = 2 * this.rem
                } else if (nav === 3) {
                    scrollTop = 3.5 * this.rem
                }
            }
            $('.settingBox>.right').animate({scrollTop}, 200)
        },
        settingBoxAddevent() {
            // 如果没有添加外部流权限 则需要将默认的active 改为0
            if (!(this.userInfo && this.userInfo.role !== 'normal')) {
                this.settingBox.active = 0
            }

            var me = this
            $('.settingBox>.right').scroll(function () {
                if (this.scrollTop < 0.5 * me.rem) {
                    me.settingBox.active = 0
                } else if (this.scrollTop >= 0.5 * me.rem && this.scrollTop < 1 * me.rem) {
                    me.settingBox.active = 1
                } else if (this.scrollTop >= 1 * me.rem && this.scrollTop <= 2 * me.rem) {
                    me.settingBox.active = 2
                } else if (this.scrollTop > 2 * me.rem) {
                    me.settingBox.active = 3
                }
            })
        },
        // 设置屏幕共享声音的开关
        setScreenAudio() {
            console.info(this.pos_3_i_state)
            if (this.pos_3_i_state) {
                this.$Ics.screenpubGlobal.mute('audio')
            } else {
                this.$Ics.screenpubGlobal.unmute('audio')
            }
            this.pos_3_i_state = !this.pos_3_i_state
        },
        // 加载本地媒体设备
        loadLocalMedia() {

            // 获取当前 麦克风 和摄像头
            this.settingBox.mediaSet.affirm = (type) => {
                // 根据当前选择的 video 或者
                this.$Ics.isResolution = true
                this.$Ics.changeDevice(this.settingBox.mediaSet.camera, this.settingBox.mediaSet.mac)
            }

        },

        // 切换tab
        checkNav(navType) {
            this.navType = navType
        },
        // 获取外部流 列表
        getExt_streams(msg) {
			console.log("获取外部流 列表")
            console.info(msg) // 定位什么地方执行的

            this.$http.get(this.basePath + `/meeting-control/meetings/${this.params.room}/ext-streams`).then(data=>{
				    this.ext_streamsList = data.result
				    // 由于后面需要 获取外部流 和 人员列表之后 在获取布局信息进行对比
				    // 所以这里执行链式操作 先获取外部流 在获取成员 列表， 最后对比
					
					console.log("data",data)
					
				    this.getMemberList()
			})

        },
        quitAlert(msg) {
            this.$alert(msg, '提示', {
                confirmButtonText: '确定',
                callback: action => {
                    // 判断是在 网页 还是exe
                    this.quitApp(this)
                }
            })
        },
        // 获取会议是否结束
        getMeetingEnd() {
            this.$http.get(this.basePath + `/meeting-control/rooms/${this.params.room}`, (data) => {
                console.info("会议存在" + JSON.stringify(data))
                this.quitAlert("网络异常，请重试！")
            }, (error) => {
                if (error.code === 404) {
                    console.warn("会议不存在" + JSON.stringify(error))
                    this.quitAlert("会议已结束！")
                } else {
                    console.warn("服务器异常" + JSON.stringify(error))
                    this.quitAlert("网络异常，请重试！")
                }
            })
        },
        // 获取成员列表
        getMemberList() {
            this.$http.get(this.basePath + `/meeting-control/meetings/${this.params.room}/users`).then(data=>{
				{
				    // 将返回的成员列表数组进行处理
				    var sameList = []
				    this.each(data.result, (item) => {
				        this.$set(item, 'media', null) //设置流对象
				        this.$set(item, 'menuShow', false) //设置流对象
				        // 需要实现同一个用户进入把前者挤出去的情况 需要在人员列表中找到和 自己当前 user_id 相同的 用户
				        if (this.userInfo.user_id === item.user) {
				            sameList.push(item)
				        }
				        // 一般情况只有1个 如果已经有人进入 就会超过两个  把超过的全部放在一个数组里面 在对比 自己的id
				
				    })
				    // 判断sameList.长度
				    // 只有在第一次加载列表的时候才执行
				    if (this.firstLoad) {
				        this.firstLoad = false
				        if (sameList.length > 1) {
				            // 如果大于一 说明已经有人上了这个账号
				            // 需要循环去发送 广播消息 然后挂断他
				            this.each(sameList, (item) => {
				                // 排除自己
				                if (item.id !== this.userInfo.id) {
				                    var msg = {
				                        action: 'squeeze',
				                        sender_id: this.userInfo.id,
				                        sender_name: this.userInfo.user_name,
				                        data: {
				                            id: item.id,
				                        }
				                    }
				
				                    this.$Ics.conference.send(JSON.stringify(msg))
				                    this.delete(this.basePath + `/meeting-control/meetings/${this.params.room}/users/${item.id}`, (data) => {
				                    }, (data) => {
				                    })
				                }
				
				            })
				        }
				    }
				
				
				    this.memberList = data.result
				    // 查询头像
				    this.queryHeadImg(this.memberList, 'user', () => {
				        // 获取用户信息成功后获取布局， 因为在布局中 要使用用户名称
				        this.queryLayout()
				    })
				    // 更新管理员
				    this.updateManager()
				
				    // 获取所有流状态 并进行对比
				    this.queryStreams(this.memberList)
				
				}
			}) 
        },
        // 查询当前会议的管理员
        updateManager() {
            // 执行接口 在回调中 使用数据对比结果  匹配的用户 将 role 改为 manager
            if (this.memberList.length !== 0) {
                this.get(this.basePath + `/meeting-control/meetings/${this.params.room}/manger`, (data) => {
                    this.each(this.memberList, (item) => {
                        // 除过房主
                        if (item.role !== 'presenter') {
                            item.role = 'normal'
                            if (item.user === data.result.user_id) { // 如果当前用户的id 和设置的管理员id 相等
                                item.role = 'manager'
                            }
                        }

                    })
                    // 判断 管理员id 是不是自己 如果是自己将userInfo 的role  修改 并储存在sessionStorge中
                    // 否则 将其修改为 normal
                    if (this.userInfo.role !== 'presenter') {
                        if (data.result.user_id === this.userInfo.user_id) {
                            this.userInfo.role = 'manager'
                        } else {
                            this.userInfo.role = 'normal'
                        }
                    }
                    // 重新获取人员列表
//                        this.getMemberList()
                    uni.setStorageSync('userInfo', JSON.stringify(this.userInfo))

                }, (data) => {

                })

            }

        },
        // 切换屏幕
        switchScreen(e) {
            var el = $(e.currentTarget)
            let classList = $('.pos_1').attr('class')
            console.log(classList);
            if (el.is('.compound')) {
                this.each(this.remoteStreams, (ele) => {
                    // console.log(ele.source);
                    if (ele.source.video === "screen-cast" && classList.indexOf('screen_video') > -1) {
                        this.closeScreen(ele)
                        this.showTab = true
                    }
                })
                console.log(this.remoteStreams);
                // this.closeScreen(strem)
            }

            if (!el.is('.pos_1')) {
                if (el.is('.pos_2')) {
                    $('.pos_1').removeClass('pos_1').addClass('pos_2')
                    el.addClass('pos_1').removeClass('pos_2')

                } else if (el.is('.pos_3')) {
                    $('.pos_1').removeClass('pos_1').addClass('pos_3')
                    el.addClass('pos_1').removeClass('pos_3')

                }
            }
            this.isCompound()
        },
        // 获取所有流状态信息 对比传入的list 给其状态赋值
        queryStreams(list) {
            console.log("刷新列表")
            if (list.length !== 0) {
                this.$http.get(this.basePath + `/meeting-control/meetings/${this.params.room}/streams`).then(data=>{
					console.log("获取所有流状态信息 对比传入的list 给其状态赋值",data)
					    this.each(data.result, (stremObj) => {
					
					        for (var i = 0; i < list.length; i++) {
					            if (list[i].id === stremObj.info.owner) {
					
					                if (stremObj.media.video
					                    && stremObj.media.video.source === 'screen-cast') {
					                    continue
					                }
					
					                list[i].media = stremObj.media
					                list[i].stream = stremObj.id
					                this.$forceUpdate()
					                break
					            }
					        }
					    })
					
				})
            }
        },
        // 获取当前在 屏幕中视频的 屏幕布局
        queryLayout() {
            this.get(this.basePath + `/meeting-control/meetings/${this.params.room}/layout`, (data) => {
                // 这里需要根据 数组中的 owner 在成员列表中查询到 对应的 用户id  使用该id 去查询头像
                this.each(data.result, (item) => {
                    // 判断是否是外部流
                    var user_id, user_name, media, user_id_item

                    if (item.owner === 'admin') {
                        user_id_item = this.getItem(this.ext_streamsList, 'id', item.stream).item

                        if (user_id_item) {
                            user_id = 0
                            user_name = user_id_item.info.name
                            media = user_id_item.media
                        }

                    } else {
                        user_id_item = this.getItem(this.memberList, 'id', item.owner).item
                        if (user_id_item) {
                            user_id = user_id_item.user
                            user_name = user_id_item.user_name
                            media = user_id_item.media
                        }
                    }


                    this.$set(item, 'user_id', user_id)
                    this.$set(item, 'user_name', user_name)
                    this.$set(item, 'media', media)


                    this.$set(item, 'style', {
                        left: Number(item.region.area.left) * 100 + '%',
                        top: Number(item.region.area.top) * 100 + '%',
                        width: Number(item.region.area.width) * 100 + '%',
                        height: Number(item.region.area.height) * 100 + '%',
                    })
                    this.$set(item, 'speaking', false)
                })
                // 根据返回的layout  一一对比人员列表 判断当前人员是否在合成画面
                this.each(this.memberList, (item) => {
                    item.isInMixed = false
                    this.each(data.result, (item2) => {
                        if (Number(item.user) === Number(item2.user_id)) {
                            item.isInMixed = true
                            return true
                        }
                    })
                })
                // 根据返回的layout  一一对比外部流列表 判断当前外部流是否在合成画面
                this.each(this.ext_streamsList, (item) => {
                    item.isInMixed = false
                    this.each(data.result, (item2) => {
                        if (item.id === item2.stream) {
                            item.isInMixed = true
                            return true
                        }
                    })
                })


                // 使用列表查询头像 以及名称
                this.layoutList = data.result

            }, (data) => {
            })


        },
        // 操作远端流
        switchStreams(obj, type) {
            var url, params = {
                track: type
            }
            if (obj.media[type].status === 'active') {
                // 关闭
                url = `/meeting-control/meetings/${this.params.room}/users/${obj.id}/paused`

            } else {
                // 开启
                url = `/meeting-control/meetings/${this.params.room}/users/${obj.id}/player`

            }
            this.$http.put(this.basePath + url, params).then(data=>{
				
				    // this.sendLayoutChange()
				    let act = ""
				    if (obj.media[type].status === 'active') {
				        act = "paused"
				    } else {
				        act = "player"
				    }
				    this.sendMediaChange(type, obj.id, act)
				
			})

        },
        // 获取元素相对于可视区域左上角的横/纵 坐标
        getPos(e, pos) {
            var offset = e['offset' + pos]
            if (e.offsetParent != null) {
                offset += this.getPos(e.offsetParent, pos);
            }
            return offset
        },
        // 以下为屏幕拖拽排序相关事件
        // 外部流拖拽开始
        stream_dragstart(e, obj, index) {
            var elem = e.currentTarget
            // 将当前 obj 对象转为json  保存下来
            e.dataTransfer.setData('data', JSON.stringify({obj, index}))
            this.drageType = 'stream'
            setTimeout(() => {
                $(elem).css({
                    opacity: 0.7,
                    background: 'rgba(17,148,246,.1)'
                })
            }, 1)

            // 拖放结束后执行  将 tosm 和  draggable 重置
            elem.ondragend = (ev) => {

                $(elem).css({
                    opacity: 1,
                    background: '#fff'
                })
            }
        },
        // 人员拖拽开始
        user_dragstart(e, obj, index) {
            var elem = e.currentTarget
            // 将当前 obj 对象转为json  保存下来
            e.dataTransfer.setData('data', JSON.stringify({obj, index}))
            this.drageType = 'user'
            setTimeout(() => {
                $(elem).css({
                    opacity: 0.7,
                    background: 'rgba(17,148,246,.1)'
                })
            }, 1)

            // 拖放结束后执行  将 tosm 和  draggable 重置
            elem.ondragend = (ev) => {

                $(elem).css({
                    opacity: 1,
                    background: '#fff'
                })
            }


        },
        // 屏幕拖拽开始
        screen_dragstart(e, obj, index) {
            var elem = e.currentTarget

            // 将当前 obj 对象转为json  保存下来
            e.dataTransfer.setData('data', JSON.stringify({obj, index, elem_id: $(elem).attr('id')}))
            this.drageType = 'screen'
            $(elem).css({
                background: '#999',
            }).addClass('active')
            setTimeout(() => {
                $(elem).css({opacity: 0})
            }, 1)
            setTimeout(() => {
                $(elem).css({opacity: 1, zIndex: -1})
            }, 1)
            // 为了达到好的显示效果， 在拖动开始的时候 该元素 ， 浮动为fixed

            // 获取当前鼠标 针对 li 左上角的位置
            var mouseDownX, initX, mouseDownY, initY
            mouseDownX = e.pageX;
            mouseDownY = e.pageY;
            //初始位置的X，Y 坐标
            initX = elem.offsetLeft
            initY = elem.offsetTop

            // 拖放中
            elem.ondrag = (ev) => {
                var mouseMoveX = ev.pageX
                var mouseMoveY = ev.pageY
                var left = parseInt(mouseMoveX) - parseInt(mouseDownX) + parseInt(initX)
                var top = parseInt(mouseMoveY) - parseInt(mouseDownY) + parseInt(initY)

                $(elem).css({left, top})
            }

            // 拖放结束后执行  将 tosm 和  draggable 重置
            elem.ondragend = (ev) => {
                $(elem).removeClass('active')
                $(elem).css({
                    background: 'transparent',
                    left: obj.style.left,
                    top: obj.style.top,
                    zIndex: 1
                })
            }
        },
        // 被拖拽目标离开
        screen_dragleave(e) {
            var elem = e.currentTarget
            $(elem).removeClass('active')

            e.preventDefault()

        },
        // 被拖拽目标进入
        screen_dragover(e) {
            var elem = e.currentTarget
            $(elem).addClass('active')
            e.preventDefault()

        },
        // 大屏幕被拖拽目标释放
        out_screen_drop(e) {
            // 判断当前用户 是不是没有加入合成
            var elem = e.currentTarget
            $(elem).removeClass('active')
            var drageData = e.dataTransfer.getData('data')
            try {
                drageData = JSON.parse(drageData)
            } catch (e) {
            }
            if (drageData.obj.isInMixed) { // 如果 已经在合成 就return
                return
            }
            // 如果是拖拽屏幕过来的 也return
            if (this.drageType === 'screen') {
                return
            }
            // 由于人员和 外部流 加入进来执行的方法逻辑是一直的 但是 外部流中流id 键名为 id 不是stream 所以这里统一下
            var streamId
            if (this.drageType === 'user') {
                streamId = drageData.obj.stream
            } else if (this.drageType === 'stream') {
                streamId = drageData.obj.id
            }

            this.$http.put(this.basePath + `/meeting-control/meetings/${this.params.room}/streams/${streamId}/mixed`).then(data=>{
				
			})
        },
        change_stream(streamId, index) {
            // 1. 将当前被拖拽人员 加入合成
            this.$http.put(this.basePath + `/meeting-control/meetings/${this.params.room}/streams/${streamId}/mixed`).then(data=>{
		
				    // 2. 替换位置
				    this.$http.put(this.basePath + `/meeting-control/meetings/${this.params.room}/streams/${streamId}/region/${index + 1}`).then(data=>{
						
					})
				
			
			})
        },


        change_screen(oldId, streamId, index) {


            if (oldId) {
                // 1.移除老的
                this.$http.put(this.basePath + `/meeting-control/meetings/${this.params.room}/streams/${oldId}/unmixed`).then(data=>{
					
					this.change_stream(streamId)
					
				})
            } else {
                this.change_stream(streamId, index)
            }
        },
        // 小屏幕被拖拽目标释放
        screen_drop(e, obj, index) {
            var elem = e.currentTarget

            $(elem).removeClass('active')
            var drageData = e.dataTransfer.getData('data')
            try {
                drageData = JSON.parse(drageData)
            } catch (e) {
            }
            if (drageData.elem_id === $(elem).attr('id')) { // 如果目标和原对象是一个 则return
                return
            }

            if (this.drageType === 'screen') {
                // 发送请求， 将某个人的id (drageData里面的人员id) 替换到某个位置（当前的index + 1）
                this.$http.put(this.basePath + `/meeting-control/meetings/${this.params.room}/streams/${drageData.obj.stream}/region/${index + 1}`, {}).then(data=>{
					
				})
            } else {
                // 由于人员和 外部流 加入进来执行的方法逻辑是一直的 但是 外部流中流id 键名为 id 不是stream 所以这里统一下
                var streamId
                if (this.drageType === 'user') {
                    streamId = drageData.obj.stream
                } else if (this.drageType === 'stream') {
                    streamId = drageData.obj.id
                }
                // 如果是从用户列表拖进来的  则需要执行三步
                var oldId = obj.stream
                //this.change_screen(oldId, streamId, index)
                this.change_stream(streamId, index)
            }


        },
        quite_screen(stream) {
            this.$http.put(this.basePath + `/meeting-control/meetings/${this.params.room}/streams/${stream}/unmixed`, {}).then(data=>{
				this.isQuiteScreen = false
			})
        },
        open_screen(stream) {
            this.$http.put(this.basePath + `/meeting-control/meetings/${this.params.room}/streams/${stream}/mixed`, {}).then(data=>{
				this.isQuiteScreen = true
				this.setScreenToMain(stream)
			})
        },
        // 退出合成
        exit_mixed(stream) {
            this.$http.put(this.basePath + `/meeting-control/meetings/${this.params.room}/streams/${stream}/unmixed`, {},).then(data=>{
				
			})

        },
        // 加入合成
        join_mixed(stream, cabSucc, cabError) {

            this.$http.put(this.basePath + `/meeting-control/meetings/${this.params.room}/streams/${stream}/mixed`, {},).then(data=>{
				cabSucc && cabSucc()
			})
        },
        // 关闭菜单
        closeMenu() {
            this.each(this.memberList, (item) => {
                item.menuShow = false
            })
        },
        // 打开菜单
        openMenu(item) {
            this.closeMenu()
            item.menuShow = !item.menuShow
        },
        // 删除外部流
        del_ext_stream(id) {
            this.$refs.confirmObj.confirm('确认删除该外部流？', '提示', () => {

                this.delete(this.basePath + `/meeting-control/meetings/${this.params.room}/streaming-ins/${id}`, (data) => {
                    //this.sendLayoutChange()
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
        // 挂断用户
        hangUp(obj) {
            this.$refs.confirmObj.confirm('确认挂断该成员？', '提示', () => {

                // 先发送信息 在进行挂断  如果直接挂断 被挂断方就无法获取到挂断信息， 从而得不到提示
                // 只需刷新状态 在成功回调中提醒所有人刷新就行

                var msg = {
                    action: 'hangup',
                    sender_id: this.userInfo.user_id,
                    sender_name: this.userInfo.user_name,
                    data: {
                        id: obj.id,
                        user_name: obj.user_name
                    }
                }
                this.$Ics.conference.send(JSON.stringify(msg))

                this.delete(this.basePath + `/meeting-control/meetings/${this.params.room}/users/${obj.id}`, (data) => {
                    // this.sendLayoutChange()


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
        sendScreenChange() {
            var msg = {
                action: 'closeScreen',
                sender_id: this.userInfo.id,
                data: {}
            }
            this.$Ics.conference.send(JSON.stringify(msg))
        },
        // 广播 layout 变化信息
        sendLayoutChange() {
            var msg = {
                action: 'layoutChange',
                sender_id: this.userInfo.id,
                data: {}
            }
            this.$Ics.conference.send(JSON.stringify(msg))

        },
        sendOpLog(id, message) {
            var msg = {
                action: 'log',
                user_id: id,
                msg: '[' + this.$refs.chatObj.getTime() + '] ' + message
            }
            this.$Ics.conference.send(JSON.stringify(msg))
        },
        sendMediaChange(type, id, act) {
            console.log(type, id, act);
            var msg = {
                action: type,
                user_id: id,
                act: act,
                data: {}
            }
            this.$Ics.conference.send(JSON.stringify(msg))

        },

        // 打开设置弹框
        openSettingBox() {
            this.settingBox.show = true
            this.settingBox.addExt_streams.name = ''
            this.settingBox.addExt_streams.url = ''
            this.settingBox.addExt_streams.type = 'all'
            this.settingBox.addExt_streams.affirm = () => {
//                    rtmp://192.168.1.201/live/1
                if (!this.settingBox.addExt_streams.name) {
                    this.$message({
                        message: '请填写拉流名称！',
                        duration: 1000,
                        type: 'warning'
                    })
                    return
                } else if (!this.settingBox.addExt_streams.url) {
                    this.$message({
                        message: '请填写拉流地址！',
                        duration: 1000,
                        type: 'warning'
                    })
                    return
                }
                var loading = this.$loading({
                    lock: true,
                    text: '保存中...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                })
                var media = {}
                if (this.settingBox.addExt_streams.type === 'all') {
                    media = {
                        audio: 'auto',
                        video: 'auto',
                    }
                } else if (this.settingBox.addExt_streams.type === 'video') {
                    media = {
                        audio: false,
                        video: 'auto',
                    }
                }
                var params = {
                    url: this.settingBox.addExt_streams.url,
                    name: this.settingBox.addExt_streams.name,
                    media
                }

                this.post(this.basePath + `/meeting-control/meetings/${this.params.room}/streaming-ins`, params, (data) => {
                    this.settingBox.show = false
                    //this.sendLayoutChange()
                    loading.close()
                }, (data) => {
                    loading.close()
                    if (data.code === 425) {
                        this.$message({
                            message: '添加失败！ 该流已经存在！',
                            duration: 1000,
                            type: 'error'
                        })
                    } else {
                        this.$message({
                            message: '添加失败！',
                            duration: 1000,
                            type: 'error'
                        })
                    }
                })
            }

            // 赋值设备列表
            this.settingBox.mediaSet.mac_list = this.$Ics.media.mac_list
            this.settingBox.mediaSet.camera_list = this.$Ics.media.camera_list
            console.info(this.settingBox.mediaSet)
            if (this.$Ics.audioConstraintsForMic != undefined) {
                this.settingBox.mediaSet.mac = this.$Ics.audioConstraintsForMic.deviceId;
            }

            if (this.$Ics.videoConstraintsForCamera != undefined) {
                this.settingBox.mediaSet.camera = this.$Ics.videoConstraintsForCamera.deviceId;
            }


            // 布局方面
            // 查询布局
            this.get(this.basePath + `/meeting-control/meetings/${this.params.room}/layouttype`, (data) => {
                this.settingBox.layoutType = data.result.layout_type
            }, (data) => {

            })


            // 设置布局
            this.settingBox.setLayoutType = (type) => {
                console.info(type)
                var params = {
                    type
                }
                this.$http.put(this.basePath + `/meeting-control/meetings/${this.params.room}/layout`, params).then(data =>{
					this.settingBox.layoutType = type
				})
            }

            //推流地址查询
            this.$http.get(this.basePath + `/meeting-control/meetings/${this.params.room}/streaming-outs`).then(data=>{
				this.settingBox.live_streams.url = data.result[0].url
			})

            //直播推流
            this.settingBox.live_streams.affirm = () => {
                if (!this.settingBox.live_streams.url) {
                    this.$message({
                        message: '请填写推流地址！',
                        duration: 1000,
                        type: 'warning'
                    })
                    return
                }

                let loading = this.$loading({
                    lock: true,
                    text: '推流中...',
                    spinner: 'el-icon-loading',
                    background: 'rgba(0, 0, 0, 0.7)'
                })

                var params = {
                    url: this.settingBox.live_streams.url
                }

                this.post(this.basePath + `/meeting-control/meetings/${this.params.room}/streaming-outs`, params, (data) => {
                    this.settingBox.show = false
                    loading.close()
                }, (data) => {
                    loading.close()
                    if (data.code === 422) {
                        this.$message({
                            message: '推流地址已重复！',
                            duration: 1000,
                            type: 'warning'
                        })
                    } else {
                        this.$message({
                            message: '添加失败！',
                            duration: 1000,
                            type: 'error'
                        })
                    }
                })
            }
        },

        // 点名发言
        rollCall(obj) {
            // 如果isDel === true 则认为是取消（删除）管理员， 因为 管理员只存在一个
            /*this.$refs.confirmObj.confirm(msg, '提示', () => {
                // 发送请求 更新管理员  使用put 请求修改 不管是删除 还是修改
            })*/
            // return
            let msg = {
                action: 'rollCall',
                sender_id: this.userInfo.id,
                data: {
                    id: obj.id,
                    stream: obj.stream
                }
            }
            if (obj.media.audio.status === 'inactive') {
                this.switchStreams(obj, 'audio')
            }

            this.$Ics.conference.send(JSON.stringify(msg))
            let info = '被点名发言'
            this.sendOpLog(obj.user, info)
        },

        // 设置管理员
        setManager(obj, isDel) {
            // 如果isDel === true 则认为是取消（删除）管理员， 因为 管理员只存在一个
            var msg = ''
            if (isDel) {
                msg = `确认取消${obj.user_name}的管理员资格？`
            } else {
                msg = `确认将${obj.user_name}设为管理员？`
            }

            this.$refs.confirmObj.confirm(msg, '提示', () => {
                // 发送请求 更新管理员  使用put 请求修改 不管是删除 还是修改
                var params = {
                    user_id: isDel ? '' : obj.user
                }
                this.$http.put(this.basePath + `/meeting-control/meetings/${this.params.room}/manger`, params).then(data=> {
                    // 在成功回调里面 广播消息  其他成员收到消息后 更新管理员 接口 查询管理员从而更新人员列表数据
                    var msg = {
                        action: 'manageChange',
                        sender_id: this.userInfo.id,
                        data: {
                            id: obj.user,
                            type: isDel
                        }
                    }
                    this.$Ics.conference.send(JSON.stringify(msg))

                })


            })
        },

        unique(arr) {
            var hash = [];
            for (var i = 0; i < arr.length; i++) {
                if (arr.indexOf(arr[i]) == arr.lastIndexOf(arr[i])) {
                    hash.push(arr[i]);
                }
            }
            return hash;
        },
        // 加载清晰度列表
        loadResolutions(remoteStreams) {
            this.remoteStreams = remoteStreams

            this.each(remoteStreams, (item) => {
                // 当前流列表中 根据以下条件获取到 位移的一个合成流
                if (item.source.audio === 'mixed' || item.source.video === 'mixed') {
                    this.resolutions.stream = item
                    this.resolutions.list = item.extraCapabilities.video.resolutions
                    for (const videoSetting of item.settings.video) {
                        const resolution = videoSetting.resolution;
                        if (resolution) {
                            this.resolutions.list.push(resolution)
                        }
                    }

                    this.resolutions.list = this.unique(this.resolutions.list)
                    // 默认显示分辨率列表中 最大的 (最后一个)
                    var resolution = this.resolutions.list[this.resolutions.list.length - 2]
                    this.subscribe(resolution, this.resolutions.list.length - 2, (subscription) => {
                    })
                    // 监听 合成画面中的activeaudioinputchange  从而判断当前哪个用户在说话
                    this.activeaudioinputchange()
                } else {

                    if (item.source.video === 'screen-cast') {
                        console.info("screen-cast:" + JSON.stringify(item))
                        // this.displayScreen(item)
                    }
                }
            })
        },
        // 监听流变化信息， 从而判断当前哪个用户在说话
        activeaudioinputchange() {
            this.resolutions.stream.addEventListener('activeaudioinputchange', (e) => {
                // 如果检测到有人说话 则设置 layoutList 的speaking  为false 当前这个流的人 为true
                this.each(this.layoutList, (item) => {

                    if (item.stream === e.activeAudioInputStreamId) {
                        item.speaking = true
                    } else {
                        item.speaking = false
                    }
                })
            })
            // 监听布局发生变化
            this.resolutions.stream.addEventListener('layoutchange', (e) => {

                this.getExt_streams('layoutChange') // 更新状态
                if (this.backBtn == true)
                    this.reduce()
            })
        },

        // 打开清晰度列表
        openResolutions() {
            if (this.resolutions.show === true) {
                this.closeResolutions()
            } else {
                this.resolutions.show = true
            }
            this.resolutions.affirm = (resolution, index) => {
                // 切换清晰度
                if (this.resolutions.subscriptionForMixedStream) {
                    this.resolutions.subscriptionForMixedStream.stop();
                    this.resolutions.subscriptionForMixedStream = null
                }
                this.subscribe(resolution, index, () => {
                    this.resolutions.show = false
                })
            }
        },
        // subscribe 加载视频
        subscribe(resolution, index, cab) {

            const videoOptions = {};
            videoOptions.resolution = resolution;
            this.$Ics.conference.subscribe(this.resolutions.stream, {
                audio: true,
                video: videoOptions
            }).then((subscription) => {
                cab && cab(subscription)
                this.resolutions.active = index
                this.resolutions.subscriptionForMixedStream = subscription;
				console.log("+___________________________",$('#picture'))
				$('#picture').get(0).srcObject = this.resolutions.stream.mediaStream;
                
            });
        },
        // 关闭清晰度列表
        closeResolutions() {
            this.resolutions.show = false
        },
        // 打开音量弹框
        openVolumeBox() {
            var videoDom = $('.compound video')[0]
            if (this.volumeBox.show === true) {
                this.closeVolumeBox()
            } else {
                this.volumeBox.show = true
            }
            this.volumeBox.change = () => {
                videoDom.volume = this.volumeBox.volume
                this.volumeBox.show = false
            }

        },
        // 关闭音量弹框
        closeVolumeBox() {
            this.volumeBox.show = false

        },
        // 判断当前屏幕是否是合成画面
        isCompound() {
            var el = $('.pos_1')
            this.toolsShow = el.is('.compound')
        },
        // 全屏
        fullScreen() {
            var el = $('.pos_1')
            var de;
            if (!this.isFullScreen) {

                de = document.documentElement;
                if (de.requestFullscreen) {
                    de.requestFullscreen()
                } else if (de.webkitRequestFullScreen) {
                    de.webkitRequestFullScreen()
                }
            } else {
                de = document;
                if (de.exitFullscreen) {
                    de.exitFullscreen();
                } else if (de.webkitCancelFullScreen) {
                    de.webkitCancelFullScreen();
                }
            }


        },
        pictureFun() {
            this.pictureFn()
        },
        // 全屏改变事键
        fullScreenEvent() {
            var el = $('.pos_1')
            this.isFullScreen = document.fullscreenElement || document.webkitFullscreenElement || false;
            if (this.isFullScreen) {
                el.addClass('fullScreen');
                setTimeout(() => {
                    var bw = document.body.clientWidth
                    var bh = document.body.clientHeight
                    // 根据宽度 16: 9 算出ul高度
                    var ulH = bw * (9 / 16)
                    var top = (bh - ulH) / 2
                    $('.compound>ul').css({top})
                    $('.layoutList').css({
                        height: ulH
                    })
                }, 10)
                $('.right>.toolList').css({
                    position: 'fixed',
                    top: 'auto',
                    bottom: '0.5rem',
                    'z-index': 9999
                })

            } else {
                el.removeClass('fullScreen')
                $('.compound>ul').css({top: 0})
                $('.layoutList').css({
                    height: '100%'
                })
                $('.right>.toolList').css({
                    position: 'absolute',
                    top: 'calc(79% - 1rem)',
                    bottom: 'auto',
                    'z-index': 20
                })
            }
        },
        // 双击放大当前画面
        amplifyVideo(obj) {
            // 如果点击的是自己的 直接退出
            //暂时屏蔽双击放大功能
            return
            if (obj.owner === this.userInfo.id) {
                return
            }
            // 根据当前obj 的 stream id 去 remoteStreams 中赵 stream 对象
            this.each(this.remoteStreams, (item) => {
                if (item.id === obj.stream) {
                    this.resolutions.stream = item
                    return true
                }
            })
            // 拿到对象后  subscriptionForMixedStream.stop
            this.resolutions.subscriptionForMixedStream && this.resolutions.subscriptionForMixedStream.stop()

            // 然后利用对象 加载该画面
            // 判断外部流还是用户 从而精确判断 其media 中 video 和 audio 的开启关闭状态 在 subscribe 的时候进行设置
            var audio, video
            if (obj.owner === 'admin') {
                // 外部流的判断方式 和用户不一样
                audio = !!obj.media.audio
                video = obj.media.video ? this.resolutions.list[this.resolutions.active] : false
            } else {
                audio = obj.media.audio.status === 'active'
                video = obj.media.video.status === 'active' ? this.resolutions.list[this.resolutions.active] : false
            }

            this.$Ics.conference.subscribe(this.resolutions.stream, {
                audio,
                video
            }).then((subscription) => {
                this.resolutions.subscriptionForMixedStream = subscription;
                $('video.remote').get(0).srcObject = this.resolutions.stream.mediaStream;
            });

            this.toolsShow = false
            this.backBtn = true
        },
        // 点击缩小当前放大的 画面
        reduce() {
            this.each(this.remoteStreams, (item) => {
                // 当前流列表中 根据以下条件获取到 位移的一个合成流
                if (item.source.audio === 'mixed' || item.source.video === 'mixed') {
                    this.resolutions.stream = item
                    this.resolutions.subscriptionForMixedStream && this.resolutions.subscriptionForMixedStream.stop()

                    // 然后利用对象 加载该画面
                    this.$Ics.conference.subscribe(this.resolutions.stream, {
                        audio: true,
                        video: this.resolutions.list[this.resolutions.active]
                    }).then((subscription) => {
                        this.resolutions.subscriptionForMixedStream = subscription;
                        $('video.remote').get(0).srcObject = this.resolutions.stream.mediaStream;
                    });
                }

            })

            this.toolsShow = true
            this.backBtn = false
        }

    }
}
</script>

<style scoped lang="less" type="text/less">
#main {
    & > .left {
        width: 5rem;
        height: 100%;
        float: left;

        & > .participant {
            width: 100%;
            height: 2.5rem;
            border-bottom: 1px solid #eee;

            & > .title {
                width: 100%;
                height: 0.4rem;
                text-align: center;
                font-size: 0.2rem;

                & > .nav_item {
                    float: left;
                    width: 50%;
                    height: 0.4rem;
                    line-height: 0.4rem;
                    border: 1px solid #eee;
                    border-top: none;
                    border-left: none;
                    cursor: pointer;
                }

                & > .nav_item:last-child {
                    border-right: none;
                }

                & > .nav_item.active {
                    border-bottom: none;
                    color: #1194f6;
                }
            }

            & > .streamList {
                padding: 0.1rem 0 0 0.1rem;
                height: calc(100% - 0.4rem);
                overflow-y: auto;

                & > li {
                    width: 4.8rem;
                    height: 0.35rem;
                    margin-bottom: 0.1rem;

                    & > div {
                        float: left;
                    }

                    & > .name {
                        width: 2rem;
                        height: 0.35rem;
                        line-height: 0.35rem;
                    }

                    & > .tools {
                        float: right;
                        width: auto;
                        height: 0.35rem;
                        line-height: 0.35rem;

                        .iconfont {
                            font-size: 0.28rem;
                            margin-right: 0.2rem;
                            color: #999;
                            cursor: pointer;
                        }

                        .iconfont.active {
                            color: #2397F3;
                        }
                    }
                }
            }

            & > .userList {
                padding: 0.1rem 0 0 0.1rem;
                height: calc(100% - 0.4rem);
                overflow-y: auto;

                & > li {
                    width: 100%;
                    height: 0.35rem;
                    margin-bottom: 0.1rem;
                    background: #fff;
                    display: flex;

                    & > div {
                        width: 50%;
                        display: flex;
                        align-items: center;
                        flex-wrap: nowrap;
                    }

                    & > .info {
                        justify-content: flex-start;
                        height: 100%;

                        & > .head_img {
                            width: 0.35rem;
                            height: 0.35rem;
                            border-radius: 50%;
                            overflow: hidden;
                            margin-right: 0.1rem;
                            float: left;

                            img {
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                            }
                        }

                        & > p {
                            width: 1.5rem;
                            height: 0.35rem;
                            line-height: 0.35rem;
                            font-size: 0.14rem;
                            display: flex;
                            align-items: center;
                            flex-wrap: nowrap;

                            & > span {
                                display: inline-block;
                                max-width: calc(100% - 0.25rem);
                                overflow: hidden;
                                text-overflow: ellipsis;
                                white-space: nowrap;
                                vertical-align: middle;
                            }

                            & > svg {
                                width: 0.18rem;
                                height: 0.18rem;
                                margin: 0 0.01rem;
                                vertical-align: middle;
                            }
                        }
                    }

                    & > .tools {
                        justify-content: flex-end;
                        height: 0.35rem;
                        line-height: 0.35rem;

                        .iconfont {
                            font-size: 0.3rem;
                            margin-right: 0.2rem;
                            color: #999;
                            cursor: pointer;
                        }

                        .iconfont.active {
                            color: #2397F3;
                        }

                        & > .setting {
                            position: relative;
                            display: inline-block;

                            & > i {
                                font-size: 0.4rem;
                                color: #2397F3;
                                cursor: pointer;
                            }

                            & > ul {
                                width: 1.4rem;
                                height: auto;
                                padding: 0.1rem;
                                border-radius: 0.05rem;
                                border: 1px solid #aaa;
                                background: #fff;
                                position: absolute;
                                color: #4c4c4c;
                                font-size: 0.2rem;
                                top: 0.35rem;
                                left: -0.7rem;
                                z-index: 11;

                                li {
                                    width: 100%;
                                    height: 0.5rem;
                                    margin-bottom: 0.05rem;
                                    line-height: 0.5rem;
                                    text-align: left;
                                }

                                li:hover {
                                    background: #1194f6;
                                    color: #fff;
                                }

                                li:last-child {
                                    margin-bottom: 0;
                                }
                            }
                        }
                    }
                }
            }
        }

        & > .chat {
            width: 100%;
            height: calc(100% - 2.5rem);

            & > .title {
                width: 100%;
                height: 0.4rem;
                line-height: 0.4rem;
                border-bottom: 1px solid #eee;
                text-align: center;
                font-size: 0.2rem;
            }

            & > .chat-content {
                width: 100%;
                height: calc(100% - 0.4rem);
            }
            & > .chatInfo{
                height: calc(100% - 0.2rem)!important;
            }
        }
    }

    & > .right {
        width: calc(100% - 5rem);
        height: 100%;
        float: left;
        position: relative;

        /*工具按钮栏 */

        & > .toolList {
            width: auto;
            height: 0.8rem;
            position: absolute;
            top: calc(79% - 1rem);
            right: 0.2rem;
            z-index: 20;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 0.2rem;
            padding: 0.05rem;

            & > div {
                float: left;
                line-height: 0.8rem;
                margin-right: 0.2rem;

                & > i {
                    font-size: 0.5rem;
                    color: #fff;
                    vertical-align: top;
                    cursor: pointer;
                }

                & > i:hover {
                    color: #1194f6;
                }
            }

            & > .resolution {
                position: relative;
                width: auto;
                text-align: center;
                height: 0.5rem;

                .btn:hover {
                    background: rgba(17, 148, 246, .7);
                }

                .btn {
                    display: inline-block;
                    height: 0.3rem;
                    line-height: 0.3rem;
                    border-radius: 0.15rem;
                    padding: 0 0.1rem;
                    color: #fff;
                    background: rgba(255, 255, 255, .4);
                    cursor: pointer;
                }

                & > ul {
                    width: 1.2rem;
                    height: auto;
                    padding: 0.1rem 0;
                    position: absolute;
                    bottom: 0.45rem;
                    left: -0.1rem;
                    background: rgba(255, 255, 255, .3);
                    color: #fff;
                    border-radius: 0.05rem;

                    & > li {
                        width: 100%;
                        height: 0.6rem;
                        line-height: 0.6rem;
                        text-align: center;

                        & > .btn:hover, & > .btn.active {
                            background: rgba(17, 148, 246, .7);
                        }
                    }
                }
            }

            & > .volume {
                position: relative;
                width: auto;
                height: 0.3rem;

                & > div {
                    width: 0.6rem;
                    height: auto;
                    position: absolute;
                    bottom: 0.45rem;
                    left: -0.15rem;
                    background: rgba(255, 255, 255, .3);
                    color: #fff;
                    border-radius: 0.05rem;
                    padding: 0.15rem 0;
                }
            }
        }


        & > .videoContainer {
            background: #111;
            position: absolute;
            z-index: 1;
            transition: all .3s;
        }

        & > .compound.compound > i {
            position: absolute;
            z-index: 30;
            top: 0.2rem;
            right: 0.2rem;
            color: #fff;
            font-size: 0.34rem;
            cursor: pointer;
            -webkit-text-fill-color: #fff;
            -webkit-text-stroke: 1px #333;
        }

        & > .compound.compound > i:hover {
            -webkit-text-fill-color: #1194f6;
            -webkit-text-stroke: 1px #fff;
        }

        & > .compound:not(.pos_1) > .layoutList {
            display: none;
        }

        & > .compound > .layoutList.active {
            border-color: #fff;
        }

        & > .compound > .layoutList {
            border: 1px solid transparent;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;

            & > li.active {
                border-color: #fff;
            }

            & > li {
                border: 1px solid transparent;
                position: absolute;

                & > .screenStream {
                    position: absolute;
                    top: 0.2rem;
                    right: 0.2rem;
                    font-size: 0.25rem;
                    color: #1194F6;
                }


                & > .name {
                    position: absolute;
                    top: 0.2rem;
                    left: 0.2rem;


                    & > span {
                        font-size: 0.2rem;
                        font-weight: bold;
                        color: #fff;
                        text-shadow: 0 0 0.05rem #333;
                    }
                }
            }
        }

        & > .pos_1 {
            top: 0;
            left: 0;
            width: 100%;
            height: 79%;

            & > video {
                width: 100%;
                height: 100%;
            }
        }

        & > .pos_2 {
            top: 80%;
            left: 0.1rem;
            width: auto;
            height: 19%;

            & > video {
                height: 100%;
            }
        }

        & > .pos_3 {
            top: 80%;
            right: 0.1rem;
            width: auto;
            height: 19%;

            & > i {
                position: absolute;
                font-size: 0.25rem;
                color: #1194f6;
                z-index: 10;
                cursor: pointer;
                width: 0.25rem;
                height: 0.25rem;
                background: rgba(0, 0, 0, .5);
                border-radius: 50%;
                text-align: center;
                line-height: 0.25rem;
            }

            & > video {
                height: 100%;
            }
        }

        & > .aboutVideo {
            width: 100%;
            height: calc(100% - 6.59rem);
            background: #f6f6f6;
            border-left: 1px solid #eee;
            padding: 0.1rem 0.1rem 0;
            position: absolute;
            left: 0;
            bottom: 0;

            & > div {
                width: auto;
                height: 100%;
                margin-right: 0;
                display: inline-block;
                background: #111;

                & > video {
                    height: 100%;
                }
            }
        }
    }


}


.settingBox {
    width: 9rem;
    height: 6rem;
    padding: 0.2rem 0.4rem;

    & > .left {
        float: left;
        height: 100%;
        width: 1.5rem;
        position: relative;
        margin-right: 0.2rem;

        & > ul {
            width: 100%;
            height: auto;

            li {
                width: 100%;
                text-align: right;
                height: 0.4rem;
                line-height: 0.4rem;
                position: relative;
                padding-right: 0.3rem;
                font-size: 0.14rem;
                cursor: pointer;
            }

            li.active {
                color: #1194f6;
            }

            li.active:after {
                display: inline-block;
            }

            li:after {
                content: '';
                position: absolute;
                width: 0.1rem;
                height: 0.1rem;
                border-radius: 50%;
                background: #1194f6;
                top: 0.15rem;
                right: -0.05rem;
                z-index: 1;
                display: none;
            }
        }
    }

    & > .left:after {
        content: '';
        position: absolute;
        top: 0.2rem;
        right: 0;
        width: 0;
        height: calc(100% - 0.4rem);
        border-right: 1px solid #ddd;
    }

    & > .right {
        float: left;
        height: 100%;
        width: calc(100% - 1.7rem);
        overflow-y: auto;

        & > ul {
            width: 100%;
            height: auto;

            li {
                width: 100%;
                padding: 0.1rem 0;
                border-bottom: 1px solid #ddd;


                & > .title {
                    width: 100%;
                    height: 0.4rem;
                    line-height: 0.4rem;
                    font-size: 0.16rem;

                    & > .btn {
                        float: right;
                        height: 0.4rem;
                        line-height: 0.4rem;
                        color: #1194f6;
                        cursor: pointer;
                        font-size: 0.14rem;
                    }
                }

                & > .content {
                    width: 100%;

                    & > .item {
                        width: 100%;
                        min-height: 0.8rem;
                        line-height: 0.8rem;
                        margin-bottom: 0.2rem;

                        & > .info {
                            display: inline-block;
                            vertical-align: top;
                            width: 4rem;

                            & > video {
                                width: 3.2rem;
                                height: 1.8rem;
                            }
                        }

                        & > label:not(.el-radio) {
                            width: 1rem;
                            text-align: right;
                            margin-right: 0.3rem;
                            display: inline-block;
                        }

                        & > input[type='text'].u-com {
                            width: 2.5rem;
                            height: 0.4rem;
                            line-height: 0.4rem;
                            font-size: 0.14rem;
                        }

                        & > input[type='text'].u-com.address {
                            width: 4.1rem;
                        }
                    }
                }
            }

            & > li.layoutSet {

                .content {
                    padding-left: 30px;
                    margin: 0.1rem 0 0.3rem;

                    & > div {
                        width: 1.2rem;
                        height: 0.68rem;
                        margin-right: 0.2rem;
                        float: left;
                        cursor: pointer;
                        border: 2px solid transparent;
                        margin-bottom: 0.2rem;
                    }

                    & > div:hover, & > div.active {
                        border-color: #1194f6;
                    }

                    & > div > div {
                        width: 100%;
                        height: 100%;
                    }

                    .s1 > div {
                        background: url('@/assets/images/1.png');
                        background-size: 100% 100%;
                    }

                    .s2 > div {
                        background: url('@/assets/images/2.png');
                        background-size: 100% 100%;
                    }

                    .s_two > div {
                        background: url('@/assets/images/two.png');
                        background-size: 100% 100%;
                    }

                    .s3 > div {
                        background: url('@/assets/images/3.png');
                        background-size: 100% 100%;
                    }

                    .s4 > div {
                        background: url('@/assets/images/4.png');
                        background-size: 100% 100%;
                    }

                    .s6 > div {
                        background: url('@/assets/images/6.png');
                        background-size: 100% 100%;
                    }

                    .s9 > div {
                        background: url('@/assets/images/9.png');
                        background-size: 100% 100%;
                    }

                    .s16 > div {
                        background: url('@/assets/images/16.png');
                        background-size: 100% 100%;
                    }
                }
            }
        }
    }
}

.not-allowed {
    cursor: not-allowed !important;
}

.fullScreen {
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    min-width: 0px;
    max-width: none;
    min-height: 0px;
    max-height: none;
    width: 100% !important;
    height: 100% !important;
    display: block !important;
    transform: none;
    margin: 0px !important;
    flex: 1 1 0% !important;
    z-index: 2000 !important;
}

.iconyuyin-2 {
    color: #fff !important;
    vertical-align: middle;
    font-size: 0.24rem;
}
</style>
<style>
#main .el-radio__label {
    font-size: 0.14rem;
    padding-left: 0.1rem;
}

#main .el-slider.is-vertical .el-slider__runway {
    margin: 0 auto;
}

#main .el-input__inner {
    height: 0.8rem;
    line-height: 0.8rem;
    padding: 0 0.15rem;
    font-size: 0.20rem;
    width: 4rem;
}

#main .el-input__icon {
    width: 0.25rem;
    line-height: 0.35rem;
    font-size: 0.14rem;
}

.local{
	width: 400rpx;
	height: 200rpx !important;
}
</style>
