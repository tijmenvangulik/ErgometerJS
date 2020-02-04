
/**
 * Demo of Concept 2 ergometer Performance Monitor for electron
 *
 * This unit contains electron specific code
 *
 * This will will work with the PM5
 *
 * Created by tijmen on 01-06-15.
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
class App {

    private _demo : Demo ;

    public get demo():Demo {
        return this._demo;
    }
    protected onPause() {
        // TODO: This application has been suspended. Save application state here.
        }
    
    protected onResume() {
    // TODO: This application has been reactivated. Restore application state here.
    }
    
    public onDeviceReady() {
        document.addEventListener('pause', () => {this.onPause();}, false);
        document.addEventListener('resume', () => {this.onResume();}, false);
        this.demo.pageLoaded();
    }

    constructor() {
        this._demo = new Demo();
        window.onload = ()=> {
            document.addEventListener('deviceready', () => {
                this.onDeviceReady();
            },false);
        }


    }
}

var app = new App();