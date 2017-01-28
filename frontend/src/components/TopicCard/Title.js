import React from 'react'
import { RIETextArea } from 'riek'

const Title = (props) => {
  if (props.authorizedToEdit) {
    return (
      <span className="title">
        <RIETextArea value={props.name}
          propName="name"
          change={props.onChange}
          className="titleWrapper"
          id="titleActivator"
          classEditing="riek-editing"
          editProps={{
            onKeyPress: e => {
              const ENTER = 13
              if (e.which === ENTER) {
                e.preventDefault()
                props.onChange({ name: e.target.value })
              }
            }
          }}
        />
      </span>
    )
  } else {
    return (
      <span className="title">
        <span className="titleWrapper">
          {props.name}
        </span>
      </span>
    )
  }
}

/*
 * Title.propTypes = {
 *   name: PropTypes.string,
 *   onChange: PropTypes.func,
 *   authorizedToEdit: PropTypes.bool
 * }
 */

export default Title
