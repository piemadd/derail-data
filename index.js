const fs = require('fs');
const csv = require('csv-parser')

let newIncidents = [];
let months = {};
let index = 0;

console.log('starting processing')

fs.createReadStream('input.csv')
	.pipe(csv())
	.on('data', function (row) {
		index++;

		if (index % 1000 === 0) {
			console.log(`processed ${index} rows`)
		}

		if (!months[`${row['Accident Month']}-${row['Accident Year']}`]) months[`${row['Accident Month']}-${row['Accident Year']}`] = {};

		months[`${row['Accident Month']}-${row['Accident Year']}`][`${row['Accident Number']}-d-${row['Accident Month']}-${row['Day']}-${row['Accident Year']}-${row['Reporting Railroad Code']}`] = row;

		//fs.writeFileSync(`./incidents/${row['Accident Number']}-d-${row['Accident Month']}-${row['Day']}-${row['Accident Year']}-${row['Reporting Railroad Code']}.json`, JSON.stringify(row));
		newIncidents.push(`${row['Accident Number']}-d-${row['Accident Month']}-${row['Day']}-${row['Accident Year']}-${row['Reporting Railroad Code']}`);
		//console.log(`incident ${row['Accident Number']} added`)
	})
	.on('end', function () {
		console.log('pushing new incidents keys')
		fs.writeFileSync(`./incidentKeys.json`, JSON.stringify(newIncidents));

		console.log('pushing new months')
		Object.keys(months).forEach(month => {
			console.log(`pushing ${month}`)
			fs.writeFileSync(`./incidents/${month}.json`, JSON.stringify(months[month]));
		});
	})