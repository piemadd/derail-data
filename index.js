const fs = require('fs');
const csv = require('csv-parser')

let newIncidents = [];
let index = 0;

console.log('starting processing')

fs.createReadStream('input.csv')
	.pipe(csv())
	.on('data', function (row) {
		index++;

		if (index % 1000 === 0) {
			console.log(`processed ${index} rows`)
		}
		fs.writeFileSync(`./incidents/${row['Accident Number']}-d-${row['Accident Month']}-${row['Day']}-${row['Accident Year']}-${row['Reporting Railroad Code']}.json`, JSON.stringify(row));
		newIncidents.push(`${row['Accident Number']}-d-${row['Accident Month']}-${row['Day']}-${row['Accident Year']}-${row['Reporting Railroad Code']}`);
		//console.log(`incident ${row['Accident Number']} added`)
	})
	.on('end', function () {
		console.log('pushing new incidents keys')
		fs.writeFileSync(`./incidentKeys.json`, JSON.stringify(newIncidents));
	})