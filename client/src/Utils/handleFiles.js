import axios from "axios"

export const sizeExceedsLimit = files => {
    if (files[0].size > 3145728) {
        alert('Arquivo excedeu o limite permitido (3MB)')
        return true
    }
}

export const handleFiles = (files, state, filesFormTemplate) => {
    const formData = new FormData()

    if (files && files[0]) {

        if (sizeExceedsLimit(files)) return            //limit file Size

        filesFormTemplate.forEach(obj => {                   //set native file fieldname property for each file attached. Makes sense if multiple files
            console.log(obj.name)
            for (let keys in state) {
                if (keys.match(obj.name) && state[obj.name]) {
                    formData.set(obj.name, state[obj.name])
                }
                else void 0
            }
        })

        return { form: formData }
    }
}

export const postFilesReturnIds = async (formData, metadata = {}, completed, filesEndPoint) => {
    if (formData instanceof FormData === false) {
        return null
    }

    const filesToSend = new FormData()

    metadata.tempFile = completed ? false : true
    filesToSend.append('metadata', JSON.stringify(metadata))

    for (let pair of formData) {
        filesToSend.set(pair[0], pair[1])
    }

    const { data } = await axios.post(`/api/${filesEndPoint}`, filesToSend) || []
    const filesIDs = data?.files.map(f => f.id)
    return filesIDs
}

export const updateFilesMetadata = async (obj, filesCollection) => {

    const { files, demandFiles } = obj
    let metadata = { tempFile: false }

    if (obj?.metadata instanceof Object)
        metadata = Object.assign(obj.metadata, metadata)
    //console.log(obj, metadata)
    let ids

    if (demandFiles && demandFiles[0])
        ids = demandFiles.map(f => f.id)

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
        .catch(err => console.log(err))
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