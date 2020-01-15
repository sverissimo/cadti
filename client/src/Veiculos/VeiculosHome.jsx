import React from 'react'
import { Link } from 'react-router-dom'
import './veiculos.css'

const menuCards = [
    {
        title: 'Cadastro de Veículos',
        date: '07/Nov',
        description:
            'Cadastrar um novo veículo no sistema.',
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
        link: '/altSeguro',
        imageUrl: "/images/car_insurance2.png"
    },
    {
        title: 'Baixa',
        date: '07/Nov',
        description:
            'Baixa de veículos',
        link: '/baixaVeiculo',
        imageUrl: "/images/remove_doc.png"
    }
]

export default function VeiculosHome(props) {
    const { match } = props
    return (
        <div>
            <div className="jumbotron">
                <h1>
                    Veículos
                </h1>
                <p>
                    Selecione uma das opções abaixo.
                </p>
            </div>
            <section className="cardSection">
                {
                    menuCards.map(({ title, link, imageUrl, description }, i) =>
                        <Link to={match.url + link} key={i} className="card">                            
                                <span className="cardImage"> <img src={imageUrl} alt="tst" /> </span>
                                <div className="cardText">
                                    <h3 >{title}</h3>
                                    <p > {description}</p>
                                </div>                            
                        </Link>
                    )}
            </section>
        </div >
    )
}
