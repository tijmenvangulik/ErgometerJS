/**
 * Created by tijmen on 18-02-16.
 */
namespace ergometer.ble {
    
    export interface CallBackEvent extends IRecordingItem{
        resolve? : (e? :any)=>void;
        reject? : (e:any)=>void;
    }
    export class ReplayDriver implements IDriver {
        private _realDriver:IDriver;

        private _events : IRecordingItem[] = [];
        private _eventCallBackMethods : CallBackEvent[] = [];
        private _eventCallbacks : CallBackEvent[] = [];
        private _playing : boolean =false;
        private _eventIndex : number =0;
        private _startTime : number;
        private _checkQueueTimerId : number = null;

        private _performanceMonitor : MonitorBase;

        protected getRelativeTime() : number {
            return utils.getTime()-this._startTime
        }

        constructor (performanceMonitor : MonitorBase,realDriver : IDriver)  {
            this._performanceMonitor=performanceMonitor;
            this._realDriver=realDriver;
        }
        public get events():ergometer.ble.IRecordingItem[] {
            return this._events;
        }
        protected isCallBack(eventType : RecordingEventType) : boolean {
           return (eventType==RecordingEventType.scanFoundFn ||
                    eventType==RecordingEventType.disconnectFn ||
                    eventType==RecordingEventType.notificationReceived);
        }
        protected isSameEvent(event1 : IRecordingItem,event2: IRecordingItem) {
            var result= event1.eventType==event2.eventType;
            if (result && utils.isDefined(event1.data) && utils.isDefined(event2.data) && event1.data && event2.data ) {
                let data1=<IRecordCharacteristic>event1.data;
                let data2=<IRecordCharacteristic>event2.data;
                if (result && ( utils.isDefined(data1.serviceUIID) || utils.isDefined(data2.serviceUIID) ) )
                    result= data1.serviceUIID==data2.serviceUIID;
                if (result && ( utils.isDefined(data1.characteristicUUID) || utils.isDefined(data2.characteristicUUID) ))
                    result= data1.characteristicUUID==data2.characteristicUUID;

            }
            return result;

        }


        protected runEvent(event : IRecordingItem, queuedEvent : CallBackEvent) {

            if (this._performanceMonitor.logLevel>=LogLevel.trace)
                this._performanceMonitor.traceInfo("run event:"+JSON.stringify(event));
            if (event.error) {
                queuedEvent.reject(event.error);

            }
            else {
                var data : any =null;
                if (event.data ) {
                    data= event.data;
                    var eventType=RecordingEventType[event.eventType];
                    if (eventType==RecordingEventType.readCharacteristic ||
                        eventType==RecordingEventType.notificationReceived) {
                        data=utils.hexStringToTypedArray(data.data).buffer;
                    }
                }
                if (queuedEvent.resolve) {
                    try {
                        if (data) queuedEvent.resolve(data);
                        else queuedEvent.resolve();
                    }
                    catch (e) {
                        //do not let it stop on replay errors, just continue and log
                        this._performanceMonitor.handleError("Error: while replaying event"+e)
                    }

                }

            }


        }
        protected runTimedEvent(event : IRecordingItem, queuedEvent : CallBackEvent) {
            setTimeout(()=> {
                this.runEvent(event, queuedEvent);
            },queuedEvent.timeStamp-event.timeStamp);
        }

        protected removeEvent(i : number) {
            this._events.splice(i,1);
        }
        protected checkQueue() {
            var keepChecking = true;
            while (keepChecking && this._events.length>0 && this._events[0].timeStamp<=this.getRelativeTime() ) {
                keepChecking=false; //by default do not keep on checking
                var event = this._events[0];
                if (this.isCallBack(RecordingEventType[event.eventType])) {
                    //run call backs directly on the given time
                    if (event.timeStamp<=this.getRelativeTime()) {
                        var found= false;
                        this._eventCallbacks.forEach((callbackEvent) =>{
                           if (this.isSameEvent(event,callbackEvent)) {
                               this.runEvent(event,callbackEvent);
                               keepChecking=true;
                               found=true;
                           }
                        });
                        if (found) this.removeEvent(0);

                    }
                }
                else {

                    if (this._eventCallBackMethods.length>0 ) {
                        for (var i=0;i<this._eventCallBackMethods.length;i++) {
                            var eventQueued = this._eventCallBackMethods[i];
                            if (this.isSameEvent(eventQueued,event)) {
                                this._eventCallBackMethods.splice(i,1);
                                this.removeEvent(0);
                                keepChecking=true;
                                if (event.timeStamp<=eventQueued.timeStamp) this.runEvent(event,eventQueued);
                                else this.runTimedEvent(event,eventQueued);

                                break;
                            }
                        }


                    }
               }
            }
            if (this._events.length>0) {
                let event = this._events[0];
                this.timeNextCheck(event.timeStamp);
            }
            this.checkAllEventsProcessd();

        }
        protected checkAllEventsProcessd() : boolean {
            var allDone= (this.events.length==0) && (this._eventCallBackMethods.length==0);
            if (allDone && this.playing) {
                this.playing=false;
            }
            return allDone;
        }
        protected timeNextCheck(timeStamp? : number) {
            if (this._checkQueueTimerId) {
                window.clearTimeout(this._checkQueueTimerId)
                this._checkQueueTimerId=null;
            }
            var duration =0;
            if (timeStamp) {
                duration=this.getRelativeTime()-timeStamp;
                if (duration==0) duration=100;
            }


            this._checkQueueTimerId=setTimeout(()=>{
                this.checkQueue()
            },duration);
        }

        protected addEvent(eventType : RecordingEventType, isMethod : boolean,
                           resolve? : (e? :any)=>void, reject? : (e:any)=>void,
                           serviceUIID? :string,  characteristicUUID? : string
                            ) {
            var event : CallBackEvent= {
                timeStamp: this.getRelativeTime(),
                eventType: RecordingEventType[eventType]
            };
            if (resolve) event.resolve=resolve;
            if (reject) event.reject=reject;
            if (serviceUIID || characteristicUUID) {
                var data : IRecordCharacteristic={
                    serviceUIID:serviceUIID,
                    characteristicUUID:characteristicUUID
                };

                event.data=data;
            }

            if (isMethod) {
                this._eventCallBackMethods.push(event);
            }
            else {
                this._eventCallbacks.push(event);
                this.timeNextCheck();
            }

        }
     
        public replay(events : IRecordingItem[]) {
            this._playing=false;
            this._startTime=utils.getTime();
            this._events=events;
            this._eventIndex=0;
            this.playing=true;
        }

        public get playing():boolean {

            return this._playing;
        }

        public set playing(value:boolean) {
            if ( this._playing != value ) {
                this._playing = value;
                if (!value) {
                    this._eventCallBackMethods=[];
                    this._eventCallbacks=[];
                    this._performanceMonitor.disconnect();
                }
            }
        }
        /*protected  playEvent(event : IRecordingItem) : Promise<void> {

                var timeDiff = event.timeStamp-event.timeStampReturn;
                if (event.error)  setTimeout(reject, timeDiff)
                else setTimeout(resolve, timeDiff);
        }  */

        public startScan( foundFn? :  IFoundFunc) : Promise<void> {
            this.addEvent(RecordingEventType.scanFoundFn,false,foundFn);
            return new Promise<void>((resolve, reject ) => {
                this.addEvent(RecordingEventType.startScan,true,resolve,reject);
            });

        }

        public stopScan() {
            this.addEvent(RecordingEventType.stopScan,true);
        }

        public connect(device : IDevice,disconnectFn : ()=>void) : Promise<void> {
            this.addEvent(RecordingEventType.disconnectFn,false,disconnectFn);
            return new  Promise<void>((resolve, reject ) => {
                this.addEvent(RecordingEventType.connect,true,resolve,reject);
            });
        }

        public disconnect() {
            this.addEvent(RecordingEventType.disconnect,true);
        }

        public writeCharacteristic(serviceUIID : string,characteristicUUID:string, data:ArrayBufferView) : Promise<void> {
            return new  Promise<void>((resolve, reject ) => {
                this.addEvent(RecordingEventType.writeCharacteristic,true,resolve,reject,serviceUIID,characteristicUUID);
            });
        }

        public readCharacteristic(serviceUIID : string,characteristicUUID:string) : Promise<ArrayBuffer> {
            return new  Promise<ArrayBuffer>((resolve, reject ) => {
                this.addEvent(RecordingEventType.readCharacteristic,true,resolve,reject,serviceUIID,characteristicUUID);
            });
        }
        public enableNotification(serviceUIID : string,characteristicUUID:string, receive:(data:ArrayBuffer) =>void) : Promise<void> {
            this.addEvent(RecordingEventType.notificationReceived,false,receive,null,serviceUIID,characteristicUUID);
            return new  Promise<void>((resolve, reject ) => {
                this.addEvent(RecordingEventType.enableNotification,true,resolve,reject,serviceUIID,characteristicUUID);

            });
        }

        public disableNotification(serviceUIID : string,characteristicUUID:string) : Promise<void> {
            return new  Promise<void>((resolve, reject ) => {
                this.addEvent(RecordingEventType.disableNotification,true,resolve,reject,serviceUIID,characteristicUUID);
            });
        }

    }
}