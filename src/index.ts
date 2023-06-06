import { app, BrowserWindow, ipcMain, ipcRenderer } from 'electron';
import pie from 'puppeteer-in-electron';
import * as puppeteer from 'puppeteer-core';
import { config } from 'dotenv';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

config()

let mainWindow: BrowserWindow;
let browser: puppeteer.Browser;
let page: puppeteer.Page;

function delay(time: number) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

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

const tennisCourtReservation = async (formData: Store) => {
  try {
    // (1코트) 일죽테니스장
    await page.goto("https://share.gg.go.kr/sports/view?instiCode=1230001&facilityId=F0062");
    const reservationBtn = await page.waitForSelector('#oneClick1');
    await page.evaluate(function (formData) {
      document.getElementById("reservFrm").children.selDate.value = formData.date;
      document.getElementById("reservFrm").children.actionYn.value = "Y";
    }, formData);
    reservationBtn.click();
    
    await delay(3000)
    const timeElement = await page.waitForSelector(`label ::-p-text(${formData.time} ~)`);
    await timeElement.click();

    await page.evaluate(function () {
      addItem();
      submit("step2");
    });
    
    await page.waitForSelector('#resStep2');
    await page.evaluate(function () {
      submit("step3");
    });

    await delay(4000)
    // 개인 선택
    // const groupType = await page.waitForSelector('#tpType-1');
    // const groupType = await page.waitForSelector('#tpType-2');
    await page.evaluate(function () {
      document.getElementById('tpType-2').click()
    });

    await page.$eval('input[name=teamNm]', (el, value) => el.value = value, formData.eventName);
    await page.$eval('input[name=eventName]', (el, value) => el.value = value, formData.eventName);
    await page.$eval('input[name=predictionPerson]', (el, value) => el.value = value, formData.personCount);

    const agreementEl = await page.waitForSelector('span ::-p-text(모든 약관에 동의합니다.)', { visible: true });
    await agreementEl.click()
    await page.evaluate(function () {
      submit("step4");
    });
  } catch (error) {
    console.log(error)
  }
}

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

    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    });
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
  groupName: string;
  eventName: string;
  personCount: string;
}

let store: Store = {
  id: process.env.USER_ID || '',
  pw: process.env.USER_PW || '',
  tennisCourtName: process.env.TENNIS_COURT_NAME || '테니스',
  date: process.env.DATE || '2023-06-07',
  time: process.env.TIME || '10:00',
  groupName: process.env.GROUP_NAME || '테니스',
  eventName: process.env.EVENT_NAME || '테니스',
  personCount: process.env.PERSON_COUNT || '0'
}

ipcMain.on("save_data", (channel, data: Store) => {
  store = { ...store, ...data }
  channel.reply('save_data', JSON.stringify(store))
});

ipcMain.on("login", async () => {
  await loginKyonggiShareSite(store)
  await tennisCourtReservation(store)
});