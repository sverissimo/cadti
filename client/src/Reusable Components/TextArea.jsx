import React from 'react'

const TextArea = props => {
    return (
        <>
            <label htmlFor={props.id} className='obs__label'>{props.label}</label>
            <textarea
                className='obs__textArea'
                cols="30"
                disabled={props.disabled === false ? false : true}
                {...props}
            />
        </>
    )
}

export default TextArea
