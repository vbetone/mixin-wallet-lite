import React, { Component } from 'react';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import AppBar from '@material-ui/core/AppBar/AppBar';

const toolBar = {
  width: '100%',
  display: 'block',
}

const titleContainer = {
  alignItems: 'center'
};

const domainContainer = {
  border: '0'
}

const styles = {
  toolBar,
  titleContainer,
  domainContainer
}

class PromptAppBar extends Component {

  render() {
    const { title, classes } = this.props;
    return (
      <AppBar position="sticky">
        <Toolbar>
          <div className={ classes.toolBar }>
            <div className={ classes.titleContainer }>
              <h3>{ title }</h3>
            </div>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

const mapStateToProps = state => ({
  title: state.prompt.title,
  domain: state.prompt.domain
});

const styled = withStyles(styles)(PromptAppBar);

export default connect(
  mapStateToProps,
  null
)(styled);
