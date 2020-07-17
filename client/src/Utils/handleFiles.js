import { altDadosFiles } from "../Forms/altDadosFiles"

export const removeFile = async (name, form) => {

    const existingFiles = form
    if (existingFiles instanceof FormData && form.has(name)) {
        await existingFiles.delete(name)

        const returnObj = { fileToRemove: name, form: existingFiles, [name]: undefined }

        //********If form has only 1 key left, remove it from state. */
        let keyCounter = 0
        if (form instanceof FormData)
            keyCounter = Array.from(form.keys(), k => k)

        console.log(keyCounter)
        keyCounter = keyCounter.length
        console.log(keyCounter)

        if (keyCounter <= 1)
            return { fileToRemove: undefined, form: undefined, [name]: undefined }
        else
            return returnObj
    }
    return
}

export const handleFiles = (files, name, formData, state) => {

    if (files && files[0]) {


        /* let formData = new FormData()
        formData.append('veiculoId', veiculoId)
 */
        //await this.setState({ [name]: files[0] })

        altDadosFiles.forEach(obj => {
            for (let keys in state) {
                if (keys.match(obj.name) && state[obj.name]) {
                    formData.append(obj.name, state[obj.name])
                }
                else void 0
            }
        })
        //this.setState({ form: formData })
        return { form: formData }
    }

}
