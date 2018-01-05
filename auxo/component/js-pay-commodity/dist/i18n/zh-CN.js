!function(k){
k = k || {};
k.payCommodity = {
    orderInfo: '订单信息',
    orderId: '订单编号',
    cover: '封面',
    title: '名称',
    createTime: '下单时间',
    price: '实付金额',
    payWay: '支付方式',
    noPayWay: '暂时不能支付',
    pay: '去支付',
    payHint: '下单后，请在30分钟内完成支付。超出30分钟再支付可能导致购买失败，需重新下单购买。',
    qrCode: '二维码',
    scanToPay: '扫描完成支付',
    orderSuccess: '您的订单<span>{{orderId}}</span>已成功',
    secondsToReturn: '<span>{{second}}</span>秒后返回商品',
    returnFailed: '返回结果失败，请稍后再试',
    retry: '刷新',
    allTotal: '金额总计：{{amount}}',
    discountTotal: '优惠总计：{{amount}}',
    actuallyTotal: '应付总额：<strong>{{amount}}</strong>',
    orderPaid: '该订单已支付过',
};

}(window.i18n = window.i18n || {})