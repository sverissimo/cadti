const sendmail = require('sendmail')();
 
sendmail({
    from: 'alertas@cadti.mg.gov.br',
	//from: 'cadti@infraestrutura.mg.gov.br',
    to: 'sverissimo2@gmail.com',
    subject: 'New stuff, man',
    html: 'stuf... done!',
  }, function(err, reply) {
    console.log(err && err.stack);
    console.dir(reply);
});