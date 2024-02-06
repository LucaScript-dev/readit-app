const { app, BrowserWindow, ipcMain } = require("electron");
const windowStateKeeper = require("electron-window-state");
const readItem = require("./readItem");

let mainWindow;

// Listen for new item request
ipcMain.on("new-item", (e, itemUrl) => {
  console.log(itemUrl);

  // Get new item and send back to renderer
  readItem(itemUrl, (item) => {
    e.sender.send("new-item-success", item);
  });
});

const createWindow = function () {
  // Win state keeper
  let state = windowStateKeeper({
    defaultWidth: 500,
    defaultHeight: 650,
  });

  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 350,
    maxWidth: 650,
    minHeight: 300,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });

  mainWindow.loadFile("./renderer/main.html");

  state.manage(mainWindow);

  // mainWindow.webContents.openDevTools();

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return {
      action: "allow",
      overrideBrowserWindowOptions: {
        webPreferences: {
          preload: `${__dirname}/renderer/reader.js`,
        },
      },
    };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
