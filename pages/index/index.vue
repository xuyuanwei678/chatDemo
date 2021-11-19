<template>
	<view class="content">
		<chat-box></chat-box>
		
		
		<!-- 抽屉栏 -->
		<view class="popup-layer" :class="popupLayerClass" @touchmove.stop.prevent="discard">
			<!-- 表情 -->
			<swiper class="emoji-swiper" :class="{hidden:hideEmoji}" indicator-dots="true" duration="150">
				<swiper-item v-for="(page,pid) in emojiList" :key="pid">
					<view v-for="(em,eid) in page" :key="eid" @tap="addEmoji(em)">
						<image mode="widthFix" :src="em.img"></image>
					</view>
				</swiper-item>
			</swiper>
			<!-- 更多功能 相册-拍照 -->
			<view class="more-layer" :class="{hidden:hideMore}">
				<view class="list">
					<view class="box" @tap="camera">
						<image src="/static/img/news/photo.png" mode=""></image>
						<view class="">拍照</view>
					</view>
					<view class="box" @tap="chooseImage">
						<image src="/static/img/news/image.png" mode=""></image>
						<view class="">图片</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 底部输入栏 -->
		<view class="input-box" :class="popupLayerClass" @touchmove.stop.prevent="discard">
			<!-- H5下不能录音，输入栏布局改动一下 -->
			
			<view class="voice">
				<view class="icon" :class="isVoice?'jianpan':'yuyin'" @tap="switchVoice"></view>
			</view>
			
			<!-- #ifdef H5 -->
			<view class="more" @tap="showMore">
				<view class="icon add"></view>
			</view>
			<!-- #endif -->
			<view class="textbox">
				<view class="voice-mode" :class="[isVoice?'':'hidden',recording?'recording':'']"
					@touchstart="voiceBegin" @touchmove.stop.prevent="voiceIng" @touchend="voiceEnd"
					@touchcancel="voiceCancel">{{voiceTis}}</view>
				<view class="text-mode" :class="isVoice?'hidden':''">
					<view class="box">
						<u-input confirm-type="send" @confirm="sendMessageText" 
						:auto-height="true" v-model="content"
						type="textarea" height="38"
							@focus="textareaFocus" />
					</view>
					<!-- <view class="em" @tap="chooseEmoji">
						<view class="icon biaoqing"></view>
					</view> -->
				</view>
			</view>
			<!-- #ifndef H5 -->
			<view class="more" @tap="showMore">
				<view class="icon add"></view>
			</view>
			<!-- #endif -->
			<view  class="send" :class="isVoice?'hidden':''" @click="sendMessageText">
				<view class="btn">发送</view>
			</view>
		</view>
		
		<!-- 录音UI效果 -->
		<view class="record" :class="recording?'':'hidden'">
			<view class="ing" :class="willStop?'hidden':''">
				<view class="icon luyin2"></view>
			</view>
			<view class="cancel" :class="willStop?'':'hidden'">
				<view class="icon chehui"></view>
			</view>
			<view class="tis" :class="willStop?'change':''">{{recordTis}}</view>
		</view>
		
	</view>
</template>

<script>
	
	import chatBox from "./common/chatBox.vue"
	import emotions from '@/static/json/emoji.js'
	//websocket
	import websocket from '@/common/websocket.js'
	//websocket初始化，根据业务需求选择链接时机
	websocket.Init();
	import {mapState} from 'vuex'
	export default {
		components:{
			chatBox
		},
		data() {
			return {
				//文字消息
				textMsg: '',
				
				talkList:[],
				
				axios_list: [],
				total: 1,
				
				ajax:{
					rows:20,	//每页数量
					page:1,	//页码
					flag:true,	// 请求开关
					loading:true,	// 加载中
					loadText:'正在获取消息'
				},
				
				//表情定义
				hideEmoji: true,
				emojiList: emotions,
				// more参数
				hideMore: true,
				
				willStop: false,
				content:'',
				user: '',
				// #ifndef H5
				//H5不能录音
				RECORDER: uni.getRecorderManager(),
				// #endif
				//播放语音相关参数
				AUDIO: uni.createInnerAudioContext(),
				isVoice: false,
				voiceTis: '按住 说话',
				recordTis: "手指上滑 取消发送",
				recording: false,
				playMsgid: null,
				VoiceTimer: null,
				timeoutObj: {},							//ws心跳计时器
				timeout: 30000,							//心跳间隔
				info: {},								//
				
				// 抽屉参数
				popupLayerClass: '',
				image_list: [],							//图片预览数组
				voice_time: [],
				//录音相关
				initPoint: {
					identifier: 0,
					Y: 0
				},
				loading_data: true,
				//撤回相关
				callback_style:{},
				callback: false,
				callback_time: '',
				messsage_id: '',			//撤回信息的id,用于客服撤回消息时
				callback_index: '',			//撤回信息的id，用于我撤回消息
				audioLength: 0,				//音频时长
			}
		},
		onLoad() {
			this.title=process.env.NODE_ENV;
			console.log('this.$store.state.vuex_message;',this.$store.state.vuex_message)
		},
		
		methods: {
			jump(){
				uni.navigateTo({
					url: "./home"
				})
			},
				showMore() {
					this.isVoice = false;
					this.hideEmoji = true;
					if (this.hideMore) {
						this.hideMore = false;
						this.openDrawer();
					} else {
						this.hideDrawer();
					}
				},
				
				// 打开抽屉
				openDrawer() {
					this.popupLayerClass = 'showLayer';
				},
				// 隐藏抽屉
				hideDrawer() {
					this.popupLayerClass = '';
					this.hideMore = true;
					this.hideEmoji = true;
					this.callback = false;
				},
				//获取焦点，如果不是选表情ing,则关闭抽屉
				textareaFocus() {
					if (this.popupLayerClass == 'showLayer' && this.hideMore == false) {
						this.hideDrawer();
					}
					//需要添加滚动到底部
				},
				//拍照发送
				camera() {
					this.getImage('camera');
				},
				// 选择图片发送
				chooseImage() {
					this.getImage('album');
				},
				//选照片 or 拍照
				getImage(type) {
					this.hideDrawer();
					uni.chooseImage({
						sourceType: [type],
						sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
						success: (res) => {
							for (let i = 0; i < res.tempFilePaths.length; i++) {
								uni.uploadFile({
									url: cfg.Api_url + this.$api.task.action, //仅为示例，非真实的接口地址
									filePath: res.tempFilePaths[i],
									name: 'file',
									formData: {
										type: 1
									},
									header: {
										Authorization: uni.getStorageSync('Authorization'),
										'content-type': 'multipart/form-data' 
									},
									success: (uploadFileRes) => {
										//上传结果赋值。uploadFileRes.url改成真实的url路径
										console.log(uploadFileRes)
										if (uploadFileRes.statusCode == 200) {
											var code = JSON.parse(uploadFileRes.data).code
											if (code == 200) {
												uni.sendSocketMessage({
													data: JSON.stringify({
														chatType: 'personal_chat',
														receiverId: this.user.userId,
														receiverName: this.user
															.userName,
														senderAvatar: this.info.avatar,
															senderName:this.info.nickName,
														content: JSON.parse(uploadFileRes.data).data.url,
														contentType: 'image',
													})
												});
												//this.page = 1
												
				
				
											} else {
												this.$refs.uToast.show({
													title: '上传失败',
												})
											}
										} else {
											this.$refs.uToast.show({
												title: 'ios上传失败',
											})
										}
				
									}
								});
				
							}
						}
					});
				},
				// 切换语音/文字输入
				switchVoice() {
					this.hideDrawer();
					this.isVoice = this.isVoice ? false : true;
				},
				// 录音开始
				voiceBegin(e) {
					if (e.touches.length > 1) {
						return;
					}
					this.initPoint.Y = e.touches[0].clientY;
					this.initPoint.identifier = e.touches[0].identifier;
					this.RECORDER.start({
						format: "mp3"
					}); //录音开始,
				},
				//录音开始UI效果
				recordBegin(e) {
					this.recording = true;
					this.voiceTis = '松开 结束';
					this.recordLength = 0;
					this.recordTimer = setInterval(() => {
						this.recordLength++;
					}, 1000)
				},
				// 录音被打断
				voiceCancel() {
					this.recording = false;
					this.voiceTis = '按住 说话';
					this.recordTis = '手指上滑 取消发送'
					this.willStop = true; //不发送录音
					this.RECORDER.stop(); //录音结束
				},
				// 录音中(判断是否触发上滑取消发送)
				voiceIng(e) {
					if (!this.recording) {
						return;
					}
					let touche = e.touches[0];
					//上滑一个导航栏的高度触发上滑取消发送
					if (this.initPoint.Y - touche.clientY >= uni.upx2px(100)) {
						this.willStop = true;
						this.recordTis = '松开手指 取消发送'
					} else {
						this.willStop = false;
						this.recordTis = '手指上滑 取消发送'
					}
				},
				// 结束录音
				voiceEnd(e) {
					if (!this.recording) {
						return;
					}
					this.recording = false;
					this.voiceTis = '按住 说话';
					this.recordTis = '手指上滑 取消发送'
					this.RECORDER.stop(); //录音结束
				},
				//录音结束(回调文件)
				recordEnd(e) {
					clearInterval(this.recordTimer);
					if (!this.willStop) {
						console.log("e: " + JSON.stringify(e));
						let msg = {
							length: 0,
							url: e.tempFilePath
						}
						let min = parseInt(this.recordLength / 60);
						let sec = this.recordLength % 60;
						min = min < 10 ? '0' + min : min;
						sec = sec < 10 ? '0' + sec : sec;
						var length = min + ':' + sec;
						// this.sendMsg(msg,'voice');
						uni.uploadFile({
							url: cfg.Api_url + this.$api.task.action, //仅为示例，非真实的接口地址
							filePath: e.tempFilePath,
							name: 'file',
							formData: {
								type: 1
							},
							header: {
								Authorization: uni.getStorageSync('Authorization')
				
							},
							success: (uploadFileRes) => {
								//上传结果赋值。uploadFileRes.url改成真实的url路径
								console.log(uploadFileRes)
								if (uploadFileRes.statusCode == 200) {
									var code = JSON.parse(uploadFileRes.data).code
									if (code == 200) {
				
										uni.sendSocketMessage({
											data: JSON.stringify({
												chatType: 'personal_chat',
												receiverId: this.user.userId,
												receiverName: this.user.userName,
												senderAvatar: this.info.avatar,
												senderName:this.info.nickName,
												content: JSON.parse(uploadFileRes.data).data.url,
												contentType: 'voice',
												duration: this.recordLength
											})
										});
										this.page = 1
										console.log(123)
										
				
				
									} else {
										this.$refs.uToast.show({
											title: '上传失败',
										})
									}
								} else {
									this.$refs.uToast.show({
										title: '上传失败',
									})
								}
				
							}
						});
					} else {
						console.log('取消发送录音');
					}
					this.willStop = false;
				},
				// 选择表情
				chooseEmoji() {
					this.hideMore = true;
					if (this.hideEmoji) {
						this.hideEmoji = false;
						this.openDrawer();
					} else {
						this.hideDrawer();
					}
				},
				//添加表情,这个功能还在做，waiting
				addEmoji(em) {
					this.textMsg += em.text;
				},
				//发送消息
				sendMessageText(){
					let test = {
						"action":"group_chat",						//聊天类型，后端定义
						"content":{									//聊天内容
							"type":"words",
							"content":this.content,
						}
					}
					websocket.Send(test)
					this.content = '';
				}
		}
	}
</script>

<style lang="scss">
	@import "@/common/css/chat.scss";
	.content {
		background-color: #F1F1F1;
		padding-bottom: 150rpx;
		
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
