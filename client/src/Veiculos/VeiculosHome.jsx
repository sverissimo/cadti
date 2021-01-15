import React from 'react'
import { Link } from 'react-router-dom'
import StoreHOC from '../Store/StoreHOC'

import './veiculos.scss'

const menuCards = [
    {
        title: 'Cadastro de Veículos',
        description: 'Cadastrar um novo veículo no sistema',
        imageUrl: '/images/add_new.jpg',
        link: '/cadastro'
    },
    {
        title: 'Alteração de dados',
        description: 'Alterar dados de um veículo',
        link: '/altDados',
        imageUrl: '/images/pen.png'
    },
    {
        title: 'Seguros',
        description: 'Atualizar seguros e apólices',
        link: '/seguros',
        imageUrl: "/images/car_insurance2.png"
    },
    {
        title: 'Laudos',
        description: 'Laudos de segurança veicular',
        link: '/laudos',
        imageUrl: "/images/laudos.png"
    },
    {
        title: 'Baixa',
        description: 'Baixa de veículos',
        link: '/baixaVeiculo',
        imageUrl: "/images/remove_doc.png"
    },
    {
        title: 'Configurações',
        description: 'Chassi, carrocerias, seguradoras, etc',
        link: '/config',
        imageUrl: "/images/config2.jpg"
    }
]

function VeiculosHome(props) {

    const { match, user } = props

    return (
        <div>
            <section className="jumbotron">
                <h1>
                    Veículos
                </h1>
                <p>
                    Selecione uma das opções abaixo.
                </p>
            </section>
            <section className="card">
                {
                    menuCards.map(({ title, link, imageUrl, description }, i) =>
                        user?.role !== 'admin' && link === '/config' ?      //Não renderiza a opção "Configurações" para usuários sem permissão
                            null :
                            <Link to={match.url + link} key={i} className="card__container">
                                <span className="card__image"> <img src={imageUrl} alt={title} /> </span>
                                <div className="card__text">
                                    <h3 >{title}</h3>
                                    <p > {description}</p>
                                </div>
                            </Link>
                    )}
            </section>
        </div >
    )
}

const collections = []
export default StoreHOC(collections, VeiculosHome)