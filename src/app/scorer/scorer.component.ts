import { Component, OnInit } from '@angular/core';
import { PlayersService } from '../players.service';
import playerDetails from '../../assets/players.json';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-scorer',
  templateUrl: './scorer.component.html',
  styleUrls: ['./scorer.component.css']
})
export class ScorerComponent implements OnInit {
  playersData: any;
  constructor(private playersService: PlayersService) {
  }
  battingTeam = '';
  bowlingTeam = '';
  teams = ['Hotshots', 'Daredevils', 'The Assassinators', 'TNT', 'Ninjas', 'Simeio Spirits', 'Roaring Lions', 'Skarp Elva']
  player1 = {
    'name': '',
    'batting': {
      'runs': 0,
      'fours': 0,
      'sixes': 0
    }
  }

  player2 = {
    'name': '',
    'batting': {
      'runs': 0,
      'fours': 0,
      'sixes': 0
    }
  }

  player3 = {
    'name': '',
    'bowling': {
      'wickets': 0
    }
  }

  player4 = {
    'name': '',
    'fielding': {
      'catches': 0,
      'stumping': 0
    }
  }
  ngOnInit() {
    this.playersService.players.subscribe(p => {
      this.playersData = p;
    })
  }

  getBattingTeamPlayers() {
    return this.playersData.filter(p => p.team === this.battingTeam);
  }

  getBowlingTeamPlayers() {
    return this.playersData.filter(p => p.team === this.bowlingTeam);
  }

  checkTeams(type) {
    if (this.battingTeam === this.bowlingTeam) {
      alert('You have selected both the same team');

      if (type === 'batting') {
        this.bowlingTeam = '';
      } else {
        this.battingTeam = '';
      }
    }
  }

  changePlayer(player) {
    if (player == '1') {
      this.player1 = {
        'name': this.player1.name,
        'batting': {
          'runs': 0,
          'fours': 0,
          'sixes': 0
        }
      }
    } else if (player == '2') {
      this.player2 = {
        'name': this.player2.name,
        'batting': {
          'runs': 0,
          'fours': 0,
          'sixes': 0
        }
      }
    }
    else if (player == '3') {
      this.player3 = {
        'name': this.player3.name,
        'bowling': {
          'wickets': 0
        }
      }
    } else {
      this.player4 = {
        'name': this.player4.name,
        'fielding': {
          'catches': 0,
          'stumping': 0
        }
      }
    }
  }

  updateBattingPoints(player) {
    this.playersData.map(p => {
      if (p.name === player.name) {
        console.log(p.points);
        p.points = +p.points + (+player.batting.runs * 0.5 + +player.batting.fours * 0.5 + +player.batting.sixes * 1 + (+player.batting.runs % 25) * 4 + (+player.batting.runs % 50) * 8)
      }
    })
  }

  updateBowlingPoints(player) {
    this.playersData.map(p => {
      if (p.name === player.name) {
        p.points = +p.points + (+player.bowling.wickets * 6)
      }
    })
  }

  updateFieldingPoints(player) {
    this.playersData.map(p => {
      if (p.name === player.name) {
        p.points = +p.points + (+player.fielding.catches * 1 + +player.fielding.stumping * 1)
      }
    })
  }

  updatePoints() {
    console.log(this.playersData);
    const blob = new Blob([JSON.stringify(this.playersData)], { type: 'application/json' });
    saveAs(blob, 'update-points');
  }
}
