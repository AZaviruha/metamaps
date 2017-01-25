import React from 'react'
import { RIETextArea } from 'riek'

const Title = (props) => {
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
}

/*
 * Title.propTypes = {
 *   name: PropTypes.string,
 *   onChange: PropTypes.func
 * }
 */

export default Title
