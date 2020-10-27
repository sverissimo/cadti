import React from 'react'
import { Link } from 'react-router-dom'

import './empresas.scss'

const featuredPosts = [
    {
        title: 'Cadastrar',
        date: '07/Nov',
        description:
            'Cadastrar uma nova empresa no sistema.',
        imageUrl: '/images/addCompany21.png',
        link: '/empresas/cadastro'
    },
    {
        title: 'Alteração do Contrato Social',
        date: '07/Nov',
        description:
            'Alteração de dados da empresa ou contrato social',
        link: '/altContrato',
        imageUrl: '/images/pen2.png'
    },
    {
        title: 'Contrato Social',
        date: '07/Nov',
        description:
            'Gerenciar sócios e alterações de contrato social',
        link: '/empresas/socios',
        imageUrl: '/images/socios3.png'
    },
    {
        title: 'Procurações',
        date: '07/Nov',
        description:
            'Cadastrar procurações e procuradores',
        link: '/empresas/procuradores',
        imageUrl: '/images/procuradores31.png'
    },
]

export default function () {

    return (
        <>
            <section className='jumbo'>
                <div>
                    <h1 className='jumbo__title'>
                        Empresas
                    </h1>
                    <p className='jumbo__description'>
                        Selecione uma das opções abaixo.
                    </p>
                </div>
            </section>

            <main className='cardContainer'>
                {featuredPosts.map(({ link, title, description, imageUrl }, i) => (
                    <Link to={link} style={{ textDecoration: 'none' }} key={i}>

                        <div className='cardE'>
                            <div className='cardE__text'>
                                <h3>
                                    {title}
                                </h3>
                                <p>
                                    {description}
                                </p>
                            </div>
                            <figure className='cardE__image'>
                                <img src={imageUrl} alt="" />
                            </figure>
                        </div>
                    </Link>
                ))}
            </main>
        </>
    )
}