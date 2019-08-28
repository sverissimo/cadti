import { cadForm } from './cadForm'
import { seguroForm } from './seguroForm'
import { altForm } from './altForm'
import { baixaForm } from './baixaForm'

export const vehicleForm = [cadForm].concat([seguroForm]).concat([altForm]).concat([baixaForm])