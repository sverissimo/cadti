import axios from 'axios';
import humps from 'humps'

export const updateData = async  updatedElement => {

    console.log(updatedElement)

    /* const index = veiculos.indexOf(updatedVehicle)
                const frotaIndex = frota.indexOf(updatedVehicle)
                veiculos[index] = updatedVehicle
                frota[frotaIndex] = updatedVehicle */

    return {
        type: 'UPDATE_VEHICLE',
        payload: updatedElement
    }
}
