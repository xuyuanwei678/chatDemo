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
						<img src="/static/img/setting/avatar.png" class="pic">
						<!--头像end-->
                        
						<div v-if="item.deleted==0" style="display: flex;flex-direction: row;">
						
							
							<!--文字-->
							
							<div 
								v-if="item.contentType=='word'" 
								class="content2"
								@touchstart.stop="touchstart_callback(item.id,index)" 
								@touchend.stop="touchend_callback"
								@touchmove.stop.prevent="touchstop_callback"
							>
								{{item.content}}
							</div>
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
						
						<img src="/static/img/setting/avatar.png" mode="aspectFill" class="pic">
						
						<div v-if="item.deleted==1" class="callbacl">
							客服撤回了一条消息
						</div>
						
						<div v-else>
							
							<!--文字-->
							<div v-html="item.content" v-if="item.contentType=='word'" class="content2"></div>
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
  watch: { },
  computed: { },
  filters: { },
  methods: {
    test(){
        let data = [
  {
    "id": "618de143cb790d4a9dcd5223",
    "senderId": 125,
    "senderName": "白云阁",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "content": "55555",
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
    "content": "222",
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
    "content": "111",
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
    "content": "哈哈哈",
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
    "content": "xxxxxx",
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
    "content": "111",
    "contentType": "word",
    "receiverId": 125,
    "receiverName": "广告",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "deleted": 0,
    "createTime": "2021-10-27 09:38:28",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "6178ad8f0d34b856dbb2f148",
    "senderId": 104,
    "senderName": "刘老师",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "content": "111",
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
    "content": "1111",
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
    "content": "😅",
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
    "content": "😇",
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
    "content": "&lt;span class=\"chat-emoji emoji_b emojib_10\" data-name=\"奸笑\"&gt;&lt;/span&gt;",
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
    "content": "😘😘😘",
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
    "content": "64576",
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
    "content": "😇",
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
    "content": "🙆‍♂️",
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
    "content": "😀",
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
    "content": "🤯",
    "contentType": "word",
    "receiverId": 104,
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "deleted": 0,
    "createTime": "2021-10-26 10:25:21",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "617766e0ff924767c640c623",
    "senderId": 104,
    "senderName": "刘老师",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "content": "<img data-src=\"38\" data-type=\"face\" src=\"data:image/gif;base64,R0lGODlhGQAZAOYAAAAAAP///2oA0mwA0WsA0WcA1GgA1GYA02kA02UA1WUB1mcD1WgK2IQ332EA13wr3oxF4pRU5Z1j56Jr6bSI7b2X782w8+bX+V0E2b+b8NjC9vTu/GAZ3fn2/lYP3FMc3mAw4E4g31lW6GBc6T8+501u7i1j9hiL/Qip/yS1/xO5/xvA/wC+/wDI/wDE/wrI/wDO/wDV/wHS/w3T/wDY/wXa/wja/wDc/wDQ0wnCrwbImA2/iQ/AdwjHc1XXmQrCZwrCVQDFRxbCURPAQArCMQHDAAHAAAXDAAPDAAPAAAzCAhDDAxnEAS3GADnHAE3NAKHgcGfJAHzNAJ3OBbbVAt3gANbbBfDfAOfZCf/kAP/qNv7hAPveBvfcCP/dAO3WWP/UAP/LAP+/AP+qAP+WAP+GAP92AP9wAP9sAP9pAP9kAP9cAP9UAP9MAP9DAP+XdP83AP87AP8yAP8nAP/i3f8eAP9UPP/Hvv/m4v/w7v8ZAP8qEf86JP9VQ/+kmf///yH5BAEAAH8ALAAAAAAZABkAAAf/gH+Cg4SFhoeIiYqLjI2OhRsXFx2PgxUPCQaaBgoQFo0WDgIJICIjIyIcBgIMGooTBQolKzM1NDQ2MyklCQUTiBQIHyo3LTk/QkI8OTA3Kh8CEoYXBR4tMDxKRUtMTNpLOzAyIQgVhQ8GKDJDSE5UWFxdVlNNR0QwLhgJG4MaCCQ3fhSR4mVLGDFiwGTxIqXIEBonBkQYFCEdjiNRsogpgyYNmjNlwmRpqCNGiAL8/iwIEQMIky1i1KhpEyeOmzVpxGRxokTGCQEU/lwQYIKGEYJm1MzRs2ePnjpszoChgkRHvgd/MhA4cdHKGDVy9tARlMcOVDJZmhChQcJAhwkHcFDoeFmGjR48hfjIkSolSQwTAjRAcMDihxMvZtz0MXSnzhoxVIzg+EmhAYYWQZ6AOQPnzSE9bcZUUaIDRYIJD6wReRIGjRw/h/i4IXPlSA8WDiA08PDCx5cvb96MNeTnzRctUHy0wNCgkvPn0KMrCgQAOw==\">",
    "contentType": "word",
    "receiverId": 125,
    "receiverName": "广告",
    "receiverAvatar": "https://www.heqijiajiao.com:4436/happok/2021/10/17/28c317e3ca16499898375114021f67ac.jpeg",
    "deleted": 0,
    "createTime": "2021-10-26 10:24:32",
    "chatRoom": "8a33feecf955432e98670a5fedc60226"
  },
  {
    "id": "617766a8ff924767c640c622",
    "senderId": 104,
    "senderName": "刘老师",
    "senderAvatar": "https://www.heqijiajiao.com:4436/happok/2021/11/12/f47d4c368dba47caa8a9920db48a3c2b.jpg",
    "content": "55555",
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
    "content": "😁我是新的",
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
        color: #BEC0E0;
    }
    .right{
        width: 100%;
        display: flex;
        align-content:flex-start;
        align-items: flex-start;
        flex-direction: row-reverse;
        height: 100rpx;
        position:relative; 
        margin-top: 20rpx;
        .pic{
            width: 100rpx;
            height: 100rpx;
            border-radius: 50%;
        }
        .content2{
			background: #22233B;
			height: 100rpx;
			line-height: 100rpx;
			border-radius: 4px;
			font-size: 24rpx;
            padding: 0 40rpx;
            font-family: Source Han Sans CN;
            font-weight: 400;
            color: #BEC0E0;
            margin-right: 26rpx;
            position:relative; 
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
                border-color:#30324F #30324F #30324F #22233B;
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
        }
        .content2{
			background: #22233B;
			height: 100rpx;
			line-height: 100rpx;
			border-radius: 4px;
			font-size: 24rpx;
			padding: 0 40rpx;
			font-family: Source Han Sans CN;
			font-weight: 400;
			color: #BEC0E0;
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
                border-color: #30324F #22233B #30324F #30324F  ;
            }  
		}
    }
}
.callbacl{
    color: #BEC0E0;
    height: 100rpx;
    line-height: 100rpx;
    padding: 0 20rpx;
}		





</style>



