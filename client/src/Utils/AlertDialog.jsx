import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function AlertDialog({ open, alertType, close, confirm, customTitle = '', customMessage = '' }) {

  const createAlert = type => {
    let title, message
    if (typeof type === 'object') {
      title = 'Empresa já cadastrada'
      message = `A empresa ${type.razaoSocial} já está cadastrada no sistema com o CNPJ ${type.cnpj}.`
      return { title, message }
    }

    switch (type) {
      case 'plateNotFound':
        title = 'Placa não encontrada'
        message = 'A placa informada não corresponde a nenhum veículo da frota da viação selecionada. Para cadastrar um novo veículo, selecione a opção Veículos => "Cadastro de Veículo" no menu acima.'
        return { title, message }
      case 'invalidPlate':
        title = 'Placa inválida'
        message = 'Certifique-se de que a placa informada é uma placa válida, com três letras seguidas de 4 números (ex: AAA-0000)'
        return { title, message }
      case 'plateExists':
        title = 'Placa já cadastrada!'
        message = 'A placa informada já está cadastrada. Para atualizar seguro, alterar dados ou solicitar baixa, utilize as opções acima. '
        return { title, message }
      case 'inputError':
        title = 'Preenchimento inválido.'
        message = customMessage
        return { title, message }
      case 'fieldsMissing':
        title = 'Favor preencher todos os campos.'
        message = 'Os campos acima são de preenchimento obrigatório. Certifique-se de ter preenchido todos eles.'
        return { title, message }

      case 'filesNotFound':
        const subject = 'Procuração'
        title = 'Arquivos não encontrados'
        message = `Não há nenhum arquivo anexado no sistema para a ${subject} selecionada. 
          Ao cadastrar ou atualizar a ${subject}, certifique-se de anexar o arquivo correspondente.`
        return { title, message }

      case 'empresaNotFound':
        title = 'Empresa não encontrada.'
        message = `A empresa informada não está registrada no sistema. Para cadastrar uma nova empresa, utilize a opção Empresas -> Cadastrar.`
        return { title, message }
      case 'seguradoraNotFound':
        title = 'Seguradora não encontrada.'
        message = `A seguradora informada não está registrada no sistema. Favor verificar o nome da seguradora.`
        return { title, message }

      case 'alreadyExists':
        title = 'CPF já cadastrado.'
        message = `O CPF informado corresponde a um sócio já cadastrado. 
          Para remover ou editar as informações dos sócios, utilize a respectiva opção abaixo.`
        return { title, message }
      case 'numberNotValid':
        title = 'Número inválido.'
        message = 'O número digitado não é válido.'
        return { title, message }
      case 'overShared':
        title = 'Participação societária inválida.'
        message = 'A participação societária informada excede a 100%.'
        return { title, message }
      case 'subShared':
        title = 'Participação societária inválida.'
        message = 'A participação societária informada não soma 100%. Favor informar todos os sócios com suas respectivas participações.'
        return { title, message }

      default:
        return null
    }
  }
  const { title, message } = createAlert(alertType)

  if (title && message) return (
    <div>
      <Dialog
        open={open}
        onClose={close}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} color="primary">
            {confirm ? 'Cancelar' : 'Fechar'}
          </Button>
          {confirm && <Button onClick={close} color="primary" autoFocus>
            Confirmar
          </Button>}
        </DialogActions>
      </Dialog>
    </div>
  )
  else return null
}