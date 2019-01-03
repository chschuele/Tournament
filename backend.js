const express = require('express');
const bodyParser = require("body-parser")
const port = process.env.PORT || 3000;
const app = express();
//const sqlite3 = require('sqlite3').verbose();
//const db = new sqlite3.Database('./db/shoutbox.db');
app.set('view engine', 'ejs');
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*
app.get('/', function(req, res) {
  db.all('SELECT * FROM shouts', (err, row) => {
    res.render('pages/index', {
      title: "Test",
      tableData: row
    });
  });
});
*/

app.get('/', function(req, res) {
  res.render('landingPage');
});


app.post('/generatematch', function(req, res) {
  const { name, teams, startDate } = req.body
  //4
  const teams = [
  {
  name: "SSV"
  },
  {
  name: "TSV"
  },
  {
  name: "BSA"
  },
  {
  name: "CCD"
  }
  ]
  const teamsLength = teams.length
  const playDayLength = teamsLength - 1
  let playDays = []
  for (p = 0; p < playDayLength; p++) {
    let matches = []
    for (i = 0; i < teamsLength; i++) {
      matches.push({
        team1: teams[i].name,
        team2: teams[i + 1].name
      })
      i++
  	}
    playDays.push({
    	startDate: "12213123",
      matches
    })
  }
  console.log("playDays", playDays)

const generiereSpieltag = () =>

const spieltag = {
    id: 1,
    date: "21.12.12",
      matches: [{
      id: 1,
      team1: "SSV HALL",
      team2: "VFB",
      finished: false,
      resultTeam1: null,
      resultTeam2: null
    },
    {
      id: 2,
      team1: "WOLFs",
      team2: "HERTHA",
      finished: false,
      resultTeam1: null,
      resultTeam2: null
    },
    {
      id: 3,
      team1: "MÜNCHEN",
      team2: "KRÄUTER",
      finished: false,
      resultTeam1: null,
      resultTeam2: null
    },
    {
      id: 4,
      team1: "SAHNE",
      team2: "BVB",
      finished: false,
      resultTeam1: null,
      resultTeam2: null
    }
  ]
  }

  // Team 0 spielt gegen Team 1 am startDate
  // Und so weiter...
  // 1 Tag später soll nochmal jeder gegen einen anderen spielen solange bis jeder gegen jeden gespielt hat.








  

















  const newMessage = username + "ist cool"
  console.log("NEWMESSAGE", newMessage)
  db.run('INSERT INTO shouts (username, message) VALUES (?,?);',[req.body.username, newMessage], error => {
      res.render('pages/add-entry', {savedMessage: "Eintrag wurde gespeichert"});
  })
});


const server = app.listen(port, () => {
 console.log(`Server listening on port ${port}…`)
});

module.exports = server;
