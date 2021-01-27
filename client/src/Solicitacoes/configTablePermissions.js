
const configTablePermissions = ({ rowData, user }) => {
    const
        { status } = rowData,
        { role } = user

    if (status.match('indeferida') || status.match('concluída'))
        return true
    if (role === 'empresa' && status.match('Pendências'))
        return true
    if (role !== 'empresa' && status.match('Aguardando'))
        return true
    return false
}

export default configTablePermissions