import React from 'react'
import CSSModules from 'react-css-modules'
// import bootstrap from 'theme/styles/bootstrap/css/bootstrap.min.css'
import styles from './correct-member.scss'
import { injectIntl } from 'react-intl'
import MemberSelector from '../member-selector/member-selector'
import Request from '../../../service/rest.service'
import Dialog from '../dialog/dialog'


const userNodeIdN = 'user_id'
const userNodeNameN = 'org.real_name'
const regNum = /^[1-9]\d*$/

@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class CorrectMember extends React.Component {
  static propTypes = {
    isApprove: React.PropTypes.bool,
    correctConfigList: React.PropTypes.array,
    onChange: React.PropTypes.func.isRequired,
    isMultiple: React.PropTypes.bool
  }
  constructor(props) {
    super(props)
    this.state = {
      correctConfigList: [],
      memberChooseShow: false,
      haveChoosedMember: [],
      currentConfigIndex: '',
      currentConfigIsApprove: false,
      infoDialogShow: false,
      dialogInfo: ''
    }
    this.addNewLineHandler = this.addNewLineHandler.bind(this)
    this.deleteConfig = this.deleteConfig.bind(this)
    this.addMember = this.addMember.bind(this)
    this.checkInputPercent = this.checkInputPercent.bind(this)
    this.onMemberChooseSubimt = this.onMemberChooseSubimt.bind(this)
    this.onMemberChooseClose = this.onMemberChooseClose.bind(this)
    this.refreshHaveChoosedMembers = this.refreshHaveChoosedMembers.bind(this)
    this.getCorrectorConfig = this.getCorrectorConfig.bind(this)
    this.setObj = this.setObj.bind(this)
    this.getPreList = this.getPreList.bind(this)
    this.getDisableList = this.getDisableList.bind(this)
    this.closeInfoDialog = this.closeInfoDialog.bind(this)
    this.createInfoDialog = this.createInfoDialog.bind(this)
    this.getSelectorMax = this.getSelectorMax.bind(this)
    this.renderTable = this.renderTable.bind(this)
    this.renderStaticTable = this.renderStaticTable.bind(this)
  }

  componentDidMount() {
    if (this.props.correctConfigList) {
      let params = this.getUserIdListParams(this.props.correctConfigList)
      if (params.length > 0) {
        Request.batchGetUserInfo(params).then(data => {
          this.setObj(this.props.correctConfigList, data.items)
        })
      }
    }
  }
  componentWillReceiveProps(props) {
    if (props.correctConfigList.length) {
      let params = this.getUserIdListParams(props.correctConfigList)
      if (params.length > 0) {
        Request.batchGetUserInfo(params).then(data => {
          this.setObj(props.correctConfigList, data.items)
        })
      }
    }
  }
  createInfoDialog(info) {
    this.setState({
      infoDialogShow: true,
      dialogInfo: info
    })
  }
  closeInfoDialog() {
    this.setState({
      infoDialogShow: false
    })
  }
  setObj(configs, items) {
    const { formatMessage } = this.props.intl

    configs.forEach((config, i) => {
      // 设置终审
      if (config.approver) {
        const person = items.find(item => item.user_id === config.approver);

        config.approverObj = {
          user_id: config.approver,
          [userNodeNameN]: person ?
            person.org_exinfo.real_name :
            formatMessage({ id: 'manager.common.correct_member.unknowname' })
        }
      }

      config.judgeObjs = config.judges.map(judge => {
        const person = items.find(item => item.user_id === judge);

        return {
          user_id: judge,
          [userNodeNameN]: person ?
            person.org_exinfo.real_name :
            formatMessage({ id: 'manager.common.correct_member.unknowname' })
        }
      })
    })

    this.state.correctConfigList = configs
    this.setState({
      correctConfigList: this.state.correctConfigList
    })
  }
  getUserIdListParams(realConfigs) {
    let params = []

    realConfigs.forEach(config => {
      config.judges.forEach(id => {
        if (params.indexOf(id) === -1) {
          params.push(id)
        }
      })

      if (params.indexOf(config.approver) === -1) {
        params.push(config.approver)
      }
    })

    return params.map(id => ({
      user_id: id
    }))
  }
  getCorrectorConfig() {
    return this.state.correctConfigList
  }
  isInArray(member, tarray) {
    for (var i = 0; i < tarray.length; i++) {
      var tempMember = tarray[i]
      if (member[userNodeIdN] === tempMember[userNodeIdN]) {
        return true
      }
    }
    return false
  }
  onMemberChooseSubimt(choosedMembers) {
    const { formatMessage } = this.props.intl
    //判断是否为本组的批改人员
    if (this.state.currentConfigIsApprove) {
      let approverObj = choosedMembers[0]
      let judgeObjs = this.state.correctConfigList[this.state.currentConfigIndex].judgeObjs
      if (this.isInArray(approverObj, judgeObjs)) {
        let info = formatMessage({ id: 'manager.common.correct_member.apprepeat' })
        this.createInfoDialog(info)
        this.setState({
          memberChooseShow: false
        })
        return
      }
    }
    //判断是否选择的人员列表中是否已经存在已分配任务的
    let preList = this.getPreList()
    let disableList = this.getDisableList(preList)
    let haveTaskMember = ''
    for (let i = 0; i < disableList.length; i++) {
      for (let j = 0; j < choosedMembers.length; j++) {
        if (disableList[i][userNodeIdN] == choosedMembers[j][userNodeIdN]) {
          haveTaskMember = disableList[i]
        }
      }
    }
    if (haveTaskMember) {
      let info = formatMessage({ id: 'manager.common.member_selector.havetask' }).replace('name', haveTaskMember[userNodeNameN])
      this.createInfoDialog(info)
      this.setState({
        memberChooseShow: false
      })
      return
    }

    if (this.state.currentConfigIsApprove) {//终审人员只能是一个
      this.state.correctConfigList[this.state.currentConfigIndex].approverObj = choosedMembers[0]
      this.state.correctConfigList[this.state.currentConfigIndex].approver = choosedMembers[0][userNodeIdN]
    } else {
      this.state.correctConfigList[this.state.currentConfigIndex].judgeObjs = choosedMembers
      let judges = []
      for (let i = 0; i < choosedMembers.length; i++) {
        judges.push(choosedMembers[i][userNodeIdN])
      }
      this.state.correctConfigList[this.state.currentConfigIndex].judges = judges
    }
    this.setState({
      memberChooseShow: false,
      correctConfigList: this.state.correctConfigList
    })
    this.props.onChange(this.state.correctConfigList)
  }
  refreshHaveChoosedMembers() {
    let newHaveChoosedList = []
    for (let i = 0; i < this.state.correctConfigList.length; i++) {
      if (this.state.correctConfigList[i].approverObj) {
        newHaveChoosedList.push(this.state.correctConfigList[i].approverObj)
      }
      newHaveChoosedList = newHaveChoosedList.concat(this.state.correctConfigList[i].judgeObjs)
    }
    return newHaveChoosedList
  }
  onMemberChooseClose(e) {
    this.setState({
      memberChooseShow: false
    })
  }
  addNewLineHandler() {
    let correctConfig = {
      judges: [], //批改人员user_id列表
      weight: '',
      approver: '',
      judgeObjs: [],  //批改人员对象列表
      approverObj: '',
      isNew: true
    }
    this.state.correctConfigList.push(correctConfig)
    this.setState({
      correctConfigList: this.state.correctConfigList
    })
    this.props.onChange(this.state.correctConfigList)
  }
  deleteConfig(e, configIndex) {
    const {correctConfigList} = this.state
    const item = correctConfigList[configIndex]

    if(item.isNew) {
      this.state.correctConfigList.splice(configIndex, 1)
      this.setState({
        correctConfigList: this.state.correctConfigList
      })
      this.props.onChange(this.state.correctConfigList)
    } else {
      this.setState({
        infoDialogShow: true,
        dialogInfo: '已分配任务不允许删除'
      })
    }
  }
  addMember(e, configIndex, isApprove) {
    const {correctConfigList} = this.state
    const item = correctConfigList[configIndex]

    e.stopPropagation()
    e.preventDefault()

    if(item.isNew) {
      this.setState({
        memberChooseShow: true,
        currentConfigIndex: configIndex,
        currentConfigIsApprove: isApprove ? true : false
      })
    } else {
      this.setState({
        infoDialogShow: true,
        dialogInfo: '已分配任务不允许修改人员'
      })
    }
  }
  checkInputPercent(e, configIndex) {
    e.stopPropagation()
    e.preventDefault()
    let percent = e.currentTarget.value
    let result = percent
    if (isNaN(percent)) {
      result = ''
    } else {
      if (!regNum.test(percent) && percent !== '0') {
        result = Number(percent)
      }
      if (percent < 0) {
        result = ''
      }
      if (percent > 100) {
        result = 100
      }
    }
    this.state.correctConfigList[configIndex].weight = result
    this.setState({
      correctConfigList: this.state.correctConfigList
    })
    this.props.onChange(this.state.correctConfigList)
  }
  createTableBody() {
    let bodyHtml = []
    const { isApprove } = this.props
    let { correctConfigList } = this.state

    if (correctConfigList.length === 0) {
      correctConfigList.push({
        judges: [],
        judgeObjs: [],
        approver: undefined,
        approverObj: undefined,
        weight: undefined,
        isNew: true
      })
    }

    return correctConfigList.map((config, i) => (
      <tr key={i + 'td-config'}>
        <td className="text-center" onClick={(event) => this.addMember(event, i, false)}>
          {this.createChooseMemberButton(i)}
        </td>
        {
          isApprove &&
          <td className="text-center" onClick={(event) => this.addMember(event, i, true)}>
            {this.createChooseMemberButton(i, true)}
          </td>
        }
        <td className="text-center" key={i + 'td-percent'}>{this.createPercentInput(i)}</td>
        <td className="text-center" key={i + 'td-action'}>{this.createDeleteButton(i)}</td>
      </tr>
    ))
  }
  createPercentInput(index) {
    let html = <div key={index + 'td-p-div'} styleName='input-group'>
      <input key={index + 'td-p-input'} type="text" style={{width: '4em'}} styleName='percent' maxLength='3'
        onChange={(event) => this.checkInputPercent(event, index)} value={this.state.correctConfigList[index].weight} />
      <span key={index + 'td-p-i'} styleName='percent-s'> %</span>
    </div>
    return html
  }
  createChooseMemberButton(index, isApprove) {
    const { formatMessage } = this.props.intl
    const { correctConfigList } = this.state
    const config = correctConfigList[index]
    const readOnlyStyle = {
      cursor: 'pointer',
      background: 'initial'
    }

    let html = (
      <div key={index + 'td-c-div'}>
        <input key={index + 'td-c-input'} type="text" styleName='form-ctrl' style={readOnlyStyle} readOnly/>
        <span key={index + 'td-c-add-i'} styleName='input-group-add' />
      </div>
    )

    // 终审
    if (isApprove && config.approver) {
      const realName = config.approverObj[userNodeNameN]
      html = (
        <div key={index + 'td-c-div'}>
            <span styleName='uname-l' title={realName || formatMessage({ id: 'manager.common.correct_member.unknowname' })}>
              {realName || formatMessage({ id: 'manager.common.correct_member.unknowname' })}
            </span>
        </div>
      )
    } else if(!isApprove && config.judges.length) {
      html = (
        <div key={index + 'td-c-div'}>
          <span styleName='uname-l'>
            {
              config.judgeObjs.map(judge => judge[userNodeNameN] || formatMessage({ id: 'manager.common.correct_member.unknowname' })).join('、')
            }
          </span>

        </div>
      )
    }

    return html
  }
  createDeleteButton(index) {
    return (
      <i key={index + 'td-del-i'} styleName='del' onClick={(event) => this.deleteConfig(event, index)} />
    )
  }
  createTableHead() {
    const { isApprove, intl } = this.props
    const { formatMessage } = intl

    return (
      <tr key='tr-config'>
        <th style={{background: '#dcdcdc', width: '300px'}} className="text-center" key='th-corrector'>{formatMessage({ id: 'manager.common.correct_member.corrector' })}</th>
        {
          isApprove &&
          <th style={{background: '#dcdcdc', width: '300px'}} className="text-center" key='th-approver'>{formatMessage({ id: 'manager.common.correct_member.approver' })}</th>
        }
        <th style={{background: '#dcdcdc', width: '300px'}} className="text-center" key='th-percent'>{formatMessage({ id: 'manager.common.correct_member.setweight' })}</th>
        <th style={{background: '#dcdcdc', width: '25px'}} className="text-center" key='th-action' styleName='action'></th>
      </tr>
    )
  }
  removeTArrFromIArr(tarr, iarr) {
    let rarr = []
    for (let i = 0; i < iarr.length; i++) {
      let isNeedRemove = false
      for (let j = 0; j < tarr.length; j++) {
        if (tarr[j][userNodeIdN] === iarr[i][userNodeIdN]) {
          isNeedRemove = true
        }
      }
      if (!isNeedRemove) {
        rarr.push(iarr[i])
      }
    }
    return rarr
  }
  getDisableList(preList) {
    this.state.haveChoosedMember = this.refreshHaveChoosedMembers()
    let disableList = this.state.haveChoosedMember.slice()
    disableList = this.removeTArrFromIArr(preList, disableList)
    return disableList
  }
  getPreList() {
    let preList = []
    if (this.state.correctConfigList[this.state.currentConfigIndex]) {
      if (this.state.currentConfigIsApprove) {
        if (this.state.correctConfigList[this.state.currentConfigIndex].approverObj) {
          preList.push(this.state.correctConfigList[this.state.currentConfigIndex].approverObj)
        }
      } else {
        preList = this.state.correctConfigList[this.state.currentConfigIndex].judgeObjs.slice()
      }
    }
    return preList
  }
  getSelectorMax() {
    if (this.state.currentConfigIsApprove) {
      return 1
    } else {
      if (this.props.isMultiple) {
        return 0
      } else {
        return 1
      }
    }
  }
  renderStaticTable() {
    const { formatMessage } = this.props.intl
    const { correctConfigList, isApprove } = this.state

    return (
      <table className="table table-striped table-hover table-bordered text-center">
        <thead>
          <tr key='tr-config'>
            <th style={{ background: '#dcdcdc', width: '300px' }} className="text-center" key='th-corrector'>{formatMessage({ id: 'manager.common.correct_member.corrector' })}</th>
            {
              isApprove &&
              <th style={{ background: '#dcdcdc', width: '300px' }} className="text-center" key='th-approver'>{formatMessage({ id: 'manager.common.correct_member.approver' })}</th>
            }
            <th style={{ background: '#dcdcdc', width: '300px' }} className="text-center" key='th-percent'>{formatMessage({ id: 'manager.common.correct_member.setweight' })}</th>
          </tr>
        </thead>
        <tbody>
          {
            correctConfigList.map(data => (
              <tr>
                <td className="text-center">
                  {data.judgeObjs.map(judge => judge[userNodeNameN] || formatMessage({ id: 'manager.common.correct_member.unknowname' })).join('、')}
                </td>
                {
                  isApprove &&
                  <td className="text-center">
                    {
                      data.approverObj[userNodeNameN] || formatMessage({ id: 'manager.common.correct_member.unknowname' })
                    }
                  </td>
                }
                <td className="text-center">
                  {
                    data.weight
                  }
                  %
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    )
  }
  renderTable() {
    const { formatMessage } = this.props.intl

    let preList = this.getPreList()
    let disableList = this.getDisableList(preList)

    let memberChooseComp = ''
    if (this.state.memberChooseShow) {
      memberChooseComp = <MemberSelector title={formatMessage({ id: 'manager.common.correct_member.addmember' })}
        onClickClose={this.onMemberChooseClose} onClickSubmit={this.onMemberChooseSubimt}
        preChoosedList={preList} disableChoosedList={[]} max={this.getSelectorMax()} />
    }
    let dialog = ''
    if (this.state.infoDialogShow) {
      dialog = <Dialog info={this.state.dialogInfo} onClose={this.closeInfoDialog} />
    }
    return (
      <div>
        <table className="table table-striped table-hover table-bordered text-center">
          <tbody>
            {this.createTableHead()}
            {this.createTableBody()}
          </tbody>
        </table>
        <div className="clearfix">
          <a href='javascript:;' className="fr" style={{marginBottom: '15px'}} onClick={this.addNewLineHandler}>
            {formatMessage({ id: 'manager.common.correct_member.addline' })}
          </a>
        </div>
        {memberChooseComp}
        {dialog}
      </div>
    )
  }
  render() {
    const {canEdit} = this.props

    return canEdit ? this.renderTable() : this.renderStaticTable()
  }
}
