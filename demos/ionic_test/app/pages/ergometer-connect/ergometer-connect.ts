import {Page} from 'ionic-angular';
import {ErgometerService} from '../../services/ergometer.service';


@Page({
  templateUrl: 'build/pages/ergometer-connect/ergometer-connect.html'
})
export class ErgometerConnect {
  get selectedDeviceName():string {
    if (this.ergometerService.performanceMonitor.deviceInfo)
      return this.ergometerService.performanceMonitor.deviceInfo.name;
    else return null;
  }

  set selectedDeviceName(value:string) {
    if (this.selectedDeviceName != value) {
      if (value) {
        try {
          this.ergometerService.performanceMonitor.connectToDevice(value);
        }
        catch (e) {
          //should popup an error
        }

      }

    }
  }

  public get deviceNames() : string[] {
     return this.ergometerService.deviceList;
  }
  
  constructor(
      public ergometerService: ErgometerService
  ) {
    this.selectedDeviceName=this.ergometerService.lastDeviceName;
  }
}
