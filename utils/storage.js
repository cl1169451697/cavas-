var dtime = '_deadtime'

    /**
     * @param {*} k: key; v: 缓存值; t: 过期时间
     * @return {*}
     */ 
function set(k, v, t) {
  uni.setStorageSync(k, v)
  var seconds = parseInt(t);
  if (seconds > 0) {
    var timestamp = Date.parse(new Date());// 获取时间戳的毫秒数
    timestamp = timestamp / 1000 + seconds;// 时间戳 + 过期时间
    uni.setStorageSync(k + dtime, timestamp + "")
  } else {
    uni.removeStorageSync(k + dtime)
  }
 }


    /**
     * @param {*} k: 缓存名; def: 自定义读取失败的默认值(可选)
     * @return {*}
     */ 
function get(k, def) {
  var deadtime = parseInt(uni.getStorageSync(k + dtime))// 获取缓存的时间
  if (deadtime) {
    if (parseInt(deadtime) < Date.parse(new Date()) / 1000) { // 如果缓存时间小于 当前时间戳
      if (def) { return def; } else { return; }// 返回一个过期的错误
    }
  }
  var res = uni.getStorageSync(k);// 否则直接读取真正的缓存名, 并且返回出去
  if (res) {
    return res;
  } else {
    return def;
  }
}
 
 /**
	* 清除指定名字缓存
  * @param {*} k: 缓存名; 
  * @return {*}
  */ 
function remove(k) {
  uni.removeStorageSync(k);
  uni.removeStorageSync(k + dtime);
}
 
 /**
 	* 清除所有缓存(包括token)慎用!!!
  * @param {*}
  * @return {*}
  */ 
function clear() {
  uni.clearStorageSync();
}


module.exports = {
	set:set,
	get:get,
	remove:remove,
	clear:clear,
}