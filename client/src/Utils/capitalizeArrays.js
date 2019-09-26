export const capitalizeArray = (objArray) => {
    let parentArray = []
    objArray.map(singleArray => {
        parentArray.push(
            singleArray.procuradoresList.map(s => s.charAt(0)
                .concat(s.slice(1)
                    .toLowerCase()))
                .map(s => s.split(' ')
                    .map(s => s.charAt(0).toUpperCase()
                        .concat(s.slice(1).toLowerCase()))
                    .join(' ')

                )
        )
        return parentArray
    })
}