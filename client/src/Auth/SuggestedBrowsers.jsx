import React from 'react'

const
    imgSize = { height: 60, width: 70 }
    , webBrowsers = [
        {
            src: '/images/chromeLogo.png',
            alt: 'Google Chrome',
            title: 'Google Chrome',
            href: 'https://www.google.com/intl/pt-BR/chrome/',
            ...imgSize
        },
        {
            src: '/images/edgeLogo.png',
            alt: 'Microsoft Edge',
            title: 'Microsoft Edge',
            href: 'https://www.microsoft.com/pt-br/edge',
            ...imgSize
        },
        {
            src: '/images/operaLogo.png',
            alt: 'Opera',
            title: 'Opera',
            height: '1rem',
            href: 'https://www.opera.com/pt-br',
            ...imgSize
        }
    ]

export const SuggestedBrowsers = () => {
    return (
        <div className='flexColumn'>
            <h4 className='webBrowsers__title' >Melhor visualizado nos navegadores</h4>
            <div className='webBrowsers__container'>
                {
                    webBrowsers.map((webBrowser, index) =>
                        <a
                            key={index}
                            href={webBrowser.href}
                            target='_blank'
                            rel="noopener noreferrer"
                        >
                            <img
                                className='webBrowsers__logo'
                                alt={webBrowser.alt}
                                {...webBrowser}
                            />
                        </a>
                    )
                }
            </div>
        </div>
    )
}
