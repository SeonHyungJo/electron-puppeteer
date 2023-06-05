import { app, BrowserWindow, ipcMain } from 'electron';
import pie from 'puppeteer-in-electron';
import * as puppeteer from 'puppeteer-core';
import { config } from 'dotenv';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

config()

let mainWindow: BrowserWindow;
let browser: puppeteer.Browser;
let page: puppeteer.Page;

if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = async () => {
  browser = await pie.connect(app, puppeteer);
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  page = await pie.getPage(browser, mainWindow);

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.maximize();
};

const loginKyonggiShareSite = async (formData: Store) => {
  try {
    console.log("===start login===", formData)
    page.goto("https://share.gg.go.kr/index")
    const loginLink = await page.waitForSelector('a ::-p-text(로그인)');
    loginLink.click();

    await page.waitForSelector('input[name=mberIdChk]');
    await page.$eval('input[name=mberIdChk]', (el, value) => el.value = value, formData.id);
    await page.waitForSelector('input[name=passwordChk]');
    await page.$eval('input[name=passwordChk]', (el, value) => el.value = value, formData.pw);
    const loginBtn = await page.waitForSelector('#loginBtn');
    loginBtn.click();

    // 가평 테니스장
    // https://share.gg.go.kr/sports/view?instiCode=B552682&facilityId=F0029
    
  } catch (error) {
    console.log(error)
  }
}

pie.initialize(app);
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


interface Store {
  id: string;
  pw: string;
  tennisCourtName: string;
  date: string;
  time: string;
  eventName: string;
  personCount: number
}

let store: Store = {
  id: process.env.USER_ID || '',
  pw: process.env.PW || '',
  tennisCourtName: process.env.TENNIS_COURT_NAME || '테니스',
  date: process.env.DATE || '2023-06-07',
  time: process.env.TIME || '10:00',
  eventName: process.env.EVENT_NAME || '테니스',
  personCount: parseInt(process.env.PERSON_COUNT) || 0
}

ipcMain.on("save_data", (channel, data: Store) => {
  console.log('channel', channel)
  store = { ...store, ...data }
});

ipcMain.on("login", () => {
  loginKyonggiShareSite(store)
});