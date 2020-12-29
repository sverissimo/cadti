import React, { useEffect, useState } from 'react'
import StoreHOC from '../Store/StoreHOC'
import UsersTemplate from './UsersTemplate'

const Users = props => {

    const { users } = props.redux

    const [usersState, editUsers] = useState({})

    useEffect(() => {
        const
            rUsers = JSON.stringify(users),
            lUsers = JSON.stringify(usersState)

        if (rUsers !== lUsers)
            editUsers(users)

    }, [users])

    console.log(usersState, users)
    return (
        <div>
            <UsersTemplate
                collection={usersState}
                setData={editUsers}
            />
        </div>
    )
}

const collection = ['users']

export default StoreHOC(collection, Users)
