const electron = require("electron");
const path = require("path");
const fs = require("fs");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: { nodeIntegration: true, contextIsolation: false, enableRemoteModule: true },
  });
  mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
}

const saveDataToFile = (filename, data) => {
  const jsonData = JSON.stringify(data);
  fs.writeFileSync(filename, jsonData);
};

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

app.on("ready", createWindow);