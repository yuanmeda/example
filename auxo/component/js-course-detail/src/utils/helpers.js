import config from './config'
// import { checkMac } from 'actions/uc'
// import Auth from 'utils/auth'
// import datetime from 'nd-datetime'
const { CS_RES } = config
/**
 * 根据 dentryId 获取下载地址
 * @method getSrcFromId
 * @param  {String}        dentryId dentryId
 * @return {String}                 下载地址
 */
export const getSrcFromId = dentryId => `${CS_RES.base}/download?dentryId=${dentryId}`

/**
 * 根据 base64 编码的 MacContent 获取 Mac 信息
 * @method getMac
 * @param  {String} mac base64 编码的 MacContent
 * @return {Object}     Mac 信息
 */
// export const getMac = async mac => {
//   const macToken = {}
//   if (mac) {
//     decodeURIComponent(atob(mac)).trim().split(',').map(s => {
//       const index = s.indexOf('=')
//       if (index > -1) {
//         const key = s.substring(0, index).trim()
//         let value = s.substring(index + 1).trim()
//         value = value.substring(1, value.length - 1)
//         if (key === 'MAC id') {
//           macToken['access_token'] = value
//         } else {
//           macToken[key] = value
//         }
//       }
//     })
//     try {
//       const data = await checkMac(macToken['access_token'], {
//         host: location.host,
//         nonce: macToken.nonce,
//         mac: macToken.mac,
//         http_method: 'GET',
//         request_uri: '/'
//       })
//       Object.assign(macToken, data)
//       Auth.configure(macToken.access_token, macToken.mac_key, datetime(data.server_time).toNumber() - Date.now(), macToken.expires_at)
//       return macToken
//     } catch (e) {
//       throw e
//     }
//   }
// }

/**
 * post message to parent
 * @method postMessage
 * @param  {String}    msg JSON String
 */
// export const postMessage = (msg) => {
//   if (window.parent && typeof window.parent.postmessage === 'function') {
//     window.parent.postmessage(msg)
//   } else {
//     console.log(msg)
//   }
// }
