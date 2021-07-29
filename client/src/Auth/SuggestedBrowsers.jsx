import React from 'react'

const webBrowsers = [
    {
        src: '/images/chromeLogo.png',
        alt: 'Google Chrome',
        title: 'Google Chrome',
        href: 'https://www.google.com/intl/pt-BR/chrome/'
    },
    {
        src: '/images/edgeLogo.png',
        alt: 'Microsoft Edge',
        title: 'Microsoft Edge',
        href: 'https://www.microsoft.com/pt-br/edge'
    },
    {
        src: '/images/operaLogo.png',
        alt: 'Opera',
        title: 'Opera',
        height: '1rem',
        href: 'https://www.opera.com/pt-br'
    }
]
    , imgSize = { height: 50, width: 55 }
export const SuggestedBrowsers = () => {
    return (
        <div className='flexColumn'>
            <h4 className='webBrowsers__title' >Melhor visualizado nos navegadores</h4>
            <div className='webBrowsers__container'>
                {
                    webBrowsers.map((webBrowser) =>
                        <img className='webBrowsers__logo'
                            {...webBrowser}
                            {...imgSize}
                        />
                    )
                }
            </div>
        </div>
    )
}
