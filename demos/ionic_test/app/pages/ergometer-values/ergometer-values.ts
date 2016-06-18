import {Page, NavController} from 'ionic-angular';
import {ErgometerValuePower, ErgometerValueSpeed} from '../../components/ergometer-value/ergometer-value';

/*
  Generated class for the ErgometerValuesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Page({
  templateUrl: 'build/pages/ergometer-values/ergometer-values.html',
  directives: [ErgometerValuePower,ErgometerValueSpeed]
})
export class ErgometerValuesPage {
  constructor(public nav: NavController) {

  }
}
