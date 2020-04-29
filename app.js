const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',(req, res) =>
{
	res.sendFile(__dirname + '/public/wallet.html');
});

app.listen(3000, () => {
    console.log("listening port 3000...");
});
