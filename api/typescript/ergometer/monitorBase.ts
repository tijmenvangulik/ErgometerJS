/**
 * Concept 2 ergometer Performance Monitor api for Cordova
 *
 * This will will work with the PM5
 *
 * Created by tijmen on 01-06-15.
 * License:
 *
 * Copyright 2016 Tijmen van Gulik (tijmen@vangulik.org)
 * Copyright 2016 Tijmen van Gulik (tijmen@vangulik.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace ergometer {


  export interface ErrorHandler {
    (e : any) : void;
  }
  export enum LogLevel {error,info,debug,trace}

  export interface LogEvent extends pubSub.ISubscription {
      (text : string,logLevel : LogLevel) : void;
  }
  export enum MonitorConnectionState {inactive,deviceReady,scanning,connecting,connected,servicesFound,readyForCommunication}

  export interface ConnectionStateChangedEvent extends pubSub.ISubscription {
      (oldState : MonitorConnectionState,newState : MonitorConnectionState) : void;
  }
  export class MonitorBase {

    private _logEvent= new pubSub.Event<LogEvent>();
    private _logLevel : LogLevel = LogLevel.error;
    private _connectionStateChangedEvent = new pubSub.Event<ConnectionStateChangedEvent>();   

    protected _connectionState : MonitorConnectionState = MonitorConnectionState.inactive;

    /**
    * By default it the logEvent will return errors if you want more debug change the log level
    * @returns {LogLevel}
    */
    public get logEvent(): pubSub.Event<LogEvent> {
      return this._logEvent;
    }
    
    public constructor() {
        
        this.initialize();
        
    }
    protected initialize() {
        
     
    }

    get logLevel():LogLevel {
      return this._logLevel;
    }


    /**
     * By default it the logEvent will return errors if you want more debug change the log level
     * @param value
     */
    set logLevel(value:LogLevel) {
        this._logLevel = value;
    }
    public disconnect() {
        
    }
    /**
     * read the current connection state
     * @returns {MonitorConnectionState}
     */
    public get connectionState():MonitorConnectionState {
        return this._connectionState;
    }

    protected connected() {
        
    }
    /**
     * event which is called when the connection state is changed. For example this way you
     * can check if the device is disconnected.
     * connect to the using .sub(this,myFunction)
     * @returns {pubSub.Event<ConnectionStateChangedEvent>}
     */
    public get connectionStateChangedEvent(): pubSub.Event<ConnectionStateChangedEvent> {
      return this._connectionStateChangedEvent;
    }
    public debugInfo(info : string) {
      if (this.logLevel>=LogLevel.debug)
          this.logEvent.pub(info,LogLevel.debug);
    }

    /**
     *
     * @param info
     */
    public showInfo(info : string) {
        if (this.logLevel>=LogLevel.info)
            this.logEvent.pub(info,LogLevel.info);
    }

    /**
     * Print debug info to console and application UI.
     * @param info
     */
    public traceInfo(info : string) {
      if (this.logLevel>=LogLevel.trace)
          this.logEvent.pub(info,LogLevel.trace);
    }

    /**
     * call the global error hander and call the optional error handler if given
     * @param error
     */
    public handleError(error:string,errorFn? : ErrorHandler) {
        if (this.logLevel>=LogLevel.error)
            this.logEvent.pub(error,LogLevel.error);
        if (errorFn) errorFn(error);
    }
    

    /**
     * Get an error function which adds the errorDescription to the error ,cals the global and an optional local funcion
     * @param errorDescription
     * @param errorFn
     */
    public getErrorHandlerFunc(errorDescription : string, errorFn? :ErrorHandler) :ErrorHandler {

        return (e) => {
            this.handleError(errorDescription+':'+e.toString(),errorFn);
      }

    }
    protected beforeConnected() {

    }
    /**
     *
     * @param value
     */
    protected changeConnectionState(value : MonitorConnectionState) {
      if (this._connectionState!=value) {
          var oldValue=this._connectionState;
          this._connectionState=value;
          if (value==MonitorConnectionState.connected) {
              this.beforeConnected();
          }
          this.connectionStateChangedEvent.pub(oldValue,value);
          if (value==MonitorConnectionState.connected) {
              this.connected();
          }
            
      }
    }
    
   
  }
}