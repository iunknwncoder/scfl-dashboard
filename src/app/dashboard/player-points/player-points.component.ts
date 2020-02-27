import { Component, OnInit, ViewChild, Input, OnChanges } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-player-points',
  templateUrl: './player-points.component.html',
  styleUrls: ['./player-points.component.css']
})
export class PlayerPointsComponent implements OnChanges {
  @Input() players;
  displayedColumns: string[] = ['myName', 'teamName', 'points'];
  playerDataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) playerPaginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) playerSort: MatSort;
  constructor() { }

  ngOnChanges() {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.playerDataSource = new MatTableDataSource<any>(this.sortArray(this.players));
    this.playerDataSource.paginator = this.playerPaginator;
    this.playerDataSource.sort = this.playerSort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.playerDataSource.filter = filterValue.trim().toLowerCase();

    if (this.playerDataSource.paginator) {
      this.playerDataSource.paginator.firstPage();
    }
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
    const top10Players = this.players.slice(0, 10);
    const nameArr = [];
    const teamNameArr = [];
    const ponitsArr = [];

    top10Players.map(team => {
      nameArr.push({
        text: team.name,
        fontSize: 12,
        alignment: 'center'
      })

      teamNameArr.push({
        text: team.teamN_name,
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

  downloadFile() {
    const nameArr = [];
    const teamNameArr = [];
    const ponitsArr = [];

    this.players.map(p => {
      nameArr.push({
        text: p.name,
        fontSize: 12,
        alignment: 'center'
      })

      teamNameArr.push({
        text: p.team_name,
        fontSize: 12,
        alignment: 'center'
      })

      ponitsArr.push({
        text: Math.round(p.points * 100) / 100,
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
}
