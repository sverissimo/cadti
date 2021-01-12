import React from 'react'
import { Link } from 'react-router-dom'
import StoreHOC from '../Store/StoreHOC'
import './empresas.scss'

const featuredPosts = [
    {
        title: 'Cadastrar',
        description: 'Cadastrar uma nova empresa no sistema.',
        imageUrl: '/images/addCompany21.png',
        link: '/empresas/cadastro'
    },
    {
        title: 'Alteração do Contrato Social',
        description: 'Alteração de dados da empresa ou contrato social',
        link: '/altContrato',
        imageUrl: '/images/pen2.png'
    },
    {
        title: 'Sócios',
        description: 'Visualizar ou editar dados dos sócios',
        link: '/empresas/socios',
        imageUrl: '/images/socios3.png'
    },
    {
        title: 'Procurações',
        description: 'Cadastrar procurações e procuradores',
        link: '/empresas/procuradores',
        imageUrl: '/images/procuradores31.png'
    },
]

const EmpresasHome = props => {
    const
        { user } = props,
        role = user?.role

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

            <main className='cardContainer' style={{ width: role === 'admin' ? '100%' : '90%', marginLeft: role === 'admin' ? '0' : '5%' }}>
                {featuredPosts.map(({ link, title, description, imageUrl }, i) =>
                    role !== 'admin' && link === '/empresas/cadastro' ?
                        null
                        :
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
                )}
            </main>
        </>
    )
}

const collections = []
export default StoreHOC(collections, EmpresasHome)