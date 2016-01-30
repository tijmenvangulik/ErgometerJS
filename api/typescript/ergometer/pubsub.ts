/**
 *
 * Created by tijmen on 01-06-15.
 *
 * License:
 *
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
namespace ergometer.pubSub {

    export interface ISubscription {
        (...args: any[]): void;
    }

    export interface ISubscriptionItem {
        object : any;
        func : ISubscription;
    }

    export interface IDictionary {
        [name: string] : ISubscriptionItem[];
    }

    export class PubSub {
        private registry : IDictionary = { }

        public pub(name: string, ...args: any[]) {
            if (!this.registry[name]) return;

            this.registry[name].forEach((x : ISubscriptionItem) => {
                try {
                    x.func.apply(x.object, args);
                }
                catch (e)  {
                    console.log(e);
                }

            });
        }
        public pubASync(name: string, ...args: any[]) {

            if (!this.registry[name]) return;

            this.registry[name].forEach( (x : ISubscriptionItem)=> {
                setTimeout(function () { x.func.apply(x.object, args);},0 );

            });

        }


        public sub(applyObject : any,name: string, fn: ISubscription) {
            var evnt = this.registry[name];
            var newItem = {object : applyObject, func : fn };
            if (!evnt){
                this.registry[name] = [newItem];
            }
            else {
                //never subscribe the same function twice
                var funcExists = false;
                evnt.forEach(function (item : ISubscriptionItem) {if (item.func==fn) funcExists =true; } )

                if ( !funcExists)
                    evnt.push(newItem);
            }
            this.pub("subscribed",name,this.subscribeCount(name));
        }
        public unsub(name: string, fn: ISubscription) {
            var evnt = this.registry[name];
            if (evnt){
                //remove the function
                for ( var i=evnt.length-1 ; i>=0; i--) {
                    if (evnt[i].func==fn)
                        evnt.splice(i,1);
                }

            }
            this.pub("unsubscribed",name,this.subscribeCount(name));
        }
        public subscribeCount(name : string) {
            var evnt = this.registry[name];
            if (evnt) return evnt.length
            else return 0;
        }
    }

    export interface ISubscriptionChanged {
        (sender : any,count : number  ): void;
    }

    //new style event using generics

    export class Event<T extends ISubscription> {
        protected _subscribed : ISubscriptionItem[] = [];
        protected _subScriptionChangedEvent : ISubscriptionChanged;

        protected doChangedEvent() {
            if (this._subScriptionChangedEvent) {
                this._subScriptionChangedEvent(this,this.count); }
        }

        protected findSubscription(event : T) : ISubscriptionItem {
            this._subscribed.forEach( (item : ISubscriptionItem) =>{
                if (item.func==event)
                    return item;
            } );
            return null;
        }

        public sub(applyObject : any,event : T) {
            var newItem = this.findSubscription(event);
            if (!newItem) {
                newItem = {object : applyObject, func : event };
                this._subscribed.push(newItem);
                this.doChangedEvent();
            }
        }
        public unsub(event : T) {
            for ( var i=this._subscribed.length-1 ; i>=0; i--) {
                if (this._subscribed[i].func==event)
                    this._subscribed.splice(i,1);
            }
            this.doChangedEvent();
        }
        protected doPub(args: any[]) {
            this._subscribed.forEach((item : ISubscriptionItem)=> {
                item.func.apply(item.object, args);
            })
        }

        public get pub() : T {
            var pubsub=this;
            var func=  (...args: any[]) => {
                pubsub.doPub(args);
            }
            return <T>func;
        }

        public get pubAsync() : T {
            var pubsub=this;
            var func =  (...args: any[]) => {
                setTimeout( () => {
                    pubsub.doPub(args);
                });
            }
            return <T>func;
        }

        public get count() : number {
            return this._subscribed.length;
        }

        public registerChangedEvent(func : ISubscriptionChanged) {
            this._subScriptionChangedEvent=func;
        }
    }
}