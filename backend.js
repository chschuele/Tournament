const express = require('express');
const bodyParser = require("body-parser")
const port = process.env.PORT || 3001;
const app = express();
const fetch = require('node-fetch');
const API_URL = "http://localhost:3000"

app.set('view engine', 'ejs');
// zeigt den Weg zu den static files, damit Bilder gezeigt werden
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
const server = app.listen(port, () => {console.log(`Server listening on port ${port}…`)});

app.get('/', function (req, res) {res.render('landingPage')});
app.get('/spielplanGenerator', function (req, res) {res.render('spielplanGenerator', {created: false})});
app.get('/spielplan/:id', function (req, res) {
    const id = req.params.id
    getTournament(id).then(tournament => {
        getTournamentPlayDays(id).then(playDays => {
            const playDayMatchesFetch = playDays.map(playDay => {
                return getPlayDayMatches(playDay.id)
            })
            Promise.all(playDayMatchesFetch).then(playDayMatches => {
                const createdTournament = {
                    id: tournament.id,
                    name: tournament.name,
                    playDays: playDayMatches
                }
                createdTournament.playDays.map(playDay => {
                    playDay.map(matches => console.log("MATCHES", matches))
                })
                res.render("spielplan", {tournament: createdTournament})
            })
        })
    })
});
app.get('/rangliste', function (req, res) {res.render('rangliste')});
app.post('/spielplanGenerator', function (req, res) {generateMatchPlan(req, res)})

const generateMatchPlan = (req, res) => {
    const {startDate, team, name} = req.body
    const teamsLength = team.length
    const parsedDate = new Date(startDate)
    const playDays = roundRobin(teamsLength, team)
    const createTournamentFetch = createTournament({name}).then(t => {
        playDays.map(playDay => {
            const dateForPlayDay = new Date(parsedDate.setDate(parsedDate.getDate() + 1)).toString()
            createPlayDay({startDate: dateForPlayDay, tournamentId: t.id}).then(createdPlayDay => {
                const {id} = createdPlayDay
                playDay.map(match => {
                    const [team1, team2] = match
                    const matchToCreate = {
                        team1, team2, playdayId: id
                    }
                    createMatch(matchToCreate)
                })
            })
        })
        return t.id
    })
    createTournamentFetch.then(id => res.render("spielplanGenerator", {created: true, tournamentId: id}))
}

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
