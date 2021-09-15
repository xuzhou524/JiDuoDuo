const { getMyData } = require("../../utils/public")

Page({

  data: {
    openid:'',
    production:[]
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
    
    var productionList = [] //按月分拆，封装数据集合
    for(var i = 0;i < data.length; i++){
      let businessItem = data[i]
      let tempTime = getMyData(businessItem.productAddTimeStamp / 1000,"Y-m")

      var isContains = false
      for(var j = 0;j < productionList.length; j++){
        let item = productionList[j]
        if(item.itemTime == tempTime){
          isContains = true
          //已经存在当前日的数据，拼接数据
          item.itemAmount = parseFloat(item.itemAmount) + parseFloat(businessItem.productTotalAmount)
        }
      }
      if(!isContains){
        //没包含新加数据
        var tempItem = {
          itemTime:tempTime,
          itemAmount:businessItem.productTotalAmount,
        }
        productionList.push(tempItem)
      }
    }

    //排序
    productionList.sort(function(item1,item2){
      return item2['itemTime'].toString().localeCompare(item1['itemTime'].toString())
    })

    console.log(productionList)
    this.setData({
      production:productionList
    })
  },

  onLoad: function (options) {
    this.getFlowProduction()
  }

})