import React from 'react'
import CSSModules from 'react-css-modules'

import styles from './table.css'

function isFunction(func) {
  return typeof func === 'function'
}

const Table = ({ config, items, ...otherProps }) => {
  const {columns, rowKey} = config;
  return (
    <table {...otherProps} styleName="table">
      <thead>
        <tr>
          {
            columns.map(col => (
              <th key={col.text}>{col.text}</th>
            ))
          }
        </tr>
      </thead>
      <tbody>
        {
          items.map((item, index) => (
            <tr key={item[rowKey]}>
              {
                columns.map(col => (
                  <td key={col.text}>
                    {
                      isFunction(col.render) ? col.render(item[col.key], item, index, items) : item[col.key]
                    }
                  </td>
                ))
              }
            </tr>
          ))
        }
      </tbody>
    </table>
  )
}

Table.propTypes = {
  config: React.PropTypes.object.isRequired,
  items: React.PropTypes.array,
  otherProps: React.PropTypes.any
}

export default CSSModules(styles, {allowMultiple: true})(Table)
