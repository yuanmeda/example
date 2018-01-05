import React from 'react'
import Preview from './Preview'

class PreviewList extends React.Component {
  static propTypes = {
    articleList: React.PropTypes.arrayOf(React.PropTypes.object),
    articleGet: React.PropTypes.func,
    push: React.PropTypes.func
  }
  componentDidMount() {
    this.props.articleGet()
  }
  render() {
    const {articleList} = this.props
    if (articleList === undefined) {
      return (<div />)
    }
    return (
      <div>
        {articleList.map(item => {
          return <Preview {...item} key={item.id} push={this.props.push} />
        })}
      </div>
    )
  }
}

export default PreviewList
