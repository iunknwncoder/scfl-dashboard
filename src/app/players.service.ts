import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayersService {

  constructor() { }

  players: BehaviorSubject<any> = new BehaviorSubject([]);
  public readonly totalPlayers: Observable<any> = this.players.asObservable();

  playerCost: BehaviorSubject<any> = new BehaviorSubject(0);
  public readonly totalPlayerCost: Observable<any> = this.playerCost.asObservable();

  updatePlayerCost(cost) {
    this.playerCost.next(cost);
  }

  updatePlayersCount(count) {
    this.playerCost.next(count);
  }
}
