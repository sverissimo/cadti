import axios from "axios"

export const handleFiles = (files, state, filesFormTemplate) => {

    const formData = new FormData()

    if (files && files[0]) {
        filesFormTemplate.forEach(obj => {                   //set native file fieldname property for each file attached. Makes sense if multiple files
            for (let keys in state) {
                if (keys.match(obj.name) && state[obj.name]) {
                    formData.set(obj.name, state[obj.name])
                }
                else void 0
            }
        })
        //for (let p of formData) { console.log(p[0], p[1]) }
        return { form: formData }
    }
}

export const postFilesReturnIds = async (formData, metadata = {}, completed, filesEndPoint) => {
    let
        files,
        filesIds

    if (formData instanceof FormData) {
        let filesToSend = new FormData()

        if (completed)                              //Se a demanda for aprovada é considerada completed, e então o arquivo deixa de ser temporário.
            metadata.tempFile = false
        else
            metadata.tempFile = true

        /*   Object.entries(metadata).forEach(([k, v]) => {
              filesToSend.set(k, v)
          })
   */

        filesToSend.append('metadata', JSON.stringify(metadata))
        for (let pair of formData) {
            filesToSend.set(pair[0], pair[1])
        }

        files = await axios.post(`/api/${filesEndPoint}`, filesToSend)
    }

    if (files?.data?.file) {
        const filesArray = files.data.file
        filesIds = filesArray.map(f => f.id)
        return filesIds
    }
    else return null
}

export const updateFilesMetadata = async (obj, filesCollection) => {

    const { files, demandFiles } = obj
    let metadata = { tempFile: false }

    if (obj?.metadata instanceof Object)
        metadata = Object.assign(obj.metadata, metadata)
    console.log(obj, metadata)
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