<template>
	<view class="shareCode layout-wrap">
		<xuan-loading
		    ref="loading"
		    :custom="false"
		    :shadeClick="false"
		    :type="1"
		   >
		    <!-- <view class="test">自定义</view> -->
		</xuan-loading>
		<nav-bar :backState="1000" :bgColor="themeBgColor"  fontColor="#ccc"></nav-bar>
		<view class="content-wrap">
			<view class="affection">
				<view class="logo">
					<image src="../../../static/img/daily/logo.png" mode=""></image>
				</view>
				<view class="share-code">
					<view class="code-ul">
						<view class="code-li" v-for="(item,index) in getrelativeCode" :key="index">{{item}}</view>
					</view>
					<view class="code-item" @tap="regenerate">重新获取</view>
				</view>
				<view class="share-footer">
					<view @tap="shateCode">
						<text class="iconfont icon-fenxiang"></text>
						<text>分享亲情码到微信获取关注</text>
					</view>
				</view>
			</view>
			<view class="prompt">
			   <text>温馨提示：</text>
			   <text>请把您的健康状态分享给值得信任的亲友哦！
               请勿随意转发。</text>
			</view>
			<view class="canvas-wrap" :class="openShow?'open-wrap':'guan-wrap'">
				<view class="top-img">
					<image class="canvas-img"  :src="tempPath" mode="widthFix" @tap="previewImage"></image>
					
				</view>
				<view class="save-button">
					<button class="bom-btn" @tap="quxiao">返回</button>
					<button class="bom-btn" @tap="handleShare">保存图片</button>
				</view>
				<view  :class="openShow?'C_scroll':''" @tap="quxiao"></view>
			</view>
			<view class="canvas1">
				<canvas id="c1" type="2d" class="canvas1"></canvas>
			</view>
		</view>
	</view>
</template>

<script>
	import navBar from '@/components/navBar/index.vue'
	import haibaoUtil  from '../../../utils/haibaoUill.js'
	import xuanLoading from '@/components/xuan-loading/xuan-loading'
	import storage from '../../../utils/storage.js'
	import {mapGetters,mapActions} from "vuex"
	const storageTime = 5 * 60 // 五分钟
	export default{
		data(){
			return{
				codeList:[],
				currentIndex: 0,
				qr: '',
				nickName: [1,2,3,4,5,6],
				openShow:false,
				tempPath:'', // 图片临时地址
				avatarUrl:'../../../static/img/base/green.png',// 高于前天
				exceed: '../../../static/img/daily/share-bg.png', // 低于前天
			}
		},
		onLoad(){
			this.getCode()
			this.$refs.loading.close();
			wx.showShareMenu({ // 开启分享
				withShareTicket:true,			
				menus:['shareAppMessage','shareTimeline']
			})
		},
		computed: {
			...mapGetters(["getrelativeCode"]),
		},
		methods:{
			...mapActions(['reqRelativeCode']),
			getCode(){
				let str = '12345';
				let arr = str.split('')
				this.codeList = arr
			},
			regenerate(){// 生成亲情码
				this.reqRelativeCode(this)
				storage.remove('tempPath')// 清楚code缓存 和图片缓存
				storage.remove('relativeCode')
			},
			shateCode(){ // 分享亲情码
				let that = this;
				var time = storage.get('tempPath')
				if(time){
					console.log(time)
					this.tempPath = time
					that.openShow = true
				}else{
					wx.showLoading({
					  title: '生成中~',
					});
					that.getuser()// 生成海报
					setTimeout(function(){
						that.openShow = true
						wx.hideLoading()
					},1000)
				}
			},
			quxiao(){ // 取消保存
				this.openShow = false
			},
		    async handleShare(){// 保存
				try{
					await  haibaoUtil.saveHaibao(this.tempPath);
					 wx.hideLoading();
					 wx.showToast({
						 title:'已存至相册中',
					 });
				}catch(e) {
					wx.showToast({
						title:'保存失败',
						icon:'none'
					})
				}
			},
			previewImage(){ // 点击图片保存
				uni.previewImage({
					urls:[this.tempPath]
				})
			},
			async getuser(){ // 生成canvas
				let that = this
				const {canvas:canvasc1, ctx:ctxc1} = await haibaoUtil.createHaibao('c1')// 获取cnavas画图节点
				that.renderType0(canvasc1, ctxc1, 0); // 调用canvas画图
			},
			async renderType0(canvas, ctx, arrayIndex) { // cnavas画图
			  const imgBg = await haibaoUtil.loadImg(canvas, require('../../../static/img/daily/share-bg.png'));// 背景图
			  const imgAvatar = await haibaoUtil.loadImg(canvas, require('../../../static/img/daily/share-bg.png'));// 头像图
			 
			 /* ------------画海报背景图片-------------- */
			  ctx.drawImage(imgBg, 0, 0, canvas.width/haibaoUtil.dpr, canvas.height/haibaoUtil.dpr);
			  
			// 画圆形
			  for(let i = 1 ; i <= 6; i++){
				  haibaoUtil.toDrawRadiusRect({
					left: haibaoUtil.computedWAndD(90 * i - 5), // x轴
					top: haibaoUtil.computedWAndD(250),// y轴
					width: haibaoUtil.computedWAndD(80),// 宽度
					height: haibaoUtil.computedWAndD(80),// 高度
					borderRadius: haibaoUtil.computedWAndD(80),// 圆度
				  }, ctx);
					ctx.fillStyle = '#f3f3f3';
					ctx.fill();
			  }
			  
			// 画分享码子
			  for(let i = 1; i <= 6; i++){
				  let x = [115,205,295,390,480,570]
				  ctx.font = `normal bold ${haibaoUtil.computedWAndD(40)}px sans-serif`;
				  ctx.fillStyle = "#333333";
				  // 文字, x轴, y轴
				  ctx.fillText(this.getrelativeCode[i - 1], haibaoUtil.computedWAndD(90 * i + 24), haibaoUtil.computedWAndD(305));//文字
			  }
			  
			// 画分享文案
				ctx.font = `normal ${haibaoUtil.computedWAndD(25)}px sans-serif`;
				ctx.fillStyle = "#ACACAC"
				ctx.fillText('亲情码有效期为5分钟', haibaoUtil.computedWAndD(230),haibaoUtil.computedWAndD(420))
				
			// 画提示文字
				ctx.font = `normal  ${haibaoUtil.computedWAndD(30)}px sans-serif`;
				ctx.fillStyle = "#333"
				ctx.fillText('请保存图片，并转发给微信好友', haibaoUtil.computedWAndD(150),haibaoUtil.computedWAndD(480))
			
			// 画底部提示文字
				ctx.font = `normal ${haibaoUtil.computedWAndD(25)}px sans-serif`;
				ctx.fillStyle = "#ACACAC"
				ctx.fillText('扫描二维码去关注吧~', haibaoUtil.computedWAndD(242),haibaoUtil.computedWAndD(870))			
				
			  try {
				const tempPath = await haibaoUtil.createHaibaoUrl(canvas);
				this.$refs.loading.close();
				this.tempPath = tempPath;
				console.log(tempPath,'图片地址')
				// 缓存到本地,有效期5分钟
				storage.set('tempPath',this.tempPath, 5 * 60)
			  } catch(e) {
				console.error(e);
				logger.error('保存海报图片失败, 请稍后重试~',e);
			  }
			},
		},
		components:{
			navBar,
			xuanLoading
		}
	}
</script>

<style lang="scss" scoped>
	@import 'shareCode.scss'
</style>
