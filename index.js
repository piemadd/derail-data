const fetch = require('node-fetch');

const currentIncidentsRawReq = await env.DERAIL_BUCKET.get('incidentKeys.json');
let currentIncidentsRaw = null;

if (currentIncidentsRawReq !== null) {
	currentIncidentsRaw = await currentIncidentsRawReq.json();
}

const currentIncidents = currentIncidentsRaw ?? [];

const currentIncidentsAccidentID = currentIncidents.map((incident) => incident.split('-')[0]);

let newIncidents = [];
let offset = 0;

while (true) {
	const res = await fetch(`https://data.transportation.gov/resource/85tf-25kj.json?$$app_token=${env.APP_TOKEN}&$limit=1000&$offset=${offset}&$order=:id`);
	const json = await res.json();

	if (json.length === 0) {
		break;
	}

	console.log(`starting offset ${offset}`)

	const newIncidents = json.map((item) => {
		if (!currentIncidentsAccidentID.includes(item.incidentnumber)) {
			//console.log(`incident ${item.incidentnumber} does not exist, adding`)
			env.DERAIL_BUCKET.put(`incidents/${item.incidentnumber}-${item.accidentmonth}-${item.day}-${item.accidentyear}.json`, JSON.stringify(item));
			//console.log(`incident ${item.incidentnumber} added`)
		} else {
			//console.log(`incident ${item.incidentnumber} already exists`)
		}

		return `${item.incidentnumber}-${item.accidentmonth}-${item.day}-${item.accidentyear}`;
	});

	newIncidents.push(...newIncidents);

	console.log('pushing new incidents keys')
	await env.DERAIL_BUCKET.put('incidentKeys.json', JSON.stringify(newIncidents));
	console.log('all updated')

	console.log(`finished with offset ${offset}`)

	offset += 1000;
};

/*
const res = await fetch(`https://data.transportation.gov/resource/85tf-25kj.json?$$app_token=${env.APP_TOKEN}&$limit=10000`)
const json = await res.json()

const newIncidents = json.map((item) => {
	if (!currentIncidentsAccidentID.includes(item.incidentnumber)) {
		console.log(`incident ${item.incidentnumber} does not exist, adding`)
		env.DERAIL_BUCKET.put(`incidents/${item.incidentnumber}-${item.accidentmonth}-${item.day}-${item.accidentyear}.json`, JSON.stringify(item));
		console.log(`incident ${item.incidentnumber} added`)
	} else {
		console.log(`incident ${item.incidentnumber} already exists`)
	}

	return `${item.incidentnumber}-${item.accidentmonth}-${item.day}-${item.accidentyear}`;
});
*/

console.log('pushing new incidents keys')
await env.DERAIL_BUCKET.put('incidentKeys.json', JSON.stringify(newIncidents));
console.log('all updated')

return new Response("fuck off, this is a worker");
