import axios from "axios"

//@ts-check
export const submitFiles = async ({ empresaId, socioIds, formData, numeroAlteracao }) => {
    const files = []
    let filesToSend = new FormData()
    const metadata = {
        empresaId,
        tempFile: true
    }

    for (const pair of formData) {
        const name = pair[0]
        const fileMetadata = {
            ...metadata,
            fieldName: name,
            socios: name === "altContratoDoc" ? socioIds : undefined,
            numeroAlteracao: name === "altContratoDoc" ? numeroAlteracao : undefined,
        }

        filesToSend.set('metadata', JSON.stringify(fileMetadata))
        filesToSend.set(name, pair[1])

        const { data } = await axios.post('/api/empresaUpload', filesToSend)
        if (data?.file instanceof Array) {
            files.push(...data?.file)
        }
        filesToSend = new FormData()
    }
    return files
}
