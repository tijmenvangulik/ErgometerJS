import {App, IonicApp, Platform, MenuController} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {ErgometerConnect} from './pages/ergometer-connect/ergometer-connect';
import {ErgometerService} from './services/ergometer.service';
import {ErgometerValuesPage}  from './pages/ergometer-values/ergometer-values';

@App({
  templateUrl: 'build/app.html',
  config: {}, // http://ionicframework.com/docs/v2/api/config/Config/
  providers: [ErgometerService]
})
class MyApp {

  rootPage:any = ErgometerConnect;
  pages:Array<{title:string, component:any}>;

  constructor(private app:IonicApp,
              private platform:Platform,
              private menu:MenuController,
              private ergometerService:ErgometerService) {
    this.initializeApp();
    
    // set our app's pages
    this.pages = [
      {title: 'Connect', component: ErgometerConnect},
      {title: 'Ergometer values', component:ErgometerValuesPage}
    ];
  }



  protected onConnectionStateChanged(oldState:ergometer.MonitorConnectionState, newState:ergometer.MonitorConnectionState) {

  }

  initErgometer() {
    //this.performanceMonitor.multiplex=true; //needed for some older android devices which limited device capablity. This must be set before ting
    this.ergometerService.performanceMonitor.connectionStateChangedEvent.sub(this, this.onConnectionStateChanged);
    this.ergometerService.start();
  }


  public initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      this.initErgometer();
    });
  }

  openPage(page) {
    // close the menu when clicking a link from the menu
    this.menu.close();

    // navigate to the new page if it is not the current page
    let nav = this.app.getComponent('nav');
    nav.setRoot(page.component);
  }
}
