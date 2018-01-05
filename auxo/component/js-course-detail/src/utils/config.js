// 本地模拟
const SIMULATION = 0
// 开发
const DEVELOPMENT = 1
// 测试
const DEBUG = 2
// 生产
const PRODUCTION = 4
// 预生产
const PREPRODUCTION = 8
// 压测
const PRESSURE = 16
// 亚马逊
const AWS = 32
// 加利福利亚
const AWSCA = 64

const LOC_PROTOCOL = location.protocol + '//'
const LOC_HOST = location.host
// host === hostname:port
const LOC_HOSTNAME = location.hostname

/**
 * @constant {number} ENV
 */
const ENV = (() => {
  switch (LOC_HOSTNAME) {
    case '127.0.0.1':
      return DEVELOPMENT
    case 'localhost':
      return DEVELOPMENT
    default:
      if (/\d+\.\d+\.\d+\.\d+/.test(LOC_HOSTNAME)) {
        return DEVELOPMENT
      }
      if (/\.dev\.web\.nd$/.test(LOC_HOSTNAME)) {
        return DEVELOPMENT
      }
      if (/\.debug\.web\.nd$/.test(LOC_HOSTNAME)) {
        return DEBUG
      }
      if (/\.qa\.web\.sdp\.101\.com$/.test(LOC_HOSTNAME)) {
        return PRESSURE
      }
      if (/\.beta\.web\.sdp\.101\.com$/.test(LOC_HOSTNAME)) {
        return PREPRODUCTION
      }
      if (/\.aws\.101\.com$/.test(LOC_HOSTNAME)) {
        return AWS
      }
      if (/\.awsca\.101\.com$/.test(LOC_HOSTNAME)) {
        return AWSCA
      }
      return PRODUCTION
  }
})()

const LOC_RES = {
  module: 'loc',
  protocol: LOC_PROTOCOL,
  host: LOC_HOST,
  ver: 'v0.1'
}

let UC_RES = {
  module: 'uc',
  protocol: 'https://',
  ver: 'v0.93'
}
let CS_RES = {
  module: 'cs',
  protocol: 'https://',
  ver: 'v0.1'
}

let LG_RES = {
  module: 'gateway',
  protocol: 'https://',
  ver: 'v1'
}

let LA_RES = {
  module: 'api',
  protocol: 'https://',
  ver: 'v1'
}

switch (ENV) {
  case DEVELOPMENT:
    LG_RES.protocol = 'http://'
    LG_RES.host = 'lecturer-gateway.dev.web.nd'
    break
  case DEBUG:
    LG_RES.protocol = 'http://'
    LG_RES.host = 'lecturer-gateway.debug.web.nd'
    break
  case PREPRODUCTION:
    LG_RES.host = 'lecturer-gateway.beta.101.com'
    break
  case PRESSURE:
    LG_RES.host = 'lecturer-gateway.qa.101.com'
    break
  case PRODUCTION:
    LG_RES.host = 'lecturer-gateway.sdp.101.com'
    break
  case AWS:
    LG_RES.host = 'lecturer-gateway.aws.101.com'
    break
  case AWSCA:
    LG_RES.host = 'lecturer-gateway.awsca.101.com'
    break
  default:
    LG_RES = LOC_RES
}

switch (ENV) {
  case DEVELOPMENT:
    LA_RES.protocol = 'http://'
    LA_RES.host = 'lecturer-api.dev.web.nd'
    break
  case DEBUG:
    LA_RES.protocol = 'http://'
    LA_RES.host = 'lecturer-api.debug.web.nd'
    break
  case PREPRODUCTION:
    LA_RES.host = 'lecturer-api.beta.101.com'
    break
  case PRESSURE:
    LA_RES.host = 'lecturer-api.qa.101.com'
    break
  case PRODUCTION:
    LA_RES.host = 'lecturer-api.sdp.101.com'
    break
  case AWS:
    LA_RES.host = 'lecturer-api.aws.101.com'
    break
  case AWSCA:
    LA_RES.host = 'lecturer-api.awsca.101.com'
    break
  default:
    LA_RES = LOC_RES
}

switch (ENV) {
  case DEVELOPMENT:
  case DEBUG:
  case PREPRODUCTION:
  case PRESSURE:
    UC_RES.host = 'ucbetapi.101.com'
    CS_RES.host = 'betacs.101.com'
    break
  case PRODUCTION:
    UC_RES.host = 'aqapi.101.com'
    CS_RES.host = 'cs.101.com'
    break
  case AWS:
    UC_RES.host = 'awsuc.101.com'
    CS_RES.host = 'awscs.101.com'
    break
  case AWSCA:
    UC_RES.host = 'uc-awsca.101.com'
    CS_RES.host = 'cs-awsca.101.com'
    break
  default:
    UC_RES = LOC_RES
    CS_RES = LOC_RES
}

/**
 * @constant {string} DATETIME_FORMAT 默认的时间日期格式
 */
const DATETIME_FORMAT = 'yyyy-MM-dd hh:mm:ss'

/**
 * @constant {string} DATE_FORMAT 默认的日期格式
 */
const DATE_FORMAT = 'yyyy-MM-dd'

/**
 * @constant {string} TIME_FORMAT 默认的时间格式
 */
const TIME_FORMAT = 'hh:mm:ss'

/**
 * @constant {string} TOAST_DURATION 默认提示信息显示毫秒数
 */
const TOAST_DURATION = 3000

/**
 * @constant {object}  I18N 多语言对应
 */
const I18N = {
  'zh-CN': '\u7b80\u4f53\u4e2d\u6587',
  'en-US': 'English',
  'id-ID': 'Bahasa Indonesia'
}

const config = {
  SIMULATION,
  DEVELOPMENT,
  DEBUG,
  PRODUCTION,
  PREPRODUCTION,
  PRESSURE,
  AWS,
  ENV,
  LOC_RES,
  UC_RES,
  CS_RES,
  LG_RES,
  LA_RES,
  DATETIME_FORMAT,
  DATE_FORMAT,
  TIME_FORMAT,
  TOAST_DURATION,
  I18N
}

Object.keys(config).map(key => {
  if (/^(?!LOC).+_RES$/.test(key)) {
    const { protocol, host, ver } = config[key]
    config[key].base = `${protocol}${host}/${ver}`
  }
})

export default config
