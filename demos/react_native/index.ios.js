/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

var noble = require('noble');

var bleat = require('./libs/bleat/index').classic;
var ergometer= require('./libs/ergometer.js').ergometer(bleat);
//alert(ergometerLib);

//var ergometer = ergometerLib.lib.ergometer;
class ErgometerReactNative extends Component {
   performanceMonitor =  new ergometer.PerformanceMonitor();

   state = {connectionState: "-",
            deviceName : "-",
            distance: 0
            };

   onConnectionStateChanged(oldState, newState ) {
     this.setState({connectionState:newState});
   }
   onRowingGeneralStatus(data) {
     this.setState({distance:data.distance})
   }
   onStateChange(state) {
      this.performanceMonitor.connectionStateChangedEvent.sub(this,this.onConnectionStateChanged);
      this.performanceMonitor.rowingGeneralStatusEvent.sub(this,this.onRowingGeneralStatus);
      if (state === 'poweredOn') {
        this.performanceMonitor.startScan((device) => {
          if ( device.name.startsWith("PM5") ) {
            this.setState({deviceName:device.name});
            return true
          };

          return false;
        })
      } else {

      }
    }

  componentWillMount() {

    noble.on('stateChange', (state)=>{
      alert(state);
      this.onStateChange(state);
    } );
  }
  render() {
    return (
      <View style={styles.container}>
        <Text  style={styles.welcome}>
          Welcome to React Native ErgometerJS
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          State: {this.state.connectionState}
        </Text>
        <Text style={styles.instructions}>
          Device: {this.state.deviceName}
        </Text>
        <Text style={styles.instructions}>
          Distance: {this.state.distance}
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('ErgometerReactNative', () => ErgometerReactNative);
