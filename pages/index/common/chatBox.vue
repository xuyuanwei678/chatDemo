<template>
  <div class="chatbox">
        <!--chat box-->
        <div  class="talk-list">
				<div v-for="(item,index) in talkList" :key="index">
					<template>
                        <div v-if="index==talkList.length-1" class="time">{{$moment(item.createTime).startOf().fromNow()}}</div>
                        
                        <div v-else>
                            <div v-if='$moment(item.createTime).startOf().fromNow()!=$moment(talkList[index+1].createTime).startOf().fromNow()' class="time">{{$moment(item.createTime).startOf().fromNow()}}</div>
                        </div>
						
					</template>
					<!--自己发出的消息-->
					
					<div v-if="item.type == 1" class="right">
						
						
						<!--头像-->
						<img src="/static/img/setting/avatar.jpg" class="pic">
						<!--头像end-->
                        
						<div v-if="item.deleted==0" style="display: flex;flex-direction: row;">
						
							
							<!--文字-->
							
							<div v-if="item.contentType=='word'||item.content.type=='words'" class="content2">{{item.content.content||item.content}}</div>
							<!--文字end-->
							
							<!-- 语言消息 -->
							<div v-if="item.contentType=='voice'" 
									:id="item.id" 
									class="voice content2"
									:class="playMsgid == item.id?'play':''"
									@tap="playVoice(item)"
									@touchstart.stop="touchstart_callback(item.id,index)"
									@touchend.stop="touchend_callback"
									@touchmove.stop.prevent="touchstop_callback"
							>	
							
								<div  class="length" :style="{'width':item.audio_width +'rpx'}">{{item.audioLength}}"</div>
								<div class="icon my-voice voice-icon"></div>
							</div>
							<!-- 语言消息end -->
							<!-- <div class="arrow">555</div> -->
						</div>
						
						<div v-else class="callbacl">
							我撤回了一条消息
						</div>
					</div>
					<!--自己发出的消息end-->
					
					<!--别人发出的消息-->
					<div v-else class="left">
						
						<img src="/static/img/setting/avatar.jpg" mode="aspectFill" class="pic">
						
						<div v-if="item.deleted==1" class="callbacl">
							xyw撤回了一条消息
						</div>
						
						<div v-else>
							
							<!--文字-->
							<div v-if="item.contentType=='word'||item.content.type=='words'" class="content2">{{item.content.content||item.content}}</div>
							<!--文字end-->
							
							<!-- 语言消息 -->
							<div v-if="item.contentType=='voice'" 
									:id="item.id" 
									class="voice2 content2"
									:class="playMsgid == item.id?'play2':''"
									@tap="playVoice(item)" >
								<div class="icon other-voice voice-icon2"></div>
								<div class="length" :style="{'width':item.audio_width +'rpx'}">{{item.audioLength}}"</div>
							</div>
							<!-- 语言消息end -->
						</div>
					</div>
					<!--别人发出的消息end-->
					
				</div>
			</div>
            <!--chat box end-->
  </div>
</template>

<script>
export default {
  name: '',
  components: {

  },
  data() {
    return {
        talkList:{

        }
    }
  },
  validations: { },
  computed:{
	get_new_message() {
		return this.$store.state.vuex_message;
	},
},
watch:{
	get_new_message:function(newV,oldV){
		this.talkList.unshift(newV)
		console.error(this.talkList)
	},
},
  filters: { },
  methods: {
    test(){
        let data = [
  {
    "id": "618de143cb790d4a9dcd5223",
    "senderId": 125,
    "senderName": "白云阁",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "content": "从别后，忆相逢，几回魂梦与君同",
    "contentType": "word",
    "receiverId": 104,
    "receiverName": "李老师",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "deleted": 0,
    "createTime": "2021-11-12 11:36:35",
    "chatRoom": "8a33feecf955432e98670a5fedc60226",
    "type": 1,
  },
  {
    "id": "618de0f8cb790d4a9dcd5222",
    "senderId": 125,
    "senderName": "白云阁",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "content": "此去经年，应是良辰好景虚设",
    "contentType": "word",
    "receiverId": 104,
    "receiverName": "李老师",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "deleted": 0,
    "createTime": "2021-11-12 11:35:20",
    "chatRoom": "8a33feecf955432e98670a5fedc60226",
    "type": 1,
  },
  {
    "id": "618de0e2cb790d4a9dcd5221",
    "senderId": 125,
    "senderName": "白云阁",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "content": "多情自古伤离别，更那堪、冷落清秋节",
    "contentType": "word",
    "receiverId": 104,
    "receiverName": "李老师",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "deleted": 0,
    "createTime": "2021-11-12 11:34:58",
    "chatRoom": "8a33feecf955432e98670a5fedc60226",
    "type": 1,
  },
  {
    "id": "618b86aacb790d4a9dcd5172",
    "senderId": 104,
    "senderName": "18923104569",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "content": "瘦影自怜秋水照，卿须怜我我怜卿",
    "contentType": "word",
    "receiverId": 130,
    "receiverName": "广告",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "deleted": 0,
    "createTime": "2021-11-10 16:45:30",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "6178e3e00d34b856dbb2f181",
    "senderId": 104,
    "senderName": "18923104569",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "content": "似此星辰非昨夜，为谁风露立中宵",
    "contentType": "word",
    "receiverId": 130,
    "receiverName": "广告",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "deleted": 0,
    "createTime": "2021-10-27 13:30:08",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "6178ad940d34b856dbb2f149",
    "senderId": 104,
    "senderName": "刘老师",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "content": "山有木兮木有枝,心悦君兮君不知",
    "contentType": "word",
    "receiverId": 125,
    "receiverName": "广告",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "deleted": 1,
    "createTime": "2021-10-27 09:38:28",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "6178ad8f0d34b856dbb2f148",
    "senderId": 104,
    "senderName": "刘老师",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "content": "落红不是无情物，化作春泥更护花",
    "contentType": "word",
    "receiverId": 125,
    "receiverName": "广告",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "deleted": 0,
    "createTime": "2021-10-27 09:38:23",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "6178ad8d0d34b856dbb2f147",
    "senderId": 104,
    "senderName": "刘老师",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "content": "咬定青山不放松，立根原在破岩中",
    "contentType": "word",
    "receiverId": 125,
    "receiverName": "广告",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "deleted": 0,
    "createTime": "2021-10-27 09:38:21",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "6177bd5aff924767c640c642",
    "senderId": 125,
    "senderName": "广告",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "content": "我渴望有价值的对手",
    "contentType": "word",
    "receiverId": 104,
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "deleted": 0,
    "createTime": "2021-10-26 16:33:30",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "6177bd50ff924767c640c641",
    "senderId": 125,
    "senderName": "广告",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "content": "疾风知劲草，板荡识诚臣。",
    "contentType": "word",
    "receiverId": 104,
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "deleted": 0,
    "createTime": "2021-10-26 16:33:20",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "61777a15ff924767c640c62a",
    "senderId": 104,
    "senderName": "刘老师",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "content": "竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。",
    "contentType": "word",
    "receiverId": 125,
    "receiverName": "广告",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "deleted": 1,
    "createTime": "2021-10-26 11:46:29",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "61776c38ff924767c640c629",
    "senderId": 125,
    "senderName": "广告",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "content": "西北望，射天狼",
    "contentType": "word",
    "receiverId": 104,
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "deleted": 0,
    "createTime": "2021-10-26 10:47:20",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "61776c30ff924767c640c628",
    "senderId": 125,
    "senderName": "广告",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "content": "我于杀戮之中盛放，亦如黎明中的花朵",
    "contentType": "word",
    "receiverId": 104,
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "deleted": 0,
    "createTime": "2021-10-26 10:47:12",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "61776c29ff924767c640c627",
    "senderId": 125,
    "senderName": "广告",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "content": "不论刮风还是下雨，太阳照常升起",
    "contentType": "word",
    "receiverId": 104,
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "deleted": 0,
    "createTime": "2021-10-26 10:47:05",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "617767b2ff924767c640c626",
    "senderId": 104,
    "senderName": "刘老师",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "content": "时间，不在于你拥有多少，而在于你怎样使用",
    "contentType": "word",
    "receiverId": 125,
    "receiverName": "广告",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "deleted": 0,
    "createTime": "2021-10-26 10:28:02",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "6177678aff924767c640c625",
    "senderId": 104,
    "senderName": "刘老师",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "content": "你好啊，朋友",
    "contentType": "word",
    "receiverId": 125,
    "receiverName": "广告",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "deleted": 0,
    "createTime": "2021-10-26 10:27:22",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "61776711ff924767c640c624",
    "senderId": 125,
    "senderName": "广告",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "content": "嘻嘻嘻，哈哈哈",
    "contentType": "word",
    "receiverId": 104,
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "deleted": 0,
    "createTime": "2021-10-26 10:25:21",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "617766a8ff924767c640c622",
    "senderId": 104,
    "senderName": "刘老师",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "content": "回眸一笑百媚生",
    "contentType": "word",
    "receiverId": 125,
    "receiverName": "广告",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "deleted": 0,
    "createTime": "2021-10-26 10:23:36",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "61776654ff924767c640c621",
    "senderId": 125,
    "senderName": "广告",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "content": "云想衣裳花想容，春风拂槛露华浓。",
    "contentType": "word",
    "receiverId": 104,
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "deleted": 0,
    "createTime": "2021-10-26 10:22:12",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  }
]
    this.talkList = data
    }
  },
  created() {
    this.test()
    console.log(this.talkList)
  },
  mounted() {

  },
}

</script>

<style scoped lang="less">

.chatbox {
    
}
.talk-list{
    
    display: flex;
    flex-direction: column-reverse;
    
    padding: 0 20rpx;
    .time{
        width: 100%;
        text-align: center;
        font-size: 20rpx;
        font-family: Source Han Sans CN;
        font-weight: 400;
        color: #b5b5b5;
		margin-top: 20rpx;
    }
    .right{
        width: 100%;
        display: flex;
        align-content:flex-start;
        align-items: flex-start;
        flex-direction: row-reverse;
        min-height: 100rpx;
        position:relative; 
        margin-top: 20rpx;
        .pic{
            width: 100rpx;
            height: 100rpx;
            border-radius: 50%;
			z-index: 10;
        }
        .content2{
			background: #068EFD;
			min-height: 100rpx;
			line-height: 100rpx;
			border-radius: 4px;
			font-size: 24rpx;
            padding: 0 40rpx;
            font-family: Source Han Sans CN;
            font-weight: 400;
            color: #FFFFFF;
            margin-right: 26rpx;
            position:relative; 
			display: flex;
			align-items: center;
            &::after{
                content: '';
                display: block;
                position:absolute;
                top:25rpx;
                right:-16px; /* 圆角的位置需要细心调试哦 */
                width:0;
                height:0;
                font-size:0;
                border:solid 8px;
                border-color:#F1F1F1 #F1F1F1 #F1F1F1 #068EFD;
            }  
		}
        // .arrow {
        //     position:absolute;
        //     top:5px;
        //     right:-16px; /* 圆角的位置需要细心调试哦 */
        //     width:0;
        //     height:0;
        //     font-size:0;
        //     border:solid 8px;
        //     border-color:#4D4948 #4D4948 #4D4948 #F8C301;
        // }
    }
    .left{
        width: 100%;
        display: flex;
        align-content:flex-start;
        align-items: flex-start;
        position:relative; 
        margin-top: 20rpx;
        .pic{
            width: 100rpx;
            height: 100rpx;
            border-radius: 50%;
			z-index: 10;
        }
        .content2{
			background: #068EFD;
			min-height: 100rpx;
			display: flex;
			align-items: center;
			border-radius: 4px;
			font-size: 24rpx;
			padding: 0 40rpx;
			font-family: Source Han Sans CN;
			font-weight: 400;
			color: #FFFFFF;
			margin-left: 26rpx;
			position:relative; 
            &::before{
                content: '';
                display: block;
                position:absolute;
                top:25rpx;
                left:-16px; /* 圆角的位置需要细心调试哦 */
                width:0;
                height:0;
                font-size:0;
                border:solid 8px;
                border-color: #F1F1F1 #068EFD #F1F1F1 #F1F1F1  ;
            }  
		}
    }
}
.callbacl{
    color: #b5b5b5;
    height: 100rpx;
    line-height: 100rpx;
    padding: 0 20rpx;
}		





</style>



