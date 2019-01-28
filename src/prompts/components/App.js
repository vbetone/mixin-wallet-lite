import React, { Component } from 'react';
import { connect } from 'react-redux';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import customTheme from './customTheme';
import AppBar from './AppBar';
import Routing from './Routing';

class App extends Component {

  render() {
    return (
      <MuiThemeProvider theme={customTheme}>
        <div className="Prompt">
          <AppBar />
          <Routing />
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
