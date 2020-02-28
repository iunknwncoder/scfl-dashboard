import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import ownerDetails from '../../assets/owners.json';
import captainsDetails from '../../assets/captains.json';
import battingDetails from '../../assets/batting.json';
import bowlingDetails from '../../assets/bowling.json';
import fielderDetails from '../../assets/fielding.json';
import allTeamsDetails from '../../assets/allTeams.json'
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { renderFlagCheckIfStmt } from '@angular/compiler/src/render3/view/template';
import { Player, Team, PlayersService } from '../players.service.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = ['myName', 'teamName', 'points'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('fileImportInput', { static: true }) fileImportInput: any;
  ownersData = ownerDetails;
  captainsData = captainsDetails;
  battingData = battingDetails;
  bowlingData = bowlingDetails;
  fieldingData = fielderDetails;
  allTeams = allTeamsDetails;
  allTeamsPoint = [];
  allPlayers = [];
  displayUpload = false;
  displayPoints = false;

  loading = false;

  playerData: Player[]
  teamData: Team[] = [];

  constructor(public playersService: PlayersService) {
  }

  ngOnInit() {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    if (sessionStorage.getItem('allteams') || sessionStorage.getItem('batting') || sessionStorage.getItem('bowling') || sessionStorage.getItem('fielding') || sessionStorage.getItem('owners') || sessionStorage.getItem('captains')) {
      if (sessionStorage.getItem('batting')) {
        this.battingData = JSON.parse(sessionStorage.getItem('batting'));
      }
      if (sessionStorage.getItem('bowling')) {
        this.bowlingData = JSON.parse(sessionStorage.getItem('bowling'));
      }
      if (sessionStorage.getItem('fielding')) {
        this.fieldingData = JSON.parse(sessionStorage.getItem('fielding'));
      }
      if (sessionStorage.getItem('owners')) {
        this.ownersData = JSON.parse(sessionStorage.getItem('owners'));
      }
      if (sessionStorage.getItem('captains')) {
        this.captainsData = JSON.parse(sessionStorage.getItem('captains'));
      }
      if (sessionStorage.getItem('allteams')) {
        this.allTeams = JSON.parse(sessionStorage.getItem('allteams'));
      }

      this.updatePoints();
    } else {
    this.loading = true;
      this.playersService.getTeamsPoints().subscribe(
        response => {
          this.loading = false;
          this.teamData = response;
          if (this.teamData && this.teamData.length) {
            this.dataSource = new MatTableDataSource<any>(this.teamData);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }
        },
        error => () => {
          console.log('Error in loading team details from data store.', error);
        });

      this.playersService.getPlayerDetails().subscribe(
        response => {
          this.allPlayers = response;
        },
        error => () => {
          console.log('Error in loading player details from data store.', error);
        });
    }
  }

  updatePoints() {
    this.calculateBattingPoints(this.battingData);
    this.calculateBowlingPoints(this.bowlingData);
    this.calculateFieldingPoints(this.fieldingData);
    this.allTeamsPoint = this.calculateTeamPoints(this.allTeams, this.allPlayers);

    this.playerData = this.allPlayers;
    this.teamData = [];
    this.allTeamsPoint.map(t => {
      const team = new Team();
      team.name = t.myName;
      team.teamName = t.teamName;
      team.points = t.points;
      this.teamData.push(team);
    });

    this.dataSource = new MatTableDataSource<any>(this.teamData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.playersService.resetPlayers().subscribe(
      response => {
        console.log(JSON.parse(JSON.stringify(response)));
        this.playersService.addPlayertDetails(this.playerData).subscribe(
          response => {
            console.log(JSON.parse(JSON.stringify(response)));
          },
          error => () => {
            console.log('Error something went wrong in the service', error);
          }
        );
      },
      error => () => {
        console.log('Error in loading player details from data store.', error);
      });

    this.playersService.resetTeams().subscribe(
      response => {
        console.log(JSON.parse(JSON.stringify(response)));
        this.playersService.addTeamsPoints(this.teamData).subscribe(
          response => {
            console.log(JSON.parse(JSON.stringify(response)));
          },
          error => () => {
            console.log('Error something went wrong in the service', error);
          }
        );
      },
      error => () => {
        console.log('Error in loading player details from data store.', error);
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  calculateBattingPoints(battingData) {
    battingData.map(player => {
      let points = 0;
      points = (player.total_runs * 0.5 + player['4s'] * 0.5 + player['6s'] * 1 + player.total_runs * (player.strike_rate / 100));

      if (player.total_runs > 24 && player.total_runs < 50) {
        points = points + 4
      } else if (player.total_runs.total_wickets > 49) {
        points = points + 8
      }
      player.points = points;
    })
    this.allPlayers = battingData;
  }

  calculateBowlingPoints(bowlingData) {
    this.allPlayers.map(player => {
      const bowler = bowlingData.find(bd => player.name === bd.name);
      if (bowler) {
        let points = 0;
        points = player.points + (bowler.total_wickets * 6)
        if (bowler.total_wickets > 1 && bowler.total_wickets < 4) {
          points = points + 4
        } else if (bowler.total_wickets > 4 && bowler.total_wickets < 6) {
          points = points + 6
        } else if (bowler.total_wickets > 6) {
          points = points + 10
        }
        player.points = points;
      }
    });
  }

  calculateFieldingPoints(fieldingData) {
    this.allPlayers.map(player => {
      const fielder = fieldingData.find(pd => player.name === pd.name);
      if (fielder) {
        let points = 0;
        points = player.points + (fielder.total_catches * 1 + fielder.stumpings * 1);
        player.points = points;
      }
    });
  }

  calculateTeamPoints(teams, players) {
    teams.map(team => {
      team.points = 0;
      // calculat owner points
      const owner = this.ownersData.find(p => p.name.toLowerCase() === team.owner.name.toLowerCase());
      if (owner) {
        team.points = team.points + +owner.points;
      }

      // calculat captain points
      const captain = this.captainsData.find(p => p.name.toLowerCase() === team.captain.name.toLowerCase());
      if (captain) {
        team.points = team.points + +captain.points;
      }

      team.players.map(tp => {
        let player = players.find(p => p.name.toLowerCase() === tp.name.toLowerCase());
        if (player) {
          team.points = team.points + player.points;
        }
      })

      let oPlayer = players.find(p => p.name.toLowerCase() === team.owner.name.toLowerCase());
      if (oPlayer) {
        team.points = team.points + oPlayer.points;
      }

      let cPlayer = players.find(p => p.name.toLowerCase() === team.captain.name.toLowerCase());
      if (cPlayer) {
        team.points = team.points + cPlayer.points;
      }
    });
    return this.sortArray(teams);
  }

  sortArray(players) {
    players.sort(function (a, b) {
      const x = a.points;
      const y = b.points;

      if (x === y) {
        return 0;
      }
      if (typeof x === typeof y) {
        return x > y ? -1 : 1;
      }
      return typeof x < typeof y ? -1 : 1;
    });

    return players;
  }

  downloadFileTop10() {
    const top10Teams = this.allTeamsPoint.slice(0, 10);
    const nameArr = [];
    const teamNameArr = [];
    const ponitsArr = [];

    top10Teams.map(team => {
      nameArr.push({
        text: team.myName,
        fontSize: 12,
        alignment: 'center'
      })

      teamNameArr.push({
        text: team.teamName,
        fontSize: 12,
        alignment: 'center'
      })

      ponitsArr.push({
        text: Math.round(team.points * 100) / 100,
        fontSize: 12,
        alignment: 'center'
      })
    })
    pdfMake.createPdf(this.getDocumentDefinition(nameArr, teamNameArr, ponitsArr)).open();
  }

  downloadFile(team?) {
    const nameArr = [];
    const teamNameArr = [];
    const ponitsArr = [];

    this.allTeamsPoint.map(team => {
      nameArr.push({
        text: team.myName,
        fontSize: 12,
        alignment: 'center'
      })

      teamNameArr.push({
        text: team.teamName,
        fontSize: 12,
        alignment: 'center'
      })

      ponitsArr.push({
        text: Math.round(team.points * 100) / 100,
        fontSize: 12,
        alignment: 'center'
      })
    })
    pdfMake.createPdf(this.getDocumentDefinition(nameArr, teamNameArr, ponitsArr)).open();
  }

  getDocumentDefinition(nameArr, teamNameArr, ponitsArr) {
    return {
      content: [
        {
          text: 'Simeio Cricket Fantasy League Report',
          bold: true,
          fontSize: 20,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          columns: [
            [{
              text: 'Name',
              bold: true,
              fontSize: 12,
              alignment: 'center',
              margin: [0, 0, 0, 10]
            },
              nameArr
            ],
            [{
              text: 'Team Name',
              bold: true,
              fontSize: 12,
              alignment: 'center',
              margin: [0, 0, 0, 10]
            },
              teamNameArr
            ],
            [{
              text: 'Points',
              bold: true,
              fontSize: 12,
              alignment: 'center',
              margin: [0, 0, 0, 10]
            },
              ponitsArr
            ]
          ]
        }]
    };
  }


  fileChangeListener($event: any): void {
    let files = $event.srcElement.files;
    if (this.isCSVFile(files[0])) {
      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {
        if (files[0].name.indexOf('batting') !== -1) {
          this.battingData = this.csvJSON(reader.result);
          sessionStorage.setItem('batting', JSON.stringify(this.battingData));
        }
        if (files[0].name.indexOf('bowling') !== -1) {
          this.bowlingData = this.csvJSON(reader.result);
          sessionStorage.setItem('bowling', JSON.stringify(this.bowlingData));
        }
        if (files[0].name.indexOf('fielding') !== -1) {
          this.fieldingData = this.csvJSON(reader.result);
          sessionStorage.setItem('fielding', JSON.stringify(this.fieldingData));
        }
        if (files[0].name.indexOf('owner') !== -1) {
          this.ownersData = this.csvJSON(reader.result);
          sessionStorage.setItem('owners', JSON.stringify(this.ownersData));
        }
        if (files[0].name.indexOf('captain') !== -1) {
          this.captainsData = this.csvJSON(reader.result);
          sessionStorage.setItem('captains', JSON.stringify(this.captainsData));
        }

        this.updatePoints();
      };

      reader.onerror = function () {
        alert('Unable to read ' + input.files[0]);
      };

    } else if (this.isJSONFile(files[0])) {
      let input = $event.target;
      let reader = new FileReader();
      reader.readAsText(input.files[0]);

      reader.onload = () => {
        if (files[0].name.indexOf('allteams') !== -1) {
          const text = <string>reader.result
          this.allTeams = JSON.parse(text);
          sessionStorage.setItem('allteams', JSON.stringify(this.allTeams));
        }
        this.updatePoints();
      };

      reader.onerror = function () {
        alert('Unable to read ' + input.files[0]);
      };
    } else {
      alert("Please import valid .csv or .json file.");
      this.fileReset();
    }
  }

  // CHECK IF FILE IS A VALID CSV FILE
  isJSONFile(file: any) {
    return file.name.endsWith(".json");
  }

  // CHECK IF FILE IS A VALID CSV FILE
  isCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  csvJSON(csvText) {
    var lines = csvText.split("\n");
    var result = [];
    var headers = lines[0].split(",");
    for (var i = 1; i < lines.length - 1; i++) {
      var obj = {};
      var currentline = lines[i].split(",");
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
    return JSON.parse(JSON.stringify(result));
  }

  fileReset() {
    this.fileImportInput.nativeElement.value = "";
  }

  reset() {
    sessionStorage.clear();
    this.ownersData = ownerDetails;
    this.captainsData = captainsDetails;
    this.battingData = battingDetails;
    this.bowlingData = bowlingDetails;
    this.fieldingData = fielderDetails;
    this.allTeams = allTeamsDetails;

    this.playersService.resetPlayers().subscribe(
      response => {
        console.log(response);
        this.playersService.resetTeams().subscribe(
          response => {
            console.log(response);
            this.updatePoints();
          },
          error => () => {
            console.log('Error in loading player details from data store.', error);
          });
      },
      error => () => {
        console.log('Error in loading player details from data store.', error);
      });
  }

  displayUploadBtn() {
    if (this.displayUpload) {
      this.displayUpload = false;
    } else {
      this.displayUpload = true;
    }
  }
}
