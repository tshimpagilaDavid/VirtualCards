import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { MyPage } from './my.page';

describe('MyPage', () => {
  let component: MyPage;
  let fixture: ComponentFixture<MyPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
