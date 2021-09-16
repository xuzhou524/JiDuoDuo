var util = require('../../utils/util.js')

Page({

  data: {
    productName: '',
    addTime: util.formatDate(new Date()),
    productCount: '',
    productUnitPrice: '',
    productNote: '',
    productTotalAmount: ''
  },

  bindDateChange(e) {
    this.setData({
      addTime: e.detail.value
    })
  },

  doSubmit(e) {
    var totalAmount = e.detail.value.productCount * e.detail.value.productUnitPrice
    totalAmount = totalAmount.toFixed(2)
    this.setData({
      productName: e.detail.value.productName,
      productCount: e.detail.value.productCount,
      productUnitPrice: e.detail.value.productUnitPrice,
      productNote: e.detail.value.productNote,
      productTotalAmount: totalAmount
    })

    if (this.data.productName == '') {
      wx: wx.showToast({
        title: '请输入名称',
        icon: 'none'
      })
      return false
    }
    else if (this.data.productCount == '') {
      wx: wx.showToast({
        title: '请输入数量',
        icon: 'none'
      })
      return false
    }
    else if (this.data.productCount <= 0) {
      wx: wx.showToast({
        title: '请输入正确的数量',
        icon: 'none'
      })
      return false
    }
    this.saveFlowProduction()
  },

  saveFlowProduction() {
    const db_t_flowProduction = wx.cloud.database().collection('t_flowProduction')
    //保存流水记录到数据库
    db_t_flowProduction.add({
      data: {
        productName: this.data.productName,
        productCount: this.data.productCount,
        productUnitPrice: this.data.productUnitPrice,
        productNote: this.data.productNote,
        productAddTime: this.data.addTime,
        productAddTimeStamp: Date.parse(this.data.addTime.replace(/-/g, '/')),
        productTotalAmount: this.data.productTotalAmount,
        unit: "分"
      }
    }).then(res => {
      wx.showToast({
        title: '保存成功',
        icon: 'none'
      })
      wx.navigateBack()
    })
  }
})