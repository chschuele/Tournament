
// HTTP Web Server
const express = require('express');
// Dieses Plugin ermöglicht dir Formulardaten die vom Client kommen zu parsen.
const bodyParser = require("body-parser")
//Sagt Express welchen Port er verwenden soll
const port = process.env.PORT || 3001;
//aufrufen der Function express
const app = express();
//Paket welches dir HTTP Requests erlaubt. GET POST. Wichtig um Sachen im JSON Server (deine Datenbank) zu speichern.
//POST erstellt eine Ressource in deiner Datenbank
//GET holt eine Ressource aus der Datenbank
const fetch = require('node-fetch');
//Ist die Basis URL wo die Datenbank läuft
const API_URL = "http://10.93.28.194:3000"
//const API_URL = "http://localhost:3000"
//Sagt Express, dass die View Engine ejs ist. Ejs ist ein Javascript Template welches es dir erlaubt Variablen im eigentlichen HTML zu definieren.
app.set('view engine', 'ejs');
// zeigt den Weg wo deine Dateien beispielsweise Bilder liegen. link="/images/children.jpg"
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
//Auf welchen Port soll Express lauschen
const server = app.listen(port, () => {console.log(`Server listening on port ${port}…`)});

//Routen welche angesteuert werden können
// Liefert die Startseite aus
app.get('/', function (req, res) {res.render('landingPage')});
// Liefert deine Spielgenerator Seite. Wenn es erfolgreich gespeichert wurde so übergeben wir eine Variable. Created true
app.get('/spielplanGenerator', function (req, res) {res.render('spielplanGenerator', {created: false})});
// Diese Route liefert dein Spielplan. Die :id ist ein Parameter auf dem du im Req zugreifen kannst.
app.get('/spielplan/:id', function (req, res) {//http://localhost:3000/spielplan/16
    // Wertet der die :id aus -> 16
    const id = req.params.id
    // Hier wird das Turnier anhand der id geholt.
    // Das passiert asynchron. und wir sagen mit .then() wenn wir das Turnier erhalten machen wir weiter.
    getTournament(id).then(tournament => {
      // wenn wir das Turnier haben so holen wir alle Spieltage zu dem Turnier.
        getTournamentPlayDays(id).then(playDays => {
            //Nach erhalten der Spieltage gehen wir über alle Spieltage drüber und holen uns jedes einzelne Match aus der DB
            const playDayMatchesFetch = playDays.map(playDay => {
                return getPlayDayMatches(playDay.id)
            })
            // Hier warten wir auf die asynchronen Match Calls. Erst wenn alle fertig sind wird weiter gemacht.
            Promise.all(playDayMatchesFetch).then(playDayMatches => {
              //Hier wird ein Objekt erstellt welches der View spielplan übergeben wird
                const createdTournament = {
                    id: tournament.id,
                    name: tournament.name,
                    playDays: playDayMatches
                }
                res.render("spielplan", {tournament: createdTournament})
            })
        })
    })
});
app.post('/spielplanGenerator', function (req, res) {generateMatchPlan(req, res)})
const generateMatchPlan = (req, res) => {
    const {team, name} = req.body
    const teamsLength = team.length
    const playDays = roundRobin(teamsLength, team) //[[ [team1], [team2] ], ]
    const createTournamentFetch = createTournament({name: name}).then(tournament => {
        //const tournament= {id: 1, name: "max"}
        playDays.map(playDay => {
            createPlayDay({tournamentId: tournament.id}).then(createdPlayDay => {
                const createdPlayDayId = createdPlayDay.id
                playDay.map(match => {
                    const team1 = match[0]
                    const team2 = match[1]
                    //const [team1, team2] = match
                    const matchToCreate = {
                        team1: team1, team2: team2, playdayId: createdPlayDayId
                    }
                    createMatch(matchToCreate)
                })
            })
        })
        return tournament.id
    })
    createTournamentFetch.then(id => res.render("spielplanGenerator", {created: true, tournamentId: id}))
}
//Creating data database
const createPlayDay = data => fetch(API_URL + "/playDays", {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
}).then(res => {
    if (res.status !== 201) {console.error("PlayDay konnte nicht erstellt werden")}
    return res.json()
})

const createMatch = data => fetch(API_URL + "/matches", {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
}).then(res => {
    if(res.status !== 201) {console.error("Match konnte nicht erstllt werden")}
    return res.json()
})

const createTournament = data => fetch(API_URL + "/tournament", {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
}).then(res => {
    if(res.status !== 201) {console.error("Tournament konnte nicht erstllt werden")}
    return res.json()
})

//Holt von der Datenbank
const getTournament = id => fetch(API_URL + `/tournament/${id}`).then(res => res.json())
const getTournamentPlayDays = id => fetch(API_URL + `/tournament/${id}/playdays`).then(res => res.json())
const getPlayDayMatches = id => fetch(API_URL + `/playdays/${id}/matches`).then(res => res.json())

const DUMMY = -1;
const roundRobin = (n, ps) => {
    let rs = []
    if (!ps) {
        for (var k = 1; k <= n; k += 1) {
            ps.push(k);
        }
    } else {
        ps = ps.slice();
    }

    if (n % 2 === 1) {
        ps.push(DUMMY);
        n += 1;
    }
    for (var j = 0; j < n - 1; j += 1) {
        rs[j] = []; // create inner match array for round j
        for (var i = 0; i < n / 2; i += 1) {
            if (ps[i] !== DUMMY && ps[n - 1 - i] !== DUMMY) {
                rs[j].push([ps[i], ps[n - 1 - i]]); // insert pair as a match
            }
        }
        ps.splice(1, 0, ps.pop()); // permutate for next round
    }
    return rs;
};

module.exports = server;
