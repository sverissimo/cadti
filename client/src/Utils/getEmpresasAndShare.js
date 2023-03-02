//@ts-check
export const getCodigoEmpresaAndShare = (socio, codigoEmpresa) => {
    const empresa = socio.empresas.find(e => e.codigoEmpresa === codigoEmpresa)
    if (empresa) {
        const share = empresa?.share
        return { ...socio, share, codigoEmpresa }
    }
    return socio
}
