import React, { Component } from 'react'
import classnames from 'classnames'
import CSSModules from 'react-css-modules'
import { injectIntl } from 'react-intl'
import bootstrap from 'theme/styles/bootstrap/css/bootstrap.min.css'

import styles from './setting.css'
import CorrectMember from '../common/correct-member/correct-member'
import Dialog from '../common/dialog/dialog'
import Confirm from '../common/modal/confirm'

@injectIntl
@CSSModules(styles, { allowMultiple: true })
export default class Setting extends Component {
  static propTypes = {
    config: React.PropTypes.object.isRequired,
    onSave: React.PropTypes.func.isRequired,
    isFirst: React.PropTypes.bool
  }

  constructor(props) {
    super(props)

    this.state = {
      config: props.config,
      showSelectReviewerTable: false,
      showMsg: false,
      msg: undefined,
      showGoBackConfirm: false,
      showSaveConfirm: false,
      dirty: false,
      isFirst: props.isFirst
    }

    this.changeConfig = this.changeConfig.bind(this)
    this.showAddReviewerTable = this.showAddReviewerTable.bind(this)
    this.renderTable = this.renderTable.bind(this)
    this.changeCorrector = this.changeCorrector.bind(this)
    this.onCancelHandler = this.onCancelHandler.bind(this)
    this.onSaveHandler = this.onSaveHandler.bind(this)
    this.validateCorrector = this.validateCorrector.bind(this)
    this.renderOperation = this.renderOperation.bind(this)
    this.renderDialog = this.renderDialog.bind(this)
    this.closeDialog = this.closeDialog.bind(this)
    this.closeConfirm = this.closeConfirm.bind(this)
    this.openConfirm = this.openConfirm.bind(this)
    this.goBack = this.goBack.bind(this)
    this.onSubmitHandler = this.onSubmitHandler.bind(this)
  }

  componentWillReceiveProps(props) {
    const { config, isFirst } = props

    this.setState({
      config,
      isFirst
    });
  }

  changeConfig(event) {
    const { name } = event.target
    const { config } = this.state
    let { tableCfg } = this.state
    let getValue = {
      'is_show_examinee_name': () => { return event.target.value === 'true' },
      'is_multi_judge': () => {
        const val = event.target.value === 'true';

        return val
      },
      'objective_mark_strategy': () => { return event.target.value - 0 }
    }[name]

    config[name] = getValue()
    this.setState({
      config,
      dirty: true
    });
  }

  goBack() {
    window.close()
  }

  showAddReviewerTable(event) {
    event.stopPropagation()
    this.setState({
      showSelectReviewerTable: true
    })
  }

  changeCorrector(newCorrectors) {
    const { config } = this.state;

    config.judge_strategy.items = newCorrectors
    this.setState({
      config,
      dirty: true
    })
  }

  onSubmitHandler() {
    const { onSave } = this.props
    const { config } = this.state
    const { judge_strategy } = config
    const valid = this.validateConfigList(judge_strategy)

    this.setState({
      showSaveConfirm: false,
    })

    if (valid) {
      config.is_multi_judge || delete config.multi_judge_strategy

      onSave(window.examId || 'e03600fa-d18d-4e8a-a096-94afc66176c3', config)
        .then((result) => {
          judge_strategy.items.forEach(item => delete item.isNew)
          this.setState({
            isFirst: false,
            dirty: false,
            config
          })
        })
    }
  }

  onCancelHandler() {
    const { dirty } = this.state

    if (dirty) {
      this.openConfirm('showGoBackConfirm')
    } else {
      this.goBack()
    }
  }

  onSaveHandler() {
    const { isFirst } = this.state
    const { formatMessage } = this.props.intl
    const { dirty } = this.state

    if (this.state.config.is_multi_judge !== true && this.state.config.is_multi_judge !== false) {
      return this.setState({
        showMsg: true,
        msg: formatMessage({ id: 'correctSetting.noCorrectType' })
      })
    }

    if (isFirst || !dirty) {
      this.onSubmitHandler()
    } else {
      this.openConfirm('showSaveConfirm')
    }
  }

  validateConfigList(judge_strategy) {
    const { formatMessage } = this.props.intl

    // 请添加批改人员
    if (!judge_strategy.items.length || judge_strategy.items.length === 1 && judge_strategy.items[0].judges.length === 0) {
      this.setState({
        showMsg: true,
        msg: formatMessage({ id: 'correctSetting.addCorrectorTip' })
      })

      return false
    }

    for (let i = 0, l = judge_strategy.items.length; i < l; i++) {
      const item = judge_strategy.items[i]
      const valid = this.validateCorrector(item)

      if (valid !== true) {
        this.setState({
          showMsg: true,
          msg: valid
        })

        return false
      }
    }

    var totalWeight = judge_strategy.items.reduce((prev, current) => {
      return prev + (current.weight - 0);
    }, 0)

    if (totalWeight > 100) {
      this.setState({
        showMsg: true,
        // 当前配置的批改任务比例之和大于100 : 当前配置的批改任务比例之和小于100
        msg: formatMessage({ id: 'correctSetting.MoreThanPreset' })
      })

      return false
    }

    return true
  }

  closeDialog() {
    this.setState({
      showMsg: false
    })
  }

  validateCorrector(corrector, index) {
    let msgs = true;
    const { is_multi_judge } = this.state.config
    const { formatMessage } = this.props.intl

    if (is_multi_judge && corrector.judges.length < 2) {
      // 多人批改，请选择多个批改人
      msgs = formatMessage({ id: 'correctSetting.addMultipleCorrector' })
      return msgs;
    }

    if (!is_multi_judge) {
      delete corrector.approver
    }

    if (!corrector.judges.length) {
      // 有任务未分配批改人员
      msgs = formatMessage({ id: 'correctSetting.noCorrector' })
      return msgs;
    }

    if (corrector.weight <= 0) {
      // 有任务未分配任务比例
      msgs = formatMessage({ id: 'correctSetting.noDistribution' })
      return msgs;
    }

    if (is_multi_judge && !corrector.approver) {
      // 有任务未分配终审人员
      msgs = formatMessage({ id: 'correctSetting.noFinalCorrector' })
      return msgs;
    }

    if (is_multi_judge && corrector.judges.indexOf(corrector.approver) > -1) {
      // 批改人员和终审人员不能重复！请重新选择!
      msgs = formatMessage({ id: 'correctSetting.noRepeat' })
      return msgs
    }

    return msgs;
  }

  closeConfirm(confirmType) {
    this.setState({
      [confirmType]: false
    })
  }

  openConfirm(confirmType) {
    this.setState({
      [confirmType]: true
    })
  }

  renderSettingOptions() {
    const { formatMessage } = this.props.intl
    const { isFirst, showSelectReviewerTable } = this.state
    const minHeight = `${document.body.clientHeight - 100}px`
    const {
      subjective_mark_strategy, // 主观题策略
      objective_mark_strategy,  // 客观题策略
      is_show_examinee_name,  // 考生姓名
      is_multi_judge, // 多人批改
      judge_strategy  // 批改人员
    } = this.state.config

    return (
      <form style={{ minHeight }} className='form-horizontal'>
        <div className='control-group'>
          {/* 是否允许批改人员查看考生姓名 */}
          <label className='control-label' styleName="label-long required">{formatMessage({ id: 'correctSetting.canCheckStdName' })}：</label>
          <div className='controls'>
            <label className='radio' styleName='displayInLine'>
              {/* 允许 */}
              <input type='radio' onChange={this.changeConfig} className='form-control' name='is_show_examinee_name' value={true} checked={is_show_examinee_name} />
              {formatMessage({ id: 'common.admit' })}
            </label>
            <label className='radio' styleName='displayInLine'>
              {/* 不允许 */}
              <input type='radio' onChange={this.changeConfig} className='form-control' name='is_show_examinee_name' value={false} checked={!is_show_examinee_name} />
              {formatMessage({ id: 'common.noAdmit' })}
            </label>
          </div>
        </div>
        <div className='control-group'>
          {/* 客观题批改方式 */}
          <label className='control-label' styleName="label-long required">{formatMessage({ id: 'correctSetting.typeOfCheckObjQuestion' })}：</label>
          <div className='controls'>
            <label className='radio' styleName='displayInLine'>
              {/* 系统自动批改 */}
              <input type='radio' onChange={this.changeConfig} className='form-control' name='objective_mark_strategy' value={1} checked={objective_mark_strategy === 1} />
              {formatMessage({ id: 'correctSetting.systemCorrect' })}
            </label>
            <label className='radio' styleName='displayInLine'>
              {/* 人工批改 */}
              <input type='radio' onChange={this.changeConfig} className='form-control' name='objective_mark_strategy' value={0} checked={objective_mark_strategy === 0} />
              {formatMessage({ id: 'correctSetting.personCorrect' })}
            </label>
          </div>
        </div>
        <div className='control-group'>
          {/* 每组任务批改人数 */}
          <label className='control-label' styleName="label-long required">{formatMessage({ id: 'correctSetting.correctorNum' })}：</label>
          <div className='controls'>
            <label className='radio' styleName='displayInLine'>
              {/* 单人批改 */}
              <input type='radio' onChange={this.changeConfig} disabled={!isFirst} className='form-control' name='is_multi_judge' value={false} checked={is_multi_judge === false} />
              {formatMessage({ id: 'correctSetting.single' })}
            </label>
            <label className='radio' styleName='displayInLine'>
              {/* 多人批改 */}
              <input type='radio' onChange={this.changeConfig} disabled={!isFirst} className='form-control' name='is_multi_judge' value={true} checked={is_multi_judge === true} />
              {formatMessage({ id: 'correctSetting.multiple' })}
            </label>
          </div>
        </div>
        <div className='control-group'>
          {/* 批改人员 */}
          <label className='control-label' styleName="label-long required">{formatMessage({ id: 'correctSetting.corrector' })}：</label>
          <div className="controls">
            <a onClick={this.showAddReviewerTable} styleName='addReviewer' href="javascript:;">
              {
                // 添加批改人员 : 修改
                isFirst ? formatMessage({ id: 'correctSetting.addCorrector' }) : formatMessage({ id: 'common.edit' })
              }
            </a>
          </div>
        </div>
        {
          this.renderTable()
        }
      </form>
    )
  }

  renderTable() {
    const { judge_strategy } = this.props.config
    const {showSelectReviewerTable} = this.state
    const { is_multi_judge} = this.state.config
    const cls = classnames({
      'hide': !showSelectReviewerTable
    })

    return (
      <div>
        <CorrectMember canEdit={showSelectReviewerTable} correctConfigList={judge_strategy.items} isMultiple={is_multi_judge} isApprove={is_multi_judge} onChange={this.changeCorrector} />
      </div>
    )
  }

  renderOperation() {
    const { formatMessage } = this.props.intl
    const msg = {
      cancel: formatMessage({ id: 'manager.common.cancel' }),
      save: formatMessage({ id: 'manager.common.save' })
    }

    return (
      <div className="clearfix" styleName="operations">
        <button onClick={this.onCancelHandler} className="pull-left btn btn-default" >{msg.cancel}</button>
        <button onClick={this.onSaveHandler} className="pull-right btn btn-primary">{msg.save}</button>
      </div>
    )
  }

  renderDialog() {
    const { showMsg, msg } = this.state;

    return showMsg &&
      <Dialog info={msg} onClose={this.closeDialog} />
  }

  renderSaveConfirm() {
    const { showSaveConfirm } = this.state
    const { formatMessage } = this.props.intl

    return (
      // 提示 确定保存修改？
      <Confirm title={formatMessage({ id: 'common.tips' })} show={showSaveConfirm} msg={formatMessage({ id: 'common.submitEdit' })} onClose={() => { this.closeConfirm('showSaveConfirm') }} onOk={this.onSubmitHandler} />
    )
  }

  renderCancelConfirm() {
    const { showGoBackConfirm, isFirst } = this.state
    const { formatMessage } = this.props.intl

    return (
      // 提示 设置 : 修改 尚未保存，确定取消
      <Confirm title={formatMessage({ id: 'common.tips' })} show={showGoBackConfirm} msg={`${isFirst ? formatMessage({ id: 'common.setting' }) : formatMessage({ id: 'common.edit' })}${formatMessage({ id: 'common.confirmCancel' })}`} onClose={() => { this.closeConfirm('showGoBackConfirm') }} onOk={this.goBack} />
    )
  }

  render() {
    const { isFirst } = this.props;

    return (
      <div className="wrapper">
        {this.renderSettingOptions()}
        {this.state.showSelectReviewerTable && this.renderOperation()}
        {this.renderDialog()}
        {this.renderCancelConfirm()}
        {this.renderSaveConfirm()}
      </div>
    )
  }
}
