//@ts-check
import { checkInputErrors as checkForErrors } from '../../../Utils'

export const checkInputErrors = (expires, procuradores) => {
    //@ts-ignore
    const { errors } = checkForErrors('returnObj', 'Dont check the date, please!') || []

    if (errors && errors[0]) {
        if (!expires)
            return checkForErrors('setState', 'dontCheckDate')
        else
            return checkForErrors('setState')
    }
    else return false
}
