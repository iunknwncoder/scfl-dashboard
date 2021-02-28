import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';

import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { saveAs } from 'file-saver';
import { PlayersService } from '../players.service.js';
import { environment } from '../../environments/environment'

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
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
  loading = false;

  constructor(public dialog: MatDialog, public formBuilder: FormBuilder, private playersService: PlayersService) {
  }

  ngOnInit() {
    this.allocatedCost = environment.ALLOCATED_COST;
    this.minimumGirls = environment.MINIMUM_GIRLS;
    this.minimumPlayers = environment.MINIMUM_PLAYERS;

    this.displayPointSystem = false;
    this.owners = [];
    this.captains = [];
    this.players = [];

    this.teamForm = this.formBuilder.group({
      yourEmpId: new FormControl('', [Validators.required]),
      yourName: new FormControl('', [Validators.required]),
      teamName: new FormControl('', [Validators.required]),
      owner: new FormControl('', [Validators.required]),
      captain: new FormControl('', [Validators.required])
    });

    this.getPlayers();
  }

  getPlayers() {
    this.loading = true;
    this.playersService.getPlayers().subscribe((response: any) => {
      this.loading = false;
      if (response && response.length > 0) {
        this.owners = response.filter(res => res.isOwner === '1');
        this.captains = response.filter(res => res.isCaptain === '1');
        this.players = response.filter(res => (res.isCaptain !== '1' && res.isOwner !== '1'));
        this.sortArray();
        this.dataSource = new MatTableDataSource<any>(this.players);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    }, error => () => {
      this.loading = false;
      this.owners = [];
      this.captains = [];
      this.players = [];

      this.dataSource = new MatTableDataSource<any>(this.players);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      console.log('Error occurred while getting players', error);
    });
  }

  sortArray() {
    this.players.sort(function (a, b) {
      const x = +a.cost;
      const y = +b.cost;

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

    this.myTeam.empId = this.teamForm.value.yourEmpId;
    this.myTeam.name = this.teamForm.value.yourName;
    this.myTeam.teamName = this.teamForm.value.teamName;
    this.myTeam.owner = this.teamForm.value.owner;
    this.myTeam.captain = this.teamForm.value.captain;
    this.myTeam.players = this.selection.selected;
    this.myTeam.points = 0;

    if (!this.myTeam.empId) {
      alert('Please enter your employee id.');
      return;
    }

    if (!this.myTeam.name) {
      alert('Please enter your name.');
      return;
    }

    if (!this.myTeam.teamName) {
      // this.dispayMessage('Please enter your team name.');
      alert('Please enter your team name.');
      return;
    }

    if (!this.myTeam.owner) {
      alert('Please select owner of your team.');
      return;
    }

    if (!this.myTeam.captain) {
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
      this.loading = true;
      this.playersService.addTeam(this.myTeam).subscribe(response => {
        this.loading = false;
        console.log(JSON.parse(JSON.stringify(response)));
        alert('Team created successfully!!!');
      },
        error => () => {
          this.loading = false;
          console.log('Error something went wrong while creating team. Please send us downloaded file', error);
          const blob = new Blob([JSON.stringify(this.myTeam)], { type: 'application/json' });
          saveAs(blob, this.myTeam.teamName);
          alert('Error something went wrong while creating team. Please send us downloaded file');
        }
      );
    }
  }
}
