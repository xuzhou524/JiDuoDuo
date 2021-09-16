// app.js
App({
  onLaunch() {
    //云开发环境初始化
    wx.cloud.init({
      env:"cloud1-7gfvy37r6636b6c7"
    }),
    wx.setStorageSync('user', null)
  }
})
