
<script>

//import jquery from '@/static/plugins/jquery-3.2.1.min.js'
	export default {
		onLaunch: function() {
			
			console.log('App Launch')
		},
		onShow: function() {
			//console.log("huihui",Owt)
			console.log('App Show')
		},
		onHide: function() {
			
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import '/node_modules/element-ui/lib/theme-chalk/index.css';
	@import "uview-ui/index.scss";
	@import './static/bootstrap.min.css';
</style>
