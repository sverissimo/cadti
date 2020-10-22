import React from 'react'
import { Link } from 'react-router-dom'

import StoreHOC from './Store/StoreHOC'
import './home.css'

const featuredPosts = [
    {
        title: 'Veículos',
        date: '07/Nov',
        description:
            'Cadastre e altere os dados do veículo ou solicite sua baixa',
        link: '/veiculos',
        imageUrl: '/images/vehicles.jpg'
    },
    {
        title: 'Empresas',
        date: '07/Nov',
        description:
            'Cadastre e gerencie dados de empresas, sócios e procuradores',
        link: '/empresas',
        imageUrl: '/images/empresas12.jpg'
    },
    {
        title: 'Consultas',
        date: '03/Dez',
        description:
            'Consulte e gerencie dados de veículos, seguros e empresas',
        link: '/consultas',
        imageUrl: '/images/consultas2.jpg'
    },
    {
        title: 'Relatórios',
        date: '03/Dez',
        description:
            'Acompanhe a situação dos veículos por meio de gráficos e tabelas',
        link: '/relatorios',
        imageUrl: '/images/relatorios.jpg'
    },
]

function Home() {

    return (
        <React.Fragment>
            <div
                style={{
                    minHeight: '83vh',
                    width: '100%',
                    height: 'auto',
                }}>
                <main className="homeMainPost">
                    <h1>
                        CadTI - MG
                    </h1>
                    <h2>
                        Sistema de Cadastro do Transporte Intermunicipal de Minas Gerais
                    </h2>
                </main>
                <section className='homeCardsContainer'>
                    {featuredPosts.map(({ link, title, description, imageUrl }, i) => (
                        <div key={i} className='homeCard'>

                            <Link to={link} style={{ textDecoration: 'none' }}>
                                <div className='homeCard'>
                                    <div className="homeCardText">
                                        <h6 className="homeCardText" style={{ fontWeight: 500 }}>
                                            {title}
                                        </h6>
                                        <p className="homeCardText">
                                            {description}
                                        </p>

                                    </div>
                                    <div className='homeImage'>
                                        <img src={imageUrl} alt={title} className='homeImage' />
                                    </div>
                                </div>
                            </Link>

                        </div>
                    ))}
                </section>
            </div >
        </React.Fragment >
    )
}

export default StoreHOC(['logs/vehicleLogs'], Home)