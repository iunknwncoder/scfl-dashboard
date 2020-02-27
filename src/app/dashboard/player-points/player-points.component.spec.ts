import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerPointsComponent } from './player-points.component';

describe('PlayerPointsComponent', () => {
  let component: PlayerPointsComponent;
  let fixture: ComponentFixture<PlayerPointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayerPointsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
