import React from 'react'
import { Link } from 'react-router-dom'
import './veiculos.scss'

const menuCards = [
    {
        title: 'Cadastro de Veículos',
        date: '07/Nov',
        description:
            'Cadastrar um novo veículo no sistema',
        imageUrl: '/images/add_new.jpg',
        link: '/cadastro'
    },
    {
        title: 'Alteração de dados',
        date: '07/Nov',
        description:
            'Alterar dados de um veículo',
        link: '/altDados',
        imageUrl: '/images/pen.png'
    },
    {
        title: 'Seguros',
        date: '07/Nov',
        description:
            'Atualizar seguros e apólices',
        link: '/seguros',
        imageUrl: "/images/car_insurance2.png"
    },
    {
        title: 'Laudos',
        date: '07/Nov',
        description:
            'Laudos de segurança veicular',
        link: '/laudos',
        imageUrl: "/images/laudos.png"
    },
    {
        title: 'Baixa',
        date: '07/Nov',
        description:
            'Baixa de veículos',
        link: '/baixaVeiculo',
        imageUrl: "/images/remove_doc.png"
    },
    {
        title: 'Configurações',
        date: '07/Nov',
        description:
            'Chassi, carrocerias, seguradoras, etc',
        link: '/config',
        imageUrl: "/images/config2.jpg"
    }
]

export default function VeiculosHome(props) {
    const { match } = props
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
