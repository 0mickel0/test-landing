let settings;

if (BUILD_MODE === 'DEBUG') {
  settings = {
    mode: 'debug',
    GA: 'UA-XXXXX-X',
  };
}

if (BUILD_MODE === 'DIST') {
  settings = {
    mode: 'testing',
    GA: 'UA-XXXXX-X',
  };
}

if (BUILD_MODE === 'PROD') {
  settings = {
    mode: 'production',
    GA: 'UA-94028519-1',
  };
}

export default settings;
