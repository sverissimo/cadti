export const removeFile = (name, form) => {

    const existingFiles = new FormData()

    if (form instanceof FormData && form.has(name)) {
        for (let p of form) {
            existingFiles.set(p[0], p[1])
        }

        existingFiles.delete(name)

        const returnObj = { fileToRemove: name, form: existingFiles, [name]: undefined }

        //********If form has only 1 key left, remove it from state. */
        const keyCounter = Array.from(form.keys(), k => k).length

        if (keyCounter <= 1 && (form.has('veiculoId') || form.has('empresaId')))
            return { fileToRemove: undefined, form: undefined, [name]: undefined }
        else
            return returnObj
    }    
}

export const handleFiles = (files, formData, state, filesFormTemplate) => {

    if (files && files[0]) {
        filesFormTemplate.forEach(obj => {
            for (let keys in state) {
                if (keys.match(obj.name) && state[obj.name]) {                    
                    formData.append(obj.name, state[obj.name])
                }
                else void 0
            }
        })
        //for (let p of formData) { console.log(p[0], p[1]) }
        return { form: formData }
    }
}
