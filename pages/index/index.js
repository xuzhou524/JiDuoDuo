// index.js
Page({
  data: {
    userInfo: '',
    openid: '',
    flowProduction: {
      totalAmount : 0,
      productionList : []
    }
  },

  getFlowProduction() {
    const db_t_flowProduction = wx.cloud.database().collection('t_flowProduction')
    wx.cloud.callFunction({
      name: 'userAppInfo'
    }).then(res => {
      this.setData({
        openid: res.result.openid
      })
      db_t_flowProduction.where({
          _openid: this.data.openid
        })
        .get()
        .then(res => {
          this.collatingDataStructures(res.data)
        })
    })
  },

//整理数据结构
  collatingDataStructures(data) {
    //获取当月的数据
    var myData = new Date()
    var year = myData.getFullYear()
    var month = myData.getMonth() + 1
    if (month < 10){
      month = '0' + month
    }

    var list = [] //当月产品流水产品
    var amount = 0 //本月总收入
    for(var i = 0;i < data.length;i++){
      let item = data[i]
      if (item.productAddTime.indexOf(year + "-" + month) >= 0){
        list.push(item)
        amount = amount + parseFloat(item.productTotalAmount)
      }
    }
    
    var productionList = [] //按天分拆，封装数据集合
    for(var i = 0;i < list.length; i++){
      let businessItem = list[i]
      var isContains = false
      for(var j = 0;j < productionList.length; j++){
        let item = productionList[j]
        if(item.itemTime == businessItem.productAddTime){
          //已经存在当前日的数据，拼接数据
          isContains = true
          item.itemAmount = parseFloat(item.itemAmount) + parseFloat(businessItem.productTotalAmount)
          item.itemList.push(businessItem)
        }

      }
      if(!isContains){
        //没包含新加数据
        var tempList = [businessItem]
        var tempItem = {
          itemTime:businessItem.productAddTime,
          itemAmount:businessItem.productTotalAmount,
          itemList:tempList
        }
        productionList.push(tempItem)
      }
    }

    //排序
    productionList.sort(function(item1,item2){
      return item2['itemTime'].toString().localeCompare(item1['itemTime'].toString())
    })

    this.setData({
      flowProduction: {
        totalAmount : amount,
        productionList : productionList
      }
    })
  },

  addProduct(e) {
    let user = wx.getStorageSync('user')
    if (user == undefined) {
      this.login()
    } else {
      wx.navigateTo({
        url: '/pages/add/add',
      })
    }
  },

  login() {
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        //把用户信息缓存到本地
        wx.setStorageSync('user', res.userInfo)
        this.setData({
          userInfo: res.userInfo,
          openid: res.openid
        })
        this.saveUserInfoToDb()
        this.getFlowProduction()
      },
      fail: (res) => {
        console.log("授权失败", res)
      }
    })
  },

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

  initializeData() {
    //取缓存的用户信息
    let user = wx.getStorageSync('user')
    if (user == undefined) {
      this.setData({
        userInfo: '',
        openid: '',
        flowProduction: ''
      })
    } else {
      this.setData({
        userInfo: user
      })
      this.getFlowProduction()
    }
  },

  goDetail(e) {
    wx.navigateTo({
      url: '/pages/editor/editor?product=' + e.currentTarget.dataset.product._id
    })
  },

  onLoad: function (options) {
    this.initializeData()
  },
  onShow: function () {
    this.initializeData()
  }
})