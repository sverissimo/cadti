import React from 'react'

export default function FormSubtiltle({ subtitle, style = {} }) {
    return (
        <div className='subtitle' style={style}>
            <i className='material-icons subtitle__helper'>arrow_forward</i>
            <span className='subtitle__text'>
                {subtitle}
            </span>
        </div>
    )
}
