const electron = require("electron");
const path = require("path");
const fs = require("fs");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true, contextIsolation: false, enableRemoteModule: true },
  });
  // and load the index.html of the app.
  console.log(__dirname);
  mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
}

// Save data to file
const saveDataToFile = (filename, data) => {
  const jsonData = JSON.stringify(data);
  fs.writeFileSync(filename, jsonData);
};

// Load data from file
const loadDataFromFile = (filename) => {
  try {
    const jsonData = fs.readFileSync(filename, "utf8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error loading data:", error);
    return [];
  }
};

global.saveDataToFile = saveDataToFile;
global.loadDataFromFile = loadDataFromFile;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);