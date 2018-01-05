import _ from 'lodash'
/*
 * num:数字,
 * index:保留百分比分子小数点后几位(小数点后末位的0不会保留),
 * method:计算方法(ceil小数进1取整|floor舍去小数取整|round四舍五入)
 * */
export const decimalToPercent = function (num, index, method) {
  num = parseFloat(num)
  index = index ? parseInt(index) : 0
  let result = ''
  const carry = Math.pow(10, index)
  num = num * 100 * carry
  switch (method) {
    case 'ceil':
      result = Math.ceil(num)
      break
    case 'floor':
      result = Math.floor(num)
      break
    case 'round':
      result = Math.round(num)
      break
    default:
      result = Math.round(num)
  }
  result = result / carry + '%'
  return result
}

export const regCheckNumber = function (val) {
  let num = parseInt(val)
  if (!/^[0-9]*$/.test(num)) {
    num = 0;
  }
  return num
}

/*
{
  value: 值, 必传
  minLength: 最小长度, 默认为0
  maxLength: 最大长度, 必传
  noSymbol: 限制无符号，默认false
}
*/
export const regCheckInput = function (params = {}) {
  const str = _.trim(params.value)
  if(!str) return true
  if(!params.maxLength) return false
  if(params.minLength === undefined) params.minLength = 0
  if(params.noSymbol === undefined) params.noSymbol = false
  const regStr = params.noSymbol ? "^[0-9A-z\u4E00-\u9FA5]{" + params.minLength + "," + params.maxLength + "}$" : "[...]{" + params.minLength + "," + params.maxLength + "}$"
  const reg = new RegExp(regStr)
  return reg.test(str)
}

export const dotString = (text, max_length) => {
  if (typeof text !== 'string') return text
  if (text && text.length > 0 && text.length > max_length) {
    text = text.substring(0, max_length) + '...'
  }
  return text
}
