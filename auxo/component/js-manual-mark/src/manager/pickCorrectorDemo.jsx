import React, {Component} from 'react'
import MemberSelector from './common/member-selector/member-selector'
import CorrectMember from './common/correct-member/correct-member'
import Dialog from './common/dialog/dialog'
import Request from '../service/rest.service'
import CorrectMemberList from './common/correct-member-list/correct-member-list'
import {defineMessages, intlShape, injectIntl} from 'react-intl'

/**
 *  说明: demo中有3个组件使用展示
 *   ------------------------
 *   1.简易确认对话框-dialog
 *   ------------------------
 *   2.批改人员展示列表组件  -- 无法动态刷新,要刷新数据需要卸载组件重新创建
 *   ------------------------
 *   3.批改人员选择组件 -- 导入数据只会在一开始导入,一旦组件已经创建了,数据不会随着(props)correctConfigList的刷新而刷新
 *                         如果要实现随着correctConfigList刷新而刷新，请动态创建组件(卸载再创建)
 *   ------------------------
 **/

//批改人员展示列表组件所需数据形式
const correctMemberList = [
    {
        "id": "12345678-1234-1234-1234-1234567890ab",
        "type": 0,  //是否为终审人员
        "user_id": 305201, //user_id
        "weight": 10,  //批改比例,目前接口没有...
        "progress": 30  //进度
    },
    {
        "id": "12345678-1234-1234-1234-1234567890ab",
        "type": 1,
        "user_id": 851009,
        "weight": 10,
        "progress": 10
    },
    {
        "id": "12345678-1234-1234-1234-1234567890ab",
        "type": 1,
        "user_id": 1761860474,
        "weight": 12,
        "progress": 20
    }
]

@injectIntl
export default class pickCorrectorDemo extends Component {
  static propTypes = {
  }
  constructor(props) {
    super(props)
    this.state = {
      corectorConfigs : [
        {
            "judges": [0, 1],
            "weight": 10,
            "approver": 0
          },
          {
            "judges": [1, 2],
            "weight": 50,
            "approver": 0
          },
          {
            "judges": [2, 3],
            "weight": 40,
            "approver": 0
          }
      ],
      compShow: true,
      infoDialogShow: false,
      dialogInfo: '',
      correctMemberListShow:false
    }
    this.changeHandler1 = this.changeHandler1.bind(this)
    this.createComp = this.createComp.bind(this)
    this.closeInfoDialog = this.closeInfoDialog.bind(this)
    this.createInfoDialog = this.createInfoDialog.bind(this)
    this.switchCorrectMemberList = this.switchCorrectMemberList.bind(this)
    this.checkCorrectorConfig = this.checkCorrectorConfig.bind(this)
  }
  changeHandler1(configs) {
    /*批改人员选择组件相关*/
    //模拟一开始只有user_id 列表
    let realConfigs = []
    for (let i = 0 ; i < configs.length; i++) {
      let correctConfig = {}
      correctConfig.judges = configs[i].judges
      correctConfig.approver = configs[i].approver
      correctConfig.weight = configs[i].weight
      realConfigs.push(correctConfig)
    }
    this.state.corectorConfigs =  realConfigs
    this.setState({
      corectorConfigs: this.state.corectorConfigs
    })
  }
  changeHandler2(configs) {
    console.log('选择2的cofigList',configs)
  }
  createComp(configs) {
    this.setState({
      compShow: true
    })
  }
  /*批改人员选择组件相关end*/

  /*对话框相关*/
  createInfoDialog(){
    this.setState({
      infoDialogShow: true,
      dialogInfo: 'info'
    })
  }
  closeInfoDialog(){
    this.setState({
      infoDialogShow: false
    })
  }
  /*对话框相关end*/

  /*批改人员显示列表组件*/
  //需要用到request,因为mock时获取token比较慢,可能页面加载时还没有获取到导致获取user_name失败(实际中无此问题)
  //所以动态创建
  switchCorrectMemberList(){
    this.setState({
      correctMemberListShow: !this.state.correctMemberListShow
    })
  }
  /*批改人员显示列表组件end*/


  /*保存时检查人员是否都分配正确*/
  //因为这是最终点击保存时检查的,就没有放在组件中
  checkCorrectorConfig() {
    let checkConfigs = this.state.corectorConfigs
    let error = {
      judegsError:false, //有任务未分配批改人员时为true
      approverError:false, //有任务未分配终审人员时为true
      weightError:false  //任务比例不是100%时为true
    }
    if (checkConfigs&&checkConfigs.length>0) {
      let totalWeight = 0
      for (var i = 0; i < checkConfigs.length; i++) {
        let config = checkConfigs[i]
        totalWeight += Number(config.weight?config.weight:0)
        if (!config.judges || config.judges.length === 0) {
          error.judegsError = true
        }
        if (!config.approver) {
          error.approverError = true
        }
      }
      if (totalWeight !== 100) {
        console.log('totalWeight',totalWeight)
        error.weightError = true
      }
    }
    console.log('error',error)
  }
  /*保存时检查人员是否都分配正确end*/


  render() {
    let dialog = ''
    if (this.state.infoDialogShow) {
      dialog = <Dialog info={this.state.dialogInfo} onClose={this.closeInfoDialog}/>
    }
    let html = ''
    if (this.state.corectorConfigs.length>0 && this.state.compShow) {
      html = <CorrectMember isApprove={true} onChange={this.changeHandler2} correctConfigList={this.state.corectorConfigs}/>
    }
    let correctMember = ''
    if (this.state.correctMemberListShow) {
      correctMember = <CorrectMemberList correctMemberList={correctMemberList} />
    }
    return (
      <div>
        <button onClick={this.createComp}>创建新的批改人员选择组件,并导入现有的数据</button><br/>
        <button onClick={this.createInfoDialog}>创建新的确认对话框</button><br/>
        <button onClick={this.switchCorrectMemberList}>打卡/关闭CorrectMemberList组件</button><br/>
        <button onClick={this.checkCorrectorConfig}>检查选择批改人员组件1的配置是否正确</button><br/>
        <CorrectMember isApprove={true} isMultiple={true} onChange={this.changeHandler1} />
        {html}
        {dialog}
        {correctMember}
      </div>
    )
  }
}
