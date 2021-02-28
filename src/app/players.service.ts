import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
// import { Http, Headers, RequestOptions } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { environment } from './../environments/environment'

export class Player {
  name: string;
  gender: string;
  team: string;
  cost: number;
  points: number;
}

export class Team {
  name: string;
  teamName: string;
  points: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlayersService {
  constructor(private http: HttpClient) { }

  getRequestHeader(): HttpHeaders {
    // Create variable of type Header.
    const headers = new HttpHeaders();
    headers.set('Accept', 'application/json; charset=UTF-8');
    headers.set('Content-Type', 'application/json; charset=UTF-8');

    // Finally return the header object.
    return headers;
  }

  getPlayers() {
    return this.http.get(environment.API_URL + '/api/players');
  }

  addPlayers(playerDetails) {
    return this.http.post(environment.API_URL + '/api/addPlayers', playerDetails, { headers: this.getRequestHeader() });
  }

  addTeam(team) {
    return this.http.post(environment.API_URL + '/api/addTeam', team, { headers: this.getRequestHeader() });
  }

  getTeams() {
    return this.http.get(environment.API_URL + '/api/getTeams');
  }

  addTeams(teams) {
    return this.http.post(environment.API_URL + '/api/addTeams', teams, { headers: this.getRequestHeader() });
  }

  resetTeams() {
    return this.http.get(environment.API_URL + '/api/resetTeams');
  }


  resetPlayers() {
    return this.http.get(environment.API_URL + '/api/resetPlayers');
  }
}
