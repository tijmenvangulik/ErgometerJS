/**
 * Created by tijmen on 03-05-16.
 */
import {Component} from 'angular2/core';
import {ErgometerService} from '../../services/ergometer.service';
import {IONIC_DIRECTIVES} from 'ionic-angular';


class ErgometerValueBase {
   label : string;
   value : string;

  constructor(
      protected ergometerService: ErgometerService) {

  }

}

class ErgometerValueBaseAdditionalStatus extends ErgometerValueBase {
  protected setValue(data : ergometer.RowingAdditionalStatus1)   {
      //this.value=data.speed.toFixed(2);
    }
  protected onRowingAdditionalStatus1(data : ergometer.RowingAdditionalStatus1) {
      this.setValue(data);
      this.ergometerService.forceRefresh();
    }
  constructor( ergometerService: ErgometerService) {
    super(ergometerService);
    this.ergometerService.performanceMonitor.rowingAdditionalStatus1Event.sub(this,
          this.onRowingAdditionalStatus1);

      this.value='-';

    }
    ngOnDestroy() {
      this.ergometerService.performanceMonitor.rowingAdditionalStatus1Event.unsub(this.onRowingAdditionalStatus1);
    }
}

@Component({
  selector:'ergometer-value-power',
  templateUrl: 'build/components/ergometer-value/ergometer-value.html',
  directives: [IONIC_DIRECTIVES]
})
export class ErgometerValuePower extends ErgometerValueBaseAdditionalStatus {

  protected setValue(data:ergometer.RowingAdditionalStatus1) {
    this.value=data.averagePower.toFixed(2);
  }
  constructor( ergometerService: ErgometerService) {
    super(ergometerService);
    this.label='Power';
  }
}

@Component({
  selector:'ergometer-value-speed',
  templateUrl: 'build/components/ergometer-value/ergometer-value.html',
  directives: [IONIC_DIRECTIVES]
})
export class ErgometerValueSpeed extends ErgometerValueBaseAdditionalStatus {
  protected setValue(data:ergometer.RowingAdditionalStatus1) {
    this.value=data.speed.toFixed(2);

  }
  constructor( ergometerService: ErgometerService) {
    super(ergometerService);
    this.label='Speed';
  }
}