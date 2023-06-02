const package = require("./package.json")
const BUILD_NAME = package.name

module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        // icon: `${iconPath}.icns`,
      },
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'YOU',
        // iconUrl: 'https://your_site/favicon.ico',
        exe: `${BUILD_NAME}.exe`,
        name: BUILD_NAME,
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          bin: BUILD_NAME,
          maintainer: 'YOU',
          // homepage: 'https://you home page',
        },
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
};
