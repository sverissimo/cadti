const RecipientsRepository = require('../repositories/RecipientsRepository');

class RecipientService {

    /** @type {any[]} */
    socios;

    /** @type {any[]} */
    procuradores;

    /**
     * Obtém todos os sócios e procuradores do banco de dados
     */
    getAllRecipients = async () => {

        const allRecipients = await new RecipientsRepository().getAllRecipients()
        return allRecipients
    }
}

module.exports = RecipientService