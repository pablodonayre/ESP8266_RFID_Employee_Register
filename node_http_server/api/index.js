
const express = require('express')
const app = express()
const port = 3000;
const db = require('./db');

let variables = [];

app.use(express.urlencoded({
	extended: true
}))

app.get('/', (req, res) => {
	res.send('Hello World carajo!')
})

app.get('/data', (req, res) => {

	res.json({
		"length": variables.length,
		"data": variables
	})

})

/*
domain/api?qwerty=asdfg
*/
app.get('/api', (req, res) => {
	let query = req.query;

	if (variables.length >= 100) {
		variables.shift();
	}

	variables.push({
		"timestamp": Date.now(),
		"query": query,
	});

	res.json({
		"length": variables.length,
		"data": variables
	})
})


/*
domain/api/texto
*/
app.get('/api/:texto', (req, res) => {
	let params = req.params;

	if (variables.length >= 100) {
		variables.shift();
	}

	let data = variables.push({
		"timestamp": Date.now(),
		"params": params
	});

	res.json({
		"length": variables.length,
		"data": variables
	})
})


app.post('/api', (req, res) => {
	let body = req.body.name;

	res.json({ "name": body });
})

/*
domain/arduino?qwerty=asdfg
*/
app.get('/arduino', (req, res) => {
	let query = req.query;

	let verified = verify(query);

	if(verified){

		if (verified.status) {
			
			if (variables.length >= 100) {
				variables.shift();
			}
			
			variables.push({
				"timestamp": Date.now(),			
				"name": verified.name
			});
			let sql = 'INSERT INTO empresa_test (nombre) VALUES ("' + verified.name + '")';
			db.con.query(sql, function (err, result) {
				if (err) throw err;
    			console.log("1 record inserted");
			})
		}

		res.json({
			"status": verified.status,
			"msg": verified.msg,
			"name": verified.name
		})
		

	}else{

		res.json({
			"status": false,
			"msg": "Error",
			"name": ""
		})
	}
	
	

})


app.listen(port, () => {
	console.log(`app listening at Port:${port}`)
})



function verify(query) {

	let status = false;
	let msg    = "";
	let name   = "";

	let api_key = "Ab123456789";

	let registered = [
		{
			"id": "491da5a",
			"name": "Paty"
		},
		{
			"id": "7980d55a",
			"name": "Gaby"
		},
		{
			"id": "d9ddd25a",
			"name": "Mary"
		},
		{
			"id": "f9eadb5a",
			"name": "Diana"
		}
	];

	
	if (typeof query.api_key == "undefined") {

		console.log("API key no especificada");

		return {
			"status" : false,
			"msg"    : "API key no especificada",
			"name"   : ""
		}
	}
	
	if (typeof query.numero_identificacion == "undefined") {
		
		console.log("Usuario no especificado");
			
		return {
			"status" : false,
			"msg"    : "Usuario no especificado",
			"name"   : ""
		}
	}
	
	
	if(api_key != query.api_key) {
		
		console.log("API Key no valida");

		return {
			"status" : false,
			"msg"    :  "API Key no valida",
			"name"   : ""
		}
	}
	
	
	for (i = 0; i < registered.length; i++) {

		if (registered[i].id == query.numero_identificacion) {
			
			console.log("Usuario valido");

			return {
				"status" : true,
				"msg"    : "Usuario valido",
				"name"   : registered[i].name
			}

		}
	}
	
	return {
		"status" : false,
		"msg"    : "Usuario no valido",
		"name"   : ''
	}			
	


}

