import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './correct-member-list.scss'
import {injectIntl} from 'react-intl'
import Request from '../../../service/rest.service'

const userNodeIdN = 'user_id'
const userNodeNameN = 'org.real_name'

@injectIntl
@CSSModules(styles, {allowMultiple: true})
export default class CorrectMemberList extends React.Component {
  static propTypes = {
    correctMemberList: React.PropTypes.array.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      correctMemberList: []
    }
    this.createTableBody = this.createTableBody.bind(this)
  }
  componentDidMount() {
    console.log(this.props.correctMemberList)
    if (this.props.correctMemberList) {
      let params = this.getUserIdListParams(this.props.correctMemberList)
      if (params.length>0) {
        Request.batchGetUserInfo(params).then(data => {
          this.setMemberName(this.props.correctMemberList,data.items)
        })
      }
    }
  }
  setMemberName(memberList,items){
    for (let i = 0; i < memberList.length; i++) {
      for (let j = 0; j < items.length; j++) {
        if (memberList[i].user_id == items[j].user_id) {
          memberList[i][userNodeNameN] = items[j].org_exinfo.real_name
        }
      }
    }
    this.state.correctMemberList =  memberList
    this.setState({
      correctMemberList: this.state.correctMemberList
    })
  }
  getUserIdListParams(memberList){
    let params = []
    for (let i = 0; i < memberList.length; i++) {
      let paraObj = {
        user_id: memberList[i].user_id
      }
      params.push(paraObj)
    }
    return params
  }
  createTableBody() {
    const {formatMessage} = this.props.intl
    let bodyHtml = []
    for (let i = 0; i < this.state.correctMemberList.length;i++) {
        let corrector = this.state.correctMemberList[i]
        let userName = corrector[userNodeNameN]
        bodyHtml.push(<tr key={i+'td-member'}>
          <td key={i+'td-corrector'}>
          <span key={i+'span-corrector'} styleName='uname-f' title={(userName || formatMessage({id: 'manager.common.correct_member.unknowname'}))}>
          {(userName || formatMessage({id: 'manager.common.correct_member.unknowname'}))}
          </span>
          <span key={i+'span-corrector-a'} styleName='uname-add'>
          {(corrector.type===1?('('+formatMessage({id: 'manager.common.correct_member.approve'}) +')'):'')}</span>
          </td>
          <td key={i+'td-percent'}>{corrector.weight+'%'}</td>
          <td key={i+'td-progress'}>{corrector.progress+'%'}</td>
        </tr>)
    }
    return bodyHtml
  }
  render() {
    const {formatMessage} = this.props.intl
    return (
      <div styleName='correct-warp'>
        <table>
          <tbody>
          <tr key='tr-config'>
            <th key='th-corrector' styleName='corrector'>
              {formatMessage({id: 'manager.common.correct_member.corrector'})}
            </th>
            <th key='th-percent' styleName='percent'>
              {formatMessage({id: 'manager.common.correct_member.setweight'})}
            </th>
            <th key='th-progress' styleName='progress'>
              {formatMessage({id: 'manager.common.correct_member.progress'})}
            </th>
          </tr>
          {this.createTableBody()}
          </tbody>
        </table>
      </div>
    )
  }
}
