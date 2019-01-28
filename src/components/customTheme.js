import { createMuiTheme } from '@material-ui/core';

export default createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      light: '#3583d6',
      main: '#3583d6',
      dark: '#3583d6',
      contrastText: '#ffffff',
    },
    secondary: {
      light: '#19C0FC',
      main: '#19C0FC',
      dark: '#19C0FC',
      contrastText: '#ffffff',
    },
    warning: {
      light: '#c04a42',
      main: '#c04a42',
      dark: '#42BEC0',
      contrastText: '#169496',
    },
  },
});
