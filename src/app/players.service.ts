import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

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

  constructor(private http: Http) { }

  getPlayerDetails() {
    return this.http.get('/api/players')
      .map((res) => { return res.json(); })
      .catch(this.handleError);
  }

  addPlayertDetails(playerDetails) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    return this.http.post('/api/addPlayers', playerDetails, options)
      .map((res) => { return res.json(); })
      .catch(this.handleError)
  }

  getTeamsPoints() {
    return this.http.get('/api/teamPoints')
      .map((res) => { return res.json(); })
      .catch(this.handleError);
  }

  addTeamsPoints(playerDetails) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers });
    return this.http.post('/api/addTeamPoints', playerDetails, options)
      .map((res) => { return res.json(); })
      .catch(this.handleError)
  }

  resetTeams() {
    return this.http.get('/api/resetTeams')
      .map((res) => { return res.json(); })
      .catch(this.handleError);
  }

  
  resetPlayers() {
    return this.http.get('/api/resetPlayers')
      .map((res) => { return res.json(); })
      .catch(this.handleError);
  }

  private handleError(error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg);
    return errMsg;
  }
}
