import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialogConfig, MatDialog, MatDialogModule } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import ownerDetails from '../../assets/owners.json';
import captainetails from '../../assets/captains.json';
import playerDetails from '../../assets/players.json';

import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import { PlayersService } from '../players.service.js';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.component.html',
  styleUrls: ['./my-team.component.css']
})
export class MyTeamComponent implements OnInit {
  owners: any;
  captains: any;
  players: any;
  allocatedCost = 30;
  minimumGirls = 3;
  minimumPlayers = 15;
  totalSelectedCost = 0;

  displayedColumns: string[] = ['select', 'name', 'team', 'gender', 'cost'];
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selection = new SelectionModel<any>(true, []);

  myTeam: any = {};
  teamForm: FormGroup;

  allowToSubmit = false;
  displayPointSystem = false;

  constructor(public dialog: MatDialog, public formBuilder: FormBuilder, private playersService: PlayersService) {
  }

  ngOnInit() {
    this.displayPointSystem = false;
    this.owners = ownerDetails;
    this.captains = captainetails;
    this.players = playerDetails;

    this.teamForm = this.formBuilder.group({
      teamName: new FormControl('', [Validators.required]),
      yourName: new FormControl('', [Validators.required]),
      owner: new FormControl('', [Validators.required]),
      captain: new FormControl('', [Validators.required])
    });

    this.sortArray();
    this.dataSource = new MatTableDataSource<any>(this.players);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  sortArray() {
    this.players.sort(function (a, b) {
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
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  updateCost(action, player) {
    if (action.checked) {
      this.totalSelectedCost = this.totalSelectedCost + +player.cost;
      if (this.totalSelectedCost > this.allocatedCost) {
        alert('You have exceed your allocated cost.');
      }
    } else {
      this.totalSelectedCost = this.totalSelectedCost - +player.cost;
    }
  }

  submit() {
    this.allowToSubmit = true;

    this.myTeam.teamName = this.teamForm.value.teamName;
    this.myTeam.myName = this.teamForm.value.yourName;
    this.myTeam.owner = this.teamForm.value.owner;
    this.myTeam.captain = this.teamForm.value.captain;
    this.myTeam.players = this.selection.selected;

    if (!this.teamForm.value.teamName) {
      // this.dispayMessage('Please enter your team name.');
      alert('Please enter your team name.');
      return;
    }

    if (!this.teamForm.value.yourName) {
      alert('Please enter your name.');
      return;
    }

    if (!this.teamForm.value.owner) {
      alert('Please select owner of your team.');
      return;
    }

    if (!this.teamForm.value.captain) {
      alert('Please select captain of your team.');
      return;
    }

    if (this.myTeam.players.length < this.minimumPlayers) {
      alert('Please select atleast 15 players in your team.');
      return;
    }

    let totalGirls = 0;
    let totalCost = 0;
    this.myTeam.players.map(p => {
      if (p.gender === 'F') {
        totalGirls = totalGirls + 1;
      }

      totalCost = +totalCost + +p.cost;
    })

    if (totalGirls < this.minimumGirls) {
      alert('Please select atleast 3 girls player in your team.');
      return;
    }

    if (totalCost > this.allocatedCost) {
      alert('You have exceed your allocated cost. Please re-select players');
      return;
    }

    if (this.allowToSubmit) {
      const blob = new Blob([JSON.stringify(this.myTeam)], { type: 'application/json' });
      saveAs(blob, this.myTeam.teamName);
      alert('Team created successfully!!!');
    }
  }
}
