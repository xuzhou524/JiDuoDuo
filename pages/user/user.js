
// pages/user/user.js
Page({

  data: {
    userInfo: '',
    openid: '',
    version: '1.0.0'
  },

  login() {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        //把用户信息缓存到本地
        wx.setStorageSync('user', res.userInfo)
        this.setData({
          userInfo: res.userInfo
        })
        this.saveUserInfoToDb()
      },
      fail: (res) => {
        console.log("授权失败", res)
      }
    })
  },

  loginOut() {
    this.setData({
      userInfo: ''
    })
    wx.setStorageSync('user', null)
  },

  //登录成功，上传用户信息到数据库
  //如果已经存在用户信息，更新字段里面的最后登录时间
  saveUserInfoToDb() {
    const db_t_user = wx.cloud.database().collection('t_user')
    //获取openid
    wx.cloud.callFunction({
      name: 'userAppInfo'
    }).then(res => {
      this.setData({
        openid: res.result.openid
      })
      //判断用户表是否包含当前openid用户
      db_t_user
        .where({
          _openid: this.data.openid
        })
        .get()
        .then(res => {
          if (res.data.length > 0) {
            //更新已存在用户最后登录时间
            let item = res.data[0]
            db_t_user.doc(item._id)
              .update({
                data: {
                  lastTime: Date.parse(new Date())
                }
              }).then(res => {
                console.log("更新成功", res)
              })
          } else {
            //保存用户信息到数据库
            db_t_user.add({
              data: {
                nickName: this.data.userInfo.nickName,
                avatarUrl: this.data.userInfo.avatarUrl,
                gender: this.data.userInfo.gender,
                country: this.data.userInfo.country,
                province: this.data.userInfo.province,
                city: this.data.userInfo.city,
                language: this.data.userInfo.language,
                signTime: Date.parse(new Date()),
                lastTime: Date.parse(new Date())
              }
            }).then(res => {
              console.log("保存成功", res)
            })
          }
        })
    })
  },

  goHistoryBill() {
    if (this.data.userInfo) {
      wx.navigateTo({
        url: '/pages/historyBill/historyBill'
      })
    } else {
      this.login()
    }
  },

  onShow: function (options) {
    //取缓存的用户信息
    let user = wx.getStorageSync('user')
    //获取小程序信息
    let accountInfo = wx.getAccountInfoSync()
    console.log("33",accountInfo.miniProgram.version)
    this.setData({
      userInfo: user,
      version: accountInfo.miniProgram.version ? accountInfo.miniProgram.version : '1.0.0'
    })
  },

  onLoad: function (options) {
    //取缓存的用户信息
    let user = wx.getStorageSync('user')
    console.log("33",user)
    //获取小程序信息
    let accountInfo = wx.getAccountInfoSync()
    this.setData({
      userInfo: user,
      version: accountInfo.version ? accountInfo.version : '1.0.0'
    })
  }

})