electron
puppeteer
electron-in-puppeteer

electron-forge: 해당 라이브러리를 사용하면 build를 쉽게 할 수 있다고 함
window는 `brew install --cask wine-stable`를 해서 윈도우 make하도록 함

## Trouble Shooting

### spawn mono ENOENT

https://github.com/electron/forge/issues/2683

```txt
Hey
This issue appears inside electron-winstaller
electron/windows-installer#386

I had the same issue but it's fixable manually.

Open ./node_modules/electron-winstaller/vendor
Copy 7z-x64.* files as 7z.* (fe, 7z-x64.exe => 7z.exe)
Try to build it again
```