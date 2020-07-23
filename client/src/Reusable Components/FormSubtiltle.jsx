import React from 'react'

export default function FormSubtiltle({subtitle}) {
    return (
        <div className='formSubtitle'>
            <i className='material-icons subtitleHelper'>arrow_forward</i>
            <span style={{ fontSize: '14.3px' }}>
                {subtitle}
            </span>
        </div>
    )
}
