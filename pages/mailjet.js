const Mailjet = require('node-mailjet');
//import Mailjet from 'node-mailjet';
const mailjet = Mailjet.connect(
    'b39dbf6b3c18ec3909d20b1df914908a',
    '7da588c2d14ee0cbf51121820ae58665'
);


const request = mailjet
	.post("listrecipient", {'version': 'v3'})
	.request({
      "IsUnsubscribed":"false",
      "ContactAlt":"passenger@mailjet.com",
      "ListID":"10514615"
    })
request
	.then((result) => {
		console.log(result.body)
	})
	.catch((err) => {
		console.log(err.statusCode)
	})