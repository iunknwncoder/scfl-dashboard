import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Player, Team, PlayersService } from '../players.service.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DashboardComponent implements OnInit {
  allTeamData: Team[] = [];
  allPlayers: Player[] = [];
  displayPoints = false;
  loading = false;

  displayedColumns: string[] = ['name', 'teamName', 'points', 'expandRow'];
  displayedItemColumns: string[] = ['name', 'points'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(public playersService: PlayersService) { }

  ngOnInit() {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
    this.loading = true;
    this.playersService.getTeams().subscribe((response: any) => {
      console.log(response);
      this.allTeamData = response;
      this.playersService.getPlayers().subscribe((response: any) => {
        console.log(response);
        this.loading = false;
        this.allPlayers = response;
        if (this.allTeamData && this.allPlayers) {
          this.allTeamData.map((team: any) => {
            team.players.map(tp => {
              const player = this.allPlayers.find(ap => ap.name.toLowerCase() === tp.name.toLowerCase());
              tp.points = player.points; 
              team.points = +team.points + +tp.points;
            });

            const oPlayer = this.allPlayers.find(ap => ap.name.toLowerCase() === team.owner.name.toLowerCase());
            team['players'].push(oPlayer);
            team.points = +team.points + +oPlayer.points;

            const cPlayer = this.allPlayers.find(ap => ap.name.toLowerCase() === team.captain.name.toLowerCase());
            team['players'].push(cPlayer);
            team.points = +team.points + +cPlayer.points;
            team.players = this.sortArray(team.players);
            team.isExpanded = false;
          })

          this.allTeamData = this.sortArray(this.allTeamData);

          this.dataSource = new MatTableDataSource<any>(this.allTeamData);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      },
        error => () => {
          this.loading = false;
          console.log('Error in loading player details from data store.', error);
        });
    },
      error => () => {
        this.loading = false;
        console.log('Error in loading team details from data store.', error);
      });
  }

  sortArray(data) {
    return data.sort(function (a, b) {
      const x = +a.points;
      const y = +b.points;

      if (x === y) {
        return 0;
      }
      if (typeof x === typeof y) {
        return x > y ? -1 : 1;
      }
      return typeof x < typeof y ? -1 : 1;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  toggleScreen(event) {
    this.displayPoints = event;
  }

  downloadFileTop10() {
    const top10Teams = this.allTeamData.slice(0, 10);
    const nameArr = [];
    const teamNameArr = [];
    const ponitsArr = [];

    top10Teams.map(team => {
      nameArr.push({
        text: team.name,
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

    this.allTeamData.map(team => {
      nameArr.push({
        text: team.name,
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
}
