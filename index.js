const {BrowserWindow, app} = require("electron");
const pie = require("puppeteer-in-electron")
const puppeteer = require("puppeteer-core");

const main = async () => {
  await pie.initialize(app);
  const browser = await pie.connect(app, puppeteer);
  const window = new BrowserWindow();
  
  const url = "https://share.gg.go.kr/login";
  await window.loadURL(url);
  
 
  const page = await pie.getPage(browser, window);
  await page.screenshot({ path: './test.webp' });
  console.log(page);
  // window.destroy();
};

main();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})