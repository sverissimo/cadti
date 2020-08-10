import axios from "axios"

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


export const updateFilesMetadata = async (obj, filesCollection) => {
    const { files, demandFiles, oneAtemptDemand } = obj
    let
        ids,
        metadata = { tempFile: 'false' }

    if (demandFiles && demandFiles[0])
        ids = demandFiles.map(f => f.id)

    if (oneAtemptDemand)
        metadata = obj?.metadata || metadata          //If oneAtemptDemand, obj should have metadata as prop. May expand this function to multipleAttempts
    else {
        if (files instanceof FormData) {             //If there's any upload from Seinfra, it will overwrite the latestDocs(demandFiles) before approval
            for (let pair of files) {
                demandFiles.forEach((f, i) => {
                    if (pair[0] === f?.metadata?.fieldName)
                        demandFiles.splice(i, 1)
                })
            }
            ids = demandFiles.map(f => f.id)
        }
    }
    
    await axios.put('/api/updateFilesMetadata', { ids, collection: filesCollection, metadata })
        .then(r => console.log(r.data))
}

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