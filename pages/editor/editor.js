var util = require('../../utils/util.js')
Page({

  data: {
    id:'',
    productName: '',
    addTime: util.formatDate(new Date()),
    productCount: '',
    productUnitPrice: '',
    productNote: '',
    productTotalAmount: ''
  },

  doDelete(){
    const db_t_flowProduction = wx.cloud.database().collection('t_flowProduction')
    db_t_flowProduction
      .doc(this.data.id)
      .remove()
      .then(res => {
        console.log("删除成功", res)
        wx.navigateBack()
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
    this.updateFlowProduction()
  },

  updateFlowProduction() {
    const db_t_flowProduction = wx.cloud.database().collection('t_flowProduction')
    db_t_flowProduction
      .doc(this.data.id)
      .update({
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
      })
      .then(res => {
        console.log("更新成功", res)
        wx.navigateBack()
      })
  },

  onLoad: function (options) {
    this.setData({
      id:options.product
    })
    const db_t_flowProduction = wx.cloud.database().collection('t_flowProduction')
    db_t_flowProduction
      .doc(options.product)
      .get()
      .then(res => {
        console.log(res.data)
        this.setData({
          productName: res.data.productName,
          addTime: res.data.productAddTime,
          productCount: res.data.productCount,
          productUnitPrice: res.data.productUnitPrice,
          productNote: res.data.productNote,
          productTotalAmount: res.data.productTotalAmount
        })
      })
  }
})