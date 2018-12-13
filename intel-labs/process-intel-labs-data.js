let fs = require('fs');
let sep = require('path').sep;

function splitMotes() {
    let f = fs.readFileSync('intel-labs-data.txt', {encoding: 'utf-8'});

    let lines = f.split('\n');

    for (let i = 1; i <= 54; i++) {
        let filename = 'data' + sep + 'mote-' + i + '.txt';
        let data = '';
        
        lines.forEach(l => {
            let attrs = l.split(' ');
            if (attrs[3] == i) { // mote id
                data += l + '\n';
            }
        });
        
        fs.writeFileSync(filename, data);
        console.log('wrote ' + filename + ' onto disk');
    }
}

function getMoteUptimes() {
    for (let i = 1; i <= 54; i++) {
        let f = fs.readFileSync('data/mote-' + i + '.txt', {encoding: 'utf-8'});
        
        let lines = f.split('\n');
        
        let dates = lines.map(l => {
            let attrs = l.split(' ');
            
            let temperature = attrs[4];
            let humidity = attrs[5];
            let light = attrs[6];
            let voltage = attrs[7];
            
            if ((temperature > -50 && temperature < 50) &&
                (humidity > 0 && humidity < 100) &&
                (light > 0 && light < 10000)) {
                let date = attrs[0];
                let time = attrs[1];
                return new Date(date + 'T' + time);
            }
        });
        
        let max = new Date(0);
        dates.forEach(d => max = d > max ? d : max);
        
        console.log(i + ' ' + max.toISOString()); // TODO write file instead
    }
}

const locations = [
    "hall",
    "hall",
    "hall",
    "hall",
    "hall",
    "hall",
    "hall",
    "hall",
    "hall",
    "hall",
    "conference_right",
    "conference_right",
    "conference_right",
    "phone_right",
    "right",
    "right",
    "right",
    "right",
    "right",
    "right",
    "right",
    "right",
    "right",
    "right",
    "right",
    "right",
    "right",
    "right",
    "right",
    "right",
    "hall",
    "hall",
    "hall",
    "hall",
    "hall",
    "hall",
    "kitchen",
    "left",
    "left",
    "left",
    "left",
    "left",
    "left",
    "left",
    "left",
    "left",
    "left",
    "left",
    "left",
    "left",
    "left",
    "office1_left",
    "conference_left",
    "conference_left"
];

// TODO per physical quantity instead
function getMoteCoverage() {
    let f = fs.readFileSync('intel-labs-uptime.txt', {encoding: 'utf-8'});
    
    let lines = f.split('\n');
    
    let uptimes = lines.map(l => {
        let attrs = l.split(' ');
        return new Date(attrs[1]);
    });
    
    let begin = new Date('2004-02-28');
    let end = new Date('2004-04-05');
    
    // every hour
    for (let t = begin; t < end; t.setHours(t.getHours() + 1)) {
        let up = uptimes.map(uptime => t < uptime);
        let covered = new Set(locations.filter((loc, i) => up[i]));
        
        console.log(new Date(t).toISOString() + ' ' +
            (up.filter(b => b).length / up.length) + ' ' +
            (covered.size / new Set(locations).size));
    }
}

//splitMotes();
//getMoteUptimes();
getMoteCoverage();