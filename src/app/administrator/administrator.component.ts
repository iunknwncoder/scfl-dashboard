import { Component, OnInit, ViewChild } from '@angular/core';
import { Player, Team, PlayersService } from '../players.service.js';
import { animate, state, style, transition, trigger } from "@angular/animations";
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-administrator',
  templateUrl: './administrator.component.html',
  styleUrls: ['./administrator.component.css'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 100 })),
      transition('* => void', [
        animate(300, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class AdministratorComponent implements OnInit {
  ownersData: any = [];
  captainsData: any = [];
  battingData: any;
  bowlingData: any;
  fieldingData: any;
  allPlayers = [];
  loading = false;
  loadingOwners = false;
  loadingCaptains = false;
  playerData: Player[]
  password = "";
  isValidPlayersFile = false;
  isValidPointFile = false;
  isValidTeamFile = false;
  isValidUser = false;
  files: Array<any> = [];
  uploadedFiles: Array<any> = [];
  displayedColumns: string[] = ['name', 'team', 'league', 'runnerUp', 'finalist', 'totalPoints'];
  ownerDataSource: MatTableDataSource<any>;
  captainDataSource: MatTableDataSource<any>;

  @ViewChild('fileImportInput', { static: true }) fileImportInput: any;

  constructor(public playersService: PlayersService, public dialog: MatDialog) { }

  ngOnInit() {
    this.ownersData = [];
    this.captainsData = [];
    this.ownerDataSource = new MatTableDataSource<any>(this.ownersData);
    this.captainDataSource = new MatTableDataSource<any>(this.captainsData);
    // this.validateAdmin();
  }

  validateAdmin() {
    if (this.password === 'scfl@123') {
      this.isValidUser = true;
      this.getPlayers();
    } else {
      alert("Please enter valid password!!!")
      this.isValidUser = false;
    }
  }

  getPlayers() {
    this.loading = true;
    this.playersService.getPlayers().subscribe((response: any) => {
      this.loading = false;
      if (response && response.length > 0) {
        this.allPlayers = response;

        this.ownersData = response.filter(res => res.isOwner === '1');
        this.ownerDataSource = new MatTableDataSource<any>(this.ownersData);

        this.captainsData = response.filter(res => res.isCaptain === '1');
        this.captainDataSource = new MatTableDataSource<any>(this.captainsData);
      }
    }, error => () => {
      this.loading = false;
      this.ownerDataSource = new MatTableDataSource<any>([]);
      this.captainDataSource = new MatTableDataSource<any>([]);
      console.log('Error occurred while getting players', error);
    });
  }

  uploadFiles() {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.onchange = () => {
      for (let index = 0; index < fileUpload.files.length; index++) {
        const file = fileUpload.files[index];

        let indexOfFile = null;
        indexOfFile = this.uploadedFiles.findIndex(it => it.name === file.name);

        this.files.push(file);

        if (file.name.toLocaleLowerCase().indexOf('players') !== -1) {
          this.isValidPlayersFile = true;
        } else {
          this.isValidPlayersFile = false;
        }

        if (file.name.toLocaleLowerCase().indexOf('teams') !== -1) {
          this.isValidTeamFile = true;
        } else {
          this.isValidTeamFile = false;
        }

        if (file.name.toLocaleLowerCase().indexOf('batting') !== -1 ||
          file.name.toLocaleLowerCase().indexOf('bowling') !== -1 ||
          file.name.toLocaleLowerCase().indexOf('fielding') !== -1) {
          this.isValidPointFile = true;
        } else {
          this.isValidPointFile = false;
        }
      }
      // this.uploadFiles();
    };
    fileUpload.click();
  }

  submitFile() {
    this.files.forEach(file => {
      let reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        const filename = file.name.toLowerCase();
        const fileData = <string>reader.result
        if (filename.indexOf('players') !== -1) {
          if (this.isJSONFile(file)) {
            this.playerData = JSON.parse(fileData);
          } else {
            this.convertPlayerDetailsInJson(fileData)
          }
          this.addPlayers();
        } else if (filename.indexOf('teams') !== -1) {
          this.addTeams(JSON.parse(fileData));
        } else {
          alert('Please select valid file to add/update players');
        }
      };
      reader.onerror = function () {
        alert('Unable to read ' + file.name);
      };
    })
  }

  convertPlayerDetailsInJson(csvText) {
    var lines = csvText.split("\n");
    var result = [];
    var headers = lines[0].split(",");
    for (var i = 1; i < lines.length - 1; i++) {
      var obj = {};
      var currentline = lines[i].split(",");
      for (var j = 0; j < headers.length; j++) {
        if (headers[j] && headers[j].trim() !== '') {
          obj[headers[j].trim()] = currentline[j];
        }
      }
      obj['league'] = 0;
      obj['runnerUp'] = 0;
      obj['finalist'] = 0;
      obj['points'] = 0;
      result.push(obj);
    }
    this.playerData = JSON.parse(JSON.stringify(result));
  }

  addPlayers() {
    this.loading = true;
    this.playersService.resetPlayers().subscribe(response => {
      this.playersService.addPlayers(this.playerData).subscribe(response => {
        this.loading = false;
        this.allPlayers = this.playerData;
        this.files = [];
        this.isValidPlayersFile = false;
      }, error => () => {
        this.loading = false;
        console.log('Error occurred while adding players', error);
        alert('Error occurred while adding players!!!');
      });
    }, error => () => {
      this.loading = false;
      console.log('Error in deleting players details', error);
      alert('Error in deleting players details!!!');
    });
  }

  addTeams(teams) {
    this.loading = true;
    this.playersService.addTeams(teams).subscribe(response => {
      this.loading = false;
      this.files = [];
      this.isValidTeamFile = false;
    }, error => () => {
      this.loading = false;
      console.log('Error occurred while adding teams', error);
      alert('Error occurred while adding teams!!!');
    });
  }

  deleteFile(file) {
    let index = this.files.findIndex(f => f.name === file.name);
    if (index != -1) {
      this.files.splice(index, 1);
      if (file.name.indexOf('batting') !== -1) {
        this.battingData = [];
      } else if (file.name.indexOf('bowling') !== -1) {
        this.bowlingData = [];

      } else if (file.name.indexOf('fielding') !== -1) {
        this.fieldingData = [];
      }
    }

    if (this.files && this.files.length > 0) {
      this.files.forEach(file => {
        if (file.name.toLocaleLowerCase().indexOf('players') !== -1) {
          this.isValidPlayersFile = true;
        } else {
          this.isValidPlayersFile = false;
        }

        if (file.name.toLocaleLowerCase().indexOf('players') !== -1) {
          this.isValidTeamFile = true;
        } else {
          this.isValidTeamFile = false;
        }

        if (file.name.toLocaleLowerCase().indexOf('batting') !== -1 ||
          file.name.toLocaleLowerCase().indexOf('bowling') !== -1 ||
          file.name.toLocaleLowerCase().indexOf('fielding') !== -1) {
          this.isValidPointFile = true;
        } else {
          this.isValidPointFile = false;
        }
      })
    } else {
      this.isValidPlayersFile = false;
      this.isValidPointFile = false;
      this.isValidTeamFile = false;
    }
  }

  fileChangeListener($event: any): void {
    let files = $event.srcElement.files;
    if (this.isCSVFile(files[0])) {
      let input = $event.target;
      let reader = new FileReader();
      const file = input.files[0];
      reader.readAsText(file);
      reader.onload = () => {
        const filename = file.name.toLowerCase();
        const fileData = <string>reader.result
        if (filename.indexOf('batting') !== -1) {
          if (this.isJSONFile(file)) {
            this.battingData = JSON.parse(fileData);
          } else {
            this.battingData = this.csvJSON(fileData);
          }
        } else if (filename.indexOf('bowling') !== -1) {
          if (this.isJSONFile(file)) {
            this.bowlingData = JSON.parse(fileData);
          } else {
            this.bowlingData = this.csvJSON(fileData);
          }
        } else if (filename.indexOf('fielding') !== -1) {
          if (this.isJSONFile(file)) {
            this.fieldingData = JSON.parse(fileData);
          } else {
            this.fieldingData = this.csvJSON(fileData);
          }
        }
      };

      reader.onerror = function () {
        alert('Unable to read ' + input.files[0]);
      };

    } else {
      alert("Please import valid .csv or .json file.");
    }
  }

  calculateBattingPoints(battingData) {
    this.allPlayers.map(player => {
      const batsman = battingData.find(bd => player.name === bd.name);
      // initialise point calculation
      let points = 0;
      if (batsman) {
        points = points + (batsman.total_runs * 0.5 + batsman['4s'] * 0.5 + batsman['6s'] * 1 + batsman.total_runs * (batsman.strike_rate / 100));
        if (batsman.total_runs > 24 && batsman.total_runs < 50) {
          points = points + 4
        } else if (batsman.total_runs.total_wickets > 49) {
          points = points + 8
        }
        player.points = points;
      } else {
        player.points = points;
      }
    });
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
        player.points = player.points + (fielder.total_catches * 1 + fielder.stumpings * 1);
      }
    });
  }

  updatePoints() {
    var confirmed = confirm("have you update individual points for Owners and Captains?");
    if (confirmed) {
      //update individual player points
      this.updatePlayersPoint();
      this.loading = true;
      this.playersService.resetPlayers().subscribe(response => {
        this.playersService.addPlayers(this.allPlayers).subscribe(response => {
          this.loading = false;
          console.log("Successfully updated players point");
        }, error => () => {
          this.loading = false;
          console.log('Error while updating players point in the system', error);
        });
      }, error => () => {
        this.loading = false;
        console.log('Error while deleting player details from data store.', error);
      });
    } else {
      alert("Please individual points for Owners and Captains.")
    }
  }

  updatePlayersPoint() {
    // update batting points
    if (this.battingData && this.battingData.length > 0)
      this.calculateBattingPoints(this.battingData);
    //update bowling points
    if (this.bowlingData && this.bowlingData.length > 0)
      this.calculateBowlingPoints(this.bowlingData);
    // update fielding points
    if (this.fieldingData && this.fieldingData.length > 0)
      this.calculateFieldingPoints(this.fieldingData);
    // update owner/captain points
    this.UpdateCaptainOwnerPoints();
  }

  UpdateCaptainOwnerPoints() {
    this.allPlayers.forEach(p => {
      this.ownersData.forEach(o => {
        if (p.name.toLowerCase() === o.name.toLowerCase()) {
          p.league = o.league;
          p.runnerUp = o.runnerUp;
          p.finalist = o.finalist
          p.points = +p.points + +(+p.league * 8) + (+p.runnerUp * 8) + (+p.finalist * 15);
        }
      });

      this.captainsData.forEach(c => {
        if (p.name.toLowerCase() === c.name.toLowerCase()) {
          p.league = c.league;
          p.runnerUp = c.runnerUp;
          p.finalist = c.finalist
          p.points = +p.points + +(+p.league * 8) + (+p.runnerUp * 8) + (+p.finalist * 15);
        }
      });
    });
  }

  // CHECK IF FILE IS A VALID CSV FILE
  isJSONFile(file: any) {
    return file ? file.name.endsWith(".json") : false;
  }

  // CHECK IF FILE IS A VALID CSV FILE
  isCSVFile(file: any) {
    return file ? file.name.endsWith(".csv") : false;
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

  resetPoints() {
    var confirmed = confirm("Are you sure want to reset teams points?");
    if (confirmed) {
      this.loading = true;
      this.allPlayers.forEach(p => {
        p.league = 0;
        p.runnerUp = 0;
        p.finalist = 0;
        p.points = 0;
      });

      this.playersService.resetPlayers().subscribe(response => {
        this.playersService.addPlayers(this.allPlayers).subscribe(response => {
          this.loading = false;
          this.files = [];
          console.log("Successfully updated points");
          alert("Successfully reset points!!!");
        }, error => () => {
          this.loading = false;
          alert("Successfully reset points!!!");
          console.log('Successfully reset points!!!', error);
        });
      }, error => () => {
        this.loading = false;
        alert("Error in updating points!!!");
        console.log('Error in deleting players detail from data store.', error);
      });
    }
  }

  resetPlayers() {
    var confirmed = confirm("Are you sure want to delete existing player details?");
    if (confirmed) {
      this.loading = true;
      this.playersService.resetPlayers().subscribe(response => {
        this.loading = false;
        this.ownersData = [];
        this.ownerDataSource = new MatTableDataSource<any>(this.ownersData);

        this.captainsData = [];
        this.captainDataSource = new MatTableDataSource<any>(this.captainsData);
        console.log("Succssfully deleted players details");
        alert('Successfully deleted players details!!!');
      }, error => () => {
        this.loading = false;
        console.log('Error in deleting players details', error);
        alert('Error in deleting players details!!!');
      });
    }
  }

  resetTeams() {
    var confirmed = confirm("Are you sure want to delete existing team details?");
    if (confirmed) {
      this.loading = true;
      this.playersService.resetTeams().subscribe(response => {
        this.loading = false;
        console.log("Succssfully deleted teams details");
        alert('Successfully deleted teams details!!!');
      }, error => () => {
        this.loading = false;
        console.log('Error in deleting team details', error);
        alert('Error in deleting team details!!!');
      });
    }
  }
}
