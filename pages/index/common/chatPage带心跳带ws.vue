<template>
	<view>
		<u-toast ref="uToast" />
		<view class="tips color_fff size_12 align_c" :class="{ 'show':ajax.loading }" @tap="getHistoryMsg">{{ajax.loadText}}</view>
		<view class="box-1" id="list-box">
			<view @tap="hideDrawer" class="talk-list">
				<view v-for="(item,index) in talkList" :key="index" :id="`msg-${item.id}`">
					<template>
						<view v-if='item.createTime' class="time">{{item.createTime}}</view>
					</template>
					<!--自己发出的消息-->
					<view v-if="item.type == 1" class="item flex_col push right">
						
						<!--头像-->
						<image :src="item.pic" mode="aspectFill" class="pic"></image>
						<!--头像end-->
						<view v-if="item.deleted==0" style="display: flex;flex-direction: row;">
						
							<u-button @click="callback_message()" 
									:custom-style="callback_style" 
									v-if="callback&&item.id==messsage_id">
								撤回
							</u-button>
							<!--文字-->
							<view 
								v-if="item.contentType=='word'" 
								class="content2"
								@touchstart.stop="touchstart_callback(item.id,index)" 
								@touchend.stop="touchend_callback"
								@touchmove.stop.prevent="touchstop_callback"
							>
								{{item.content}}
							</view>
							<!--文字end-->
							
							<!-- 语言消息 -->
							<view v-if="item.contentType=='voice'" 
									:id="item.id" 
									class="voice content2"
									:class="playMsgid == item.id?'play':''"
									@tap="playVoice(item)"
									@touchstart.stop="touchstart_callback(item.id,index)"
									@touchend.stop="touchend_callback"
									@touchmove.stop.prevent="touchstop_callback"
							>
								<!-- <view class="length">22{{item.audioLength}}</view> -->
								<view class="icon my-voice voice-icon"></view>
							</view>
							<!-- 语言消息end -->
							
							<!--图片消息-->
							<view 	v-if="item.contentType=='image'" 
									class="content-image"
									@tap="showPic(item.content)"
									@touchstart.stop="touchstart_callback(item.id,index)"
									@touchend.stop="touchend_callback"
									@touchmove.stop.prevent="touchstop_callback"
							>
								
								<!-- <image :src="item.receiverAvatar"
									:style="{'width': item.content.w+'px','height': item.content.h+'px'}"
									mode="widthFix"></image> -->
								<image :src="item.content"
									:style="{'width': 180+'px','height': 180+'px'}"
								></image>
							</view>
							<!--图片消息end-->
						</view>
						
						<view v-else class="callbacl">
							我撤回了一条消息
						</view>
					</view>
					<!--自己发出的消息end-->
					
					<!--别人发出的消息-->
					<view v-else class="item flex_col pull left">
						
						<image :src="item.pic" mode="aspectFill" class="pic"></image>
						
						<view v-if="item.deleted==1" class="callbacl">
							客服撤回了一条消息
						</view>
						
						<view v-else>
							<!--文字-->
							<view v-if="item.contentType=='word'" class="content2">{{item.content}}</view>
							<!--文字end-->
							
							<!-- 语言消息 -->
							<view v-if="item.contentType=='voice'" 
									:id="item.id" 
									class="voice2 content2"
									:class="playMsgid == item.id?'play2':''"
									@tap="playVoice(item)" >
								<!-- <view class="length">{{row.content.length}}</view> -->
								<view class="icon other-voice voice-icon2"></view>
							</view>
							<!-- 语言消息end -->
							
							<!--图片消息-->
							<view v-if="item.contentType=='image'" class="content2"
								@tap="showPic(item.content)">
								
								<!-- <image :src="item.receiverAvatar"
									:style="{'width': item.content.w+'px','height': item.content.h+'px'}"
									mode="widthFix"></image> -->
								<image :src="item.content"
									:style="{'width': 180+'px','height': 180+'px'}"
								></image>
							</view>
							<!--图片消息end-->
							
							<!--课程-->
							<view  v-if="item.contentType=='course'" >
								<view class="course" v-for="(item,index) in item.content" :key="index">
									<course-item :id="item"></course-item>
								</view>
							</view>
							<!--课程end-->
						</view>
					</view>
					<!--别人发出的消息end-->
					
				</view>
			</view>
		</view>
		<!-- <view class="box-2">
			<view class="flex_col">
				<view class="flex_grow">
					<input type="text" class="content2" v-model="content" placeholder="请输入聊天内容" placeholder-style="color:#DDD;" :cursor-spacing="6">
				</view>
				<button class="send" @tap="send">发送</button>
			</view>
		</view> -->
		
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
	import cfg from '@/common/config.js'
	import courseItem from './components/courseItem.vue'
	import emotions from '@/static/json/emoji.js'
	export default {
		components:{
			courseItem
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
		onReady(){
			if(uni.getStorageSync("chat_user").deleted==1){
				var title = '离线'
			}else{
				var title = '在线'
			}
			uni.setNavigationBarTitle({
			    title: uni.getStorageSync("chat_user").userName + '(' + title +')'
			});
		},
		created() {
			this.info = uni.getStorageSync("user_infomation");
			this.ajax = {
				rows:20,	//每页数量
				page:1,	//页码
				flag:true,	// 请求开关
				loading:true,	// 加载中
				loadText:'正在获取消息'
			},
			//置空
			this.talkList = [];
			this.image_list = [];
			
			this.$nextTick(()=>{
				this.getHistoryMsg();
			});
			
			this.checkOpenSocket();
		},
		onLoad() {
			this.user = uni.getStorageSync('chat_user');
			this.AUDIO.onEnded((res) => {
				this.playMsgid = null;
			});
			// #ifndef H5
			//录音开始事件
			this.RECORDER.onStart((e) => {
				this.recordBegin(e);
			})
			//录音结束事件
			this.RECORDER.onStop((e) => {
				this.recordEnd(e);
			})
			// #endif
		},
		mounted() {
			
		},
		onShow() {
			
		},
		onPageScroll(e){
			//距离顶部多久会触发获取新消息
			if(this.loading_data){
				if(e.scrollTop<1){
					this.getHistoryMsg();
				}
			}else{
				if(e.scrollTop<5){
					
					this.$refs.uToast.show({
						title: '无更多历史消息',
						type: 'none',
					})
				}
			}
			
		},
		onUnload() {
			console.log("退出1")
			uni.closeSocket(function(res) {
				console.log(res);
			});
			clearInterval(this.timeoutObj);
		},
		onBackPress() {
			console.log("退出2")
			clearInterval(this.timeoutObj);
			uni.closeSocket(function(res) {
				console.log(res);
			});;
		},
		methods: {
			
			//心跳机制开始
			//判断是否已连接
			checkOpenSocket() {
				console.log("测试我是心跳")
				uni.sendSocketMessage({
					data: JSON.stringify({
						chatType: 'hert',
						content: 'ping',
					}),
					success: res => {
						return;
					},
					fail: err => {
						// 未连接打开websocket连接
						this.makeConnection();
						
					}
				});
			},
			//	打开成功监听服务器返回的消息
			onSocketMessage(res) {
				// 消息
				console.log("打开成功监听服务器返回的消息")
				//收到新消息后清除计时器
				clearInterval(this.timeoutObj);
				this.timeout = 30000;
				this.timeoutObj = null;
				this.getSocketMsg(res); // 监听到有新服务器消息
				
			},
			// 监听到有新服务器消息
			getSocketMsg(res) {
				// 监听到服务器消息
				
				//console.log('收到服务器消息');
				//console.log('收到服务器内容23333：', res.data);
				//console.log("=====================================",res.data.indexOf("连接成功") == -1)
				
				if(res.data.indexOf("连接成功") === -1){
					let message_one = JSON.parse(res.data) 
					console.log("message_one",message_one)
					// 将当前发送信息 添加到消息列表。
					if(message_one.senderId==this.info.userId){
						var message_type = 1;
					}else{
						var message_type = 0;
					}
					
					
					console.log(message_one.contentType)
					if(message_one.chatType =='personal_chat'){
						//客服推荐的课程
						if(message_one.contentType == "course") {
							var course_content = JSON.parse(message_one.content);
						}else{
							var course_content = message_one.content;
						}
						
						let data = {
							"id":message_one.id,
							"content":course_content,
							"type":message_type,
							"pic":message_one.senderAvatar,
							"contentType": message_one.contentType,
							"deleted": 0,
						}
						
						this.talkList.push(data);
						console.log("我的",this.talkList)

						// 清空内容框中的内容
						this.$nextTick(()=>{
							uni.pageScrollTo({
									scrollTop: 999999,	// 设置一个超大值，以保证滚动条滚动到底部
									duration: 0
								});
						})
						//部分安卓机不起作用
						setTimeout(()=>{
							uni.pageScrollTo({
								scrollTop: 999999,	// 设置一个超大值，以保证滚动条滚动到底部
								duration: 0
							});
						},100)
						switch(message_one.contentType){
							//收到图片加入预览图片数组
							case 'image':
								this.add_image_list(message_one.content);
								break;
						}
					}
					if(message_one.chatType =='backout'){
						console.log("数组列表",this.talkList)
						for(let i = this.talkList.length-1;i>=0;i--){
							if(this.talkList[i].id==message_one.id){
								this.talkList[i].deleted = 1;
								break;
							}
						}
					}
				}
				
				console.log("=====================================")
				
				//that.page = 1
				
				
				this.reset();  // 检测心跳reset,防止长时间连接导致连接关闭
			},
			// 检测心跳reset
			reset() {
				console.log("重置心跳")
				clearInterval(this.timeoutObj);
				this.start(); // 启动心跳
			},
			// 启动心跳 start
			start() {
				console.log('启动心跳',this)
				var that = this;
				this.timeoutObj = setInterval(()=>{
					uni.sendSocketMessage({
						data: JSON.stringify({
							chatType: 'hert',
							content: 'ping',
						}),
						success: (err,that) => {
							console.log('心跳中this',this);
						},
						fail: err => {
							console.log('连接失败重新连接....',that);
							uni.closeSocket(function(res) {
								console.log(res);
							});
							this.makeConnection();
						}
					});
				}, this.timeout);
			},
			//建立链接
			makeConnection() {
				let that = this
				uni.connectSocket({
					url: cfg.Ws_url + that.user.chatroom + '/' + that.info.userId +
						'/user',
					header: {
						'content-type': 'application/json'
					},
				});
				uni.onSocketOpen(function(res) {
					console.log('WebSocket连接已打开！');
				});
				uni.onSocketError(function(res) {
					console.log('WebSocket连接打开失败，请检查！');
				});
			
				uni.onSocketMessage(function(res) {
					that.onSocketMessage(res);
				});
				
			},
			startHeart(){
				console.log('startHeart',this)
			},
			//心跳机制end
			
			// 获取历史消息
			getHistoryMsg(){
				if(!this.ajax.flag){
					return; //
				}
				
				// 此处用到 ES7 的 async/await 知识，为使代码更加优美。不懂的请自行学习。
				let get = async ()=>{
					this.hideLoadTips();
					this.ajax.flag = false;
					console.log("this.talkList.length==this.total")
					
					let data = await this.joinHistoryMsg();
					
					console.log('----- 模拟数据格式，供参考 -----');
					console.log(data);	// 查看请求返回的数据结构 
					
					// 获取待滚动元素选择器，解决插入数据后，滚动条定位时使用
					let selector = '';
										
					if(this.ajax.page>1){
						// 非第一页，则取历史消息数据的第一条信息元素
						selector = `#msg-${this.talkList[0].id}`;
					}else{
						// 第一页，则取当前消息数据的最后一条信息元素
						selector = `#msg-${data[data.length-1].id}`;
					}
					console.log(selector)
					// 将获取到的消息数据合并到消息数组中
					this.talkList = [...data,...this.talkList];	
					
					// 数据挂载后执行，不懂的请自行阅读 Vue.js 文档对 Vue.nextTick 函数说明。
					this.$nextTick(()=>{
						// 设置当前滚动的位置
						this.setPageScrollTo(selector);
						
						
												
						if(data.length < this.ajax.rows){
							// 当前消息数据条数小于请求要求条数时，则无更多消息，不再允许请求。
							// 可在此处编写无更多消息数据时的逻辑
							console.log("无更多消息")
							this.loading_data = false;
							this.ajax.flag = false;
							
							setTimeout(()=>{
								this.ajax.loading = false;
							},1000);
						}else{
							this.hideLoadTips(true);
							this.ajax.page ++;
							// 延迟 200ms ，以保证设置窗口滚动已完成
							setTimeout(()=>{
								this.ajax.flag = true;
							},200)
						}
						
					})	
				
					
				}
				console.log("测试")
				get();
				
			},
			//add_image_list,添加图片到预览数组
			add_image_list(url){
				console.log("url",url);
				this.image_list.push(url);
			},
			//请求历史消息
			// 拼接历史记录消息
			joinHistoryMsg(){
				
				return new Promise((done,fail)=>{
					
					
					//添加
					let url = '?receiverId=' + this.info.userId 
								+ '&chatRoom=' + this.user.chatroom 
								+ '&pageNum=' + this.ajax.page + '&pageSize=' + this.ajax.rows;
					
					this.$http.get(this.$api.chat.get_chatList+url).then(async res=>{
						
						this.axios_list = res.data.rows;
						this.total = res.data.total;
						console.log(this.total,this.axios_list)
						
						let arr = [];
						
						//通过当前页码及页数，模拟数据内容
						//let startIndex = (this.ajax.page-1) * this.ajax.rows;
						//let endIndex = startIndex + this.ajax.rows;
						//判断最后一页
						let item_length = 20;
						
						if(this.axios_list.length<20){
							item_length = this.axios_list.length;
						}
						for(let i = 0; i < item_length; i++){
							
							// 此为消息类别，设 1 为发出去的消息，0 为收到对方的消息
							if(this.axios_list[i].senderId==this.info.userId){
								var message_type = 1;
							}else{
								var message_type = 0;
							}
							
							//客服推荐的课程
							if(this.axios_list[i].contentType == "course") {
								var course_content = JSON.parse(this.axios_list[i].content);
							}else{
								var course_content = this.axios_list[i].content;
							}
							if(this.axios_list[i].contentType == "image"){
								this.image_list.unshift(this.axios_list[i].content)
							}
							
							// if(this.axios_list[i].contentType == "voice"){
								
								
							// 	let get_audio = async()=>{
							// 		let audio_leng = await this.test1(this.axios_list[i].content);
							// 		return audio_leng
							// 	}
							// 	get_audio();
								
							// 	/* var time = this.hahaha(this.axios_list[i].content);
							// 	console.log("time",time) */
							// 	let that = this;
							// 	/* await this.AUDIO.onCanplay(()=>{
							// 		 console.log("哈哈哈2",that.AUDIO.duration)
							// 	}) */
							// 	//this.hahaha()
							// }else{
							// 	this.audioLength = 0
							// }
							//发送事件处理
							if(i!=item_length-1){
								let time1 = this.axios_list[i].createTime.slice(14,16)
								let time2 = this.axios_list[i+1].createTime.slice(14,16)
								if(time2==time1){
									var createTime = false;
								}else{
									var createTime = this.axios_list[i].createTime;
								}
							}
							//发送的语音消息
							/* if(this.axios_list[i].contentType == "voice") {
								console.log("播放")
								this.AUDIO.src = this.axios_list[i].content;
								this.AUDIO.onCanplay((duration)=>{
									console.log(duration);
									var voice_time = duration;
								})
								
							}else{
								var voice_time = '';
							} */
							arr.push({
								"id":this.axios_list[i].id,						// 消息的ID
								"content":course_content,						// 消息内容
								"type":message_type	,							// 此为消息类别，设 1 为发出去的消息，0 为收到对方的消息,
								"pic":this.axios_list[i].senderAvatar,			// 头像
								"contentType": this.axios_list[i].contentType,	//消息类别，如图片，语音，以及课程等
								"audioLength": this.audioLength,						//语音消息时长
								"deleted": this.axios_list[i].deleted,			//撤回消息的标识
								"createTime": createTime,						//消息创建的时间
							})
							console.log(item_length-1)
						}
						
						/*
							颠倒数组中元素的顺序。将最新的数据排在本次接口返回数据的最后面。
							后端接口按 消息的时间降序查找出当前页的数据后，再将本页数据按消息时间降序排序返回。
							这是数据的重点，因为页面滚动条和上拉加载历史的问题。
						 */
						//this.image_list.reverse();
						arr.reverse();
						console.log(arr)
						done(arr);
					})
					//添加end
					
					/* setTimeout(()=>{
						let data = join();
						done(data);
					},1500); */
				})
			},
			test1(url){
				return new Promise((resolve, reject)=>{
				       /* let sino = parseInt(Math.random() * 6 +1)
				        setTimeout(()=>{
				            resolve(sino)
				        },3000) */
						let newAudio = uni.createInnerAudioContext();
						newAudio.src = url;
						newAudio.onCanplay(()=>{
							resolve(newAudio.duration)
						})
				    })
			},
			async test2(url){
				
				
				let n =await this.test1(url)
				
				return n;
			},
			hahaha(){
				setTimeout(()=>{
					console.log("打印")
				},2000)
				/* console.log(url)
				var that = this;
				that.innerAudioContext = uni.createInnerAudioContext();
				that.innerAudioContext.src = url;
				console.log('不同的',url)
				that.innerAudioContext.onCanplay(()=>{
					console.log("录音的时长",that.innerAudioContext.duration)
					this.voice_time = Math.ceil(that.innerAudioContext.duration);
				}) */
				
			},
			// 设置页面滚动位置
			setPageScrollTo(selector){
				let view = uni.createSelectorQuery().in(this).select(selector);
				view.boundingClientRect((res) => {
					uni.pageScrollTo({
					    scrollTop:res.top - 30,	// -30 为多显示出大半个消息的高度，示意上面还有信息。
					    duration: 0
					});
				}).exec();
			},
			// 隐藏加载提示
			hideLoadTips(flag){
				if(flag){
					this.ajax.loadText = '消息获取成功';
					setTimeout(()=>{
						this.ajax.loading = false;
					},300);
				}else{
					this.ajax.loading = true;
					this.ajax.loadText = '正在获取消息';
				}
			},
			// 发送信息
			sendMessageText(){
				if(!this.content){
					uni.showToast({
						title:'请输入有效的内容',
						icon:'none'
					})
					return;
				}
				
				console.log(this.content)
				// 将当前发送信息 添加到消息列表。
				
				
				uni.sendSocketMessage({
					data: JSON.stringify({
						chatType: 'personal_chat',
						receiverId: this.user.userId,
						receiverName: this.user.userName,
						senderAvatar: this.info.avatar,
						content: this.content,
						senderName:this.info.nickName,
						contentType: 'word',
					})
				});
				
				this.content = '';
				
			},
			// 预览图片
			showPic(msg) {
				for(let i = 0;i<this.image_list.length;i++){
					console.log(this.image_list[i])
					this.image_list[i] = this.image_list[i].replace(/https/, "http")
				}
				console.log("msg",msg.replace(/https/, "http"))
				console.log("this.image_list",this.image_list)
				uni.previewImage({
					current: msg.replace(/https/, "http"),
					urls: this.image_list
				});
			},
			
			//撤回相关
			touchstart_callback(id,index){
				
				 //var  touch = evt.touches[0];  //获取第一个触点
				 //var  x = Number(touch.pageX);  //页面触点X坐标
				 //var  y = Number(touch.pageY);  //页面触点Y坐标
				
				this.messsage_id = id;
				console.log(this.talkList[index])
				//this.talkList[index] = [],
				//let xx = callback_id.scrollLeft
				this.callback_index = index;
			
				//console.log('callback_id',callback_id.getBoundingClientRect())
				//console.log(x,y)
				this.callback_time = setTimeout(()=>{
					console.log("打开撤回")
					this.callback = true;
					console.log("撤回",this.callback)
				},500)
				console.log("撤回",this.callback)
			},
			touchstop_callback(){
				console.log("stop")
			},
			touchend_callback(){
				console.log("ccc",this.callback)
				clearTimeout(this.callback_time)
			},
			//撤回消息
			callback_message(){
				console.log("测试撤回",this.callback_index);
				let url = '?id=' + this.messsage_id + '&chatRoom=' + this.user.chatroom
				this.$http.get(this.$api.chat.callback+url).then(res=>{
					if(res.code == 200){
						this.$refs.uToast.show({
							title: '撤回成功',
							type: 'success',
						})
						this.this.talkList[index].deleted = 1;
					}
				})
			},
			// 播放语音
			playVoice(msg) {
				console.log("123456msg",msg)
				this.playMsgid = msg.id;
				this.AUDIO.src = msg.content; 
				this.AUDIO.src = msg.content.replace(/https/, "http");
				
				this.$nextTick(function() {
					this.AUDIO.play();
				});
			},
			//更多功能(点击+弹出)
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
		}
	}
</script>

<style lang="scss">
	@import "../../lib/global.scss";
	@import "@/common/css/chat.scss";
	page{
		background-color: #F3F3F3;
		font-size: 28rpx;
	}
	.time{
		text-align: center;
		color: #999999;
		height: 100rpx;
		line-height: 100rpx;
		font-size: 26rpx;
	}
	.callback{
		background-color: rgba(0, 0, 0, 0.6);
		color: #FFFFFF;
		
		z-index: 999;
	}
	.callbacl{
		margin-top: 20rpx;
		height: 45rpx;
		width: 300rpx;
		line-height: 45rpx;
		text-align: center;
		border-radius: 20rpx;
		font-size: 26rpx;
		background-color: #FFFFFF;
		color: #c1c1c1;
	}
	.bubble{
		max-width: 70%;
		min-height: 50upx;
		border-radius: 10upx;
		padding: 15upx 20upx;
		display: flex;
		align-items: center;
		font-size: 32upx;
		word-break: break-word;
	}
	.img{
		background-color: transparent;
		padding:0;
		overflow: hidden;
		image{
			max-width: 350upx;
			max-height: 350upx;
		}
	}
	.voice-icon{
		color: #fff;
	}
	.voice-icon2{
		color: #068EFD;
	}
	.course{
		margin-top: 50rpx;
		width: 100%;
	}
	.course:first-child{
		margin-top: 0rpx;
	}
	
	/* 加载数据提示 */
	.tips{
		position: fixed;
		left: 0;
		top:var(--window-top);
		width: 100%;
		z-index: 9;
		background-color: rgba(0,0,0,0.15);
		height: 72rpx;
		line-height: 72rpx;
		transform:translateY(-80rpx);
		transition: transform 0.3s ease-in-out 0s;
		
		&.show{
			transform:translateY(0);
		}
	}
	
	.box-1{
		width: 100%;
		height: auto;
		padding-bottom: 100rpx;
		box-sizing: content-box;
		
		/* 兼容iPhoneX */
		margin-bottom: 0;  
		margin-bottom: constant(safe-area-inset-bottom);  
		margin-bottom: env(safe-area-inset-bottom);  
	}
	.box-2{
		position: fixed;
		left: 0;
		width: 100%;
		bottom: 0;
		height: auto;
		z-index: 2;
		border-top: #e5e5e5 solid 1px;
		box-sizing: content-box;
		background-color: #F3F3F3;
		
		/* 兼容iPhoneX */
		padding-bottom: 0;  
		padding-bottom: constant(safe-area-inset-bottom);  
		padding-bottom: env(safe-area-inset-bottom);  
		
		>view{
			padding: 0 20rpx;
			height: 100rpx;
		}
		
		.content2{
			background-color: #fff;
			height: 64rpx;
			padding: 0 20rpx;
			border-radius: 32rpx;
			font-size: 28rpx;
		}
		
		.send{
			background-color: #068EFD;
			color: #fff;
			height: 64rpx;
			margin-left: 20rpx;
			border-radius: 32rpx;
			padding: 0;
			width: 120rpx;
			line-height: 62rpx;
			
			&:active{
				background-color: #3FACFF;
			}
		}
	}
	
	.talk-list{
		padding-bottom: 20rpx;
		//语音点击后播放动画-我发出的消息
		.right{
			
			.play{
				@keyframes my-play {
					0% {
						transform: translateX(80%);
					}
					100% {
						transform: translateX(0%);
					}
				}
				.icon:after
				{
					border-left: solid 10upx rgba($color: #068EFD, $alpha: 0.5);
					animation: my-play 1s linear infinite;
				}
			}
			.voice{
				.icon{
					font-size: 40upx;
					display: flex;
					align-items: center;
					position: relative;
				}
				.icon:after
				{
					content:" ";
					width: 53upx;
					height: 53upx;
					border-radius: 100%;
					position: absolute;
					right: 0;
					box-sizing: border-box;
				}
				.length{
					font-size: 28upx;
				}
			}
			
		}
		//语音点击后播放动画-别人发出的消息
		.left{
			.play2{
				@keyframes my-play2 {
					0% {
						transform: translateX(-80%);
					}
					100% {
						transform: translateX(30%);
					}
				}
				.icon:after
				{
					border-right: solid 10upx rgba($color: #FFFFFF, $alpha: 0.5);
					animation: my-play2 1s linear infinite;
				}
			}
			.voice2{
				.icon{
					font-size: 40upx;
					display: flex;
					align-items: center;
					position: relative;
				}
				.icon:after
				{
					content:" ";
					width: 53upx;
					height: 53upx;
					border-radius: 100%;
					position: absolute;
					right: 0;
					box-sizing: border-box;
				}
				.length{
					font-size: 28upx;
				}
			}
			
		}
		/* 消息项，基础类 */
		.item{
			padding: 20rpx 20rpx 0 20rpx;
			align-items:flex-start;
			align-content:flex-start;
			color: #333;
			.pic{
				width: 92rpx;
				height: 92rpx;
				border-radius: 50%;
				border: #fff solid 1px;
			}
			
			/* 收到的消息 */
			&.pull{
				.content2{
					margin-left: 32rpx;
					background-color: #fff;
					padding: 20rpx;
					border-radius: 4px;
					max-width: 500rpx;
					word-break: break-all;
					line-height: 52rpx;
					position: relative;
					&::after{
						content: '';
						display: block;
						width: 0;
						height: 0;
						border-top: 16rpx solid transparent;
						border-bottom: 16rpx solid transparent;
						border-right: 20rpx solid #fff;
						position: absolute;
						top: 30rpx;
						left: -18rpx;
					}
				}
			}
			
			/* 发出的消息 */
			&.push{
				/* 主轴为水平方向，起点在右端。使不修改DOM结构，也能改变元素排列顺序 */
				flex-direction: row-reverse;
				.content2{
					margin-right: 32rpx;
					background-color:#068EFD;
					color: #FFFFFF;
					padding: 20rpx;
					border-radius: 4px;
					max-width: 500rpx;
					word-break: break-all;
					line-height: 52rpx;
					position: relative;
					&::after{
						content: '';
						display: block;
						width: 0;
						height: 0;
						border-top: 16rpx solid transparent;
						border-bottom: 16rpx solid transparent;
						border-left: 20rpx solid #068EFD;
						position: absolute;
						top: 30rpx;
						right: -18rpx;
					}
				}
				.content-image{
					margin-right: 32rpx;
					background-color: #fff;
					padding: 20rpx;
					border-radius: 4px;
					max-width: 500rpx;
					word-break: break-all;
					line-height: 52rpx;
					position: relative;
					&::after{
						content: '';
						display: block;
						width: 0;
						height: 0;
						border-top: 16rpx solid transparent;
						border-bottom: 16rpx solid transparent;
						border-left: 20rpx solid #fff;
						position: absolute;
						top: 30rpx;
						right: -18rpx;
					}
				}
			}
		}
	}
</style>