/**
 * Created by tijmen on 02-05-16.
 */
///<reference path="../../typings/ergometer.d.ts"/>
import {Injectable,ApplicationRef} from 'angular2/core';
//import {row100meter} from './row100meter';

@Injectable()
export class ErgometerService   {
  get log():string {
    return this._log;
  }
  private _forceRefreshCalled = false;

  private _lastDeviceName : string = null;

  private _deviceList : string[] = [];

  private _performanceMonitor : ergometer.PerformanceMonitor;

  private _log : string;

  get deviceList():string[] {
    return this._deviceList;
  }
  get performanceMonitor():ergometer.PerformanceMonitor {
    return this._performanceMonitor;
  }
  constructor(private applicationRef :ApplicationRef) {
    this._performanceMonitor= new ergometer.PerformanceMonitor();
    this._log="Begin log";
    this.performanceMonitor.logLevel = ergometer.LogLevel.trace; //by default it is error, for more debug info  change the level
    this.performanceMonitor.logEvent.sub(this, this.onLog);

  }
  public forceRefresh() {
    //Force a refresh when every thing is done because we are outsite the angular scope
    if (!this._forceRefreshCalled) {
      setTimeout(()=>{
        this.applicationRef.tick(); //http://stackoverflow.com/questions/34827334/triggering-angular2-change-detection-manually
        this._forceRefreshCalled=false;
      })
    }
    this._forceRefreshCalled=true;
  }
  public get lastDeviceName() : string {
    if (!this._lastDeviceName) {

      var value=localStorage.getItem("lastDeviceName");
      if (value=="undefined" || value=="null" || value==null)
        this._lastDeviceName="";
      else this._lastDeviceName=value;
    }
    return this._lastDeviceName;
  }

  onLog(info:string, logLevel:ergometer.LogLevel) {
    this._log=this._log+'\n'+info;
    this.forceRefresh();
  }

  public set lastDeviceName(value : string) {
    if (this._lastDeviceName!=value) {
      this._lastDeviceName=value;
      localStorage.setItem("lastDeviceName",value);
    }
  }

  public start() {
    this._deviceList=[];
    //this.performanceMonitor.replay(row100meter);

    this.performanceMonitor.startScan((device : ergometer.DeviceInfo) : boolean => {
      this._deviceList.push(device.name);
      this.forceRefresh();
      if (!this.lastDeviceName || device.name==this.lastDeviceName) {
        return true;//this will connect
      }
      else return false;

    });

  }
}