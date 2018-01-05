import React from 'react'

class Container extends React.Component {
  static propTypes = {
    children: React.PropTypes.element
  }
  render() {
    return (
      <div className='main'>
        {this.props.children}
      </div>
    )
  }
}

export default Container
