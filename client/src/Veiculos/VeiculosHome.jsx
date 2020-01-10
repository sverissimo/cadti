import React from 'react'
import { Link } from 'react-router-dom'
import './styleZ.css'

const menuCards = [
    {
        title: 'Cadastrar',
        date: '07/Nov',
        description:
            'Cadastrar uma nova empresa no sistema.',
        imageUrl: '/images/addCompany21.png',
        link: '/veiculos/cadastro'
    },
    {
        title: 'Alteração de dados',
        date: '07/Nov',
        description:
            'Gerenciar sócios e alterações de contrato social',
        link: '/socios',
        imageUrl: '/images/socios3.png'
    },
    {
        title: 'Seguros',
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

export default function VeiculosHome() {
    return (
        <div>
            <div className="jumbotron">
                <h1>
                    HEEEyy!
                </h1>
            </div>
            <div className="cardHolder">
                {
                    menuCards.map(({ title, link }, i) =>
                        <Link to={link} key={i} className="card">
                            {title}
                        </Link>
                    )}
            </div>

        </div >
    )
}
