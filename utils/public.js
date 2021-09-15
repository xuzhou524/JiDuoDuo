// 模块化
var common={
  // 截取最大字符串长度 后面拼接“...”
  getStrLen:function(str,len){
    if(str.length>len){
      return str.substr(0,len)+"..."
    }else{
      return str
    }
  },

  // 时间戳格式化
  getMyData:function(timestamp,formats){
    // formats格式包括
    // 1. Y-m-d
    // 2. Y-m-d H:i:s
    // 3. Y年m月d日
    // 4. Y年m月d日 H时i分
    formats = formats || 'Y-m-d'
    var zero = function(value){
      if(value < 10){
        return '0' + value
      }
      return value
    }
    timestamp = timestamp * 1000
    var myData = timestamp ? new Date(timestamp) : new Date()
    var year = myData.getFullYear()
    var month = zero(myData.getMonth() + 1)
    var day = zero(myData.getDate())
    var hour = zero(myData.getHours())
    var minite = zero(myData.getMinutes())
    var second = zero(myData.getSeconds())

    return formats.replace(/Y|m|d|H|i|s/ig,function(matches){
      return({
        Y:year,
        m:month,
        d:day,
        H:hour,
        i:minite,
        s:second
      })[matches];
    });
  }
}

module.exports = common