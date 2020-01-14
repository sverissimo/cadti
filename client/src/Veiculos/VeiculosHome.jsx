import React from 'react'
import { Link } from 'react-router-dom'
import './styleZ.css'

const menuCards = [
    {
        title: 'Cadastro de Veículos',
        date: '07/Nov',
        description:
            'Cadastrar um novo veículo no sistema.',
        imageUrl: '/images/addCompany21.png',
        link: '/cadastro'
    },
    {
        title: 'Alteração de dados',
        date: '07/Nov',
        description:
            'Gerenciar sócios e alterações de contrato social',
        link: '/altDados',
        imageUrl: '/images/socios3.png'
    },
    {
        title: 'Seguros',
        date: '07/Nov',
        description:
            'Alterar relação de procuradores e procurações',
        link: '/altSeguro',
        imageUrl: '/images/procuradores31.png'
    },
    {
        title: 'Baixa',
        date: '07/Nov',
        description:
            'Alterar relação de procuradores e procurações',
        link: '/baixaVeiculo',
        imageUrl: '/images/procuradores31.png'
    },
    {
        title: 'Baixa',
        date: '07/Nov',
        description:
            'Alterar relação de procuradores e procurações',
        link: '/procuradores',
        imageUrl: '/images/procuradores31.png'
    },
    {
        title: 'Baixa',
        date: '07/Nov',
        description:
            'Alterar relação de procuradores e procurações',
        link: '/procuradores',
        imageUrl: '/images/procuradores31.png'
    },
    {
        title: 'Baixa',
        date: '07/Nov',
        description:
            'Alterar relação de procuradores e procurações',
        link: '/procuradores',
        imageUrl: '/images/procuradores31.png'
    },
]

export default function VeiculosHome(props) {
    const { match } = props    
    return (
        <div>
            <div className="jumbotron">
                <h1>
                    Veículos
                </h1>
            </div>
            <div className="cardHolder">
                {
                    menuCards.map(({ title, link }, i) =>
                        <Link to={match.url + link} key={i} className="card">
                            {title}
                        </Link>
                    )}
            </div>            
        </div >
    )
}
