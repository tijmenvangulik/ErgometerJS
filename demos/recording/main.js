'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

var powerSaveId = -1;

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  
  //needed forweb blue tooth, select the fist device
  //should open an dialog here to select one if there are multiple pm5 devices
  mainWindow.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault();
    //search an device starting with PM<number> <number>
    let result = deviceList.find((device) => {
      return  device.deviceName.match(/PM\d \d*/g)
    })
    if (!result) {
      callback('')
    } else {
      callback(result.deviceId)
    }
  });
  
  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
  powerSaveId= electron.powerSaveBlocker.start('prevent-display-sleep')

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  electron.powerSaveBlocker.stop(powerSaveId)

  //if (process.platform !== 'darwin') {
    app.quit();
 //}
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {

    createWindow();
  
  }
});

