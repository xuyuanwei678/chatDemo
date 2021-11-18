<template>
	<view>
		文字：{{text}}
	</view>
</template>

<script>
	export default{
		data(){
			return {
				text:''
			}
		},
		onLoad(e){
			
		},
		created(){
			this.$eventHub.$on("coma",this.mes)
		},
		onShow() {
			
			
			this.show_data();
		},
		methods:{
			//全局mixin便于下拉刷新与分享
			show_data(){
				
			},
			mes(data){
				console.log("lsd",data)
				this.text=data;
			}
		}
	}
</script>

<style>
	
</style>
