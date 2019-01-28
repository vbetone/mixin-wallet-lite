import React, { Component } from 'react';
import { connect } from 'react-redux';

import Menu from '@material-ui/core/Menu/Menu';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';

import { backgroundPage } from '../utils/backgroundPage';

import { hideAccounts, showAccounts } from '../actions/dashboard';
import { showSnackbar } from '../actions/snackbar';
import { setAccountInfo } from '../actions/account';
import { SCREEN_IMPORT_OR_CREATE_ACCOUNT, setScreen } from '../actions/app';

class AccountsMenu extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.open !== this.props.open && this.props.open) {
      this.setState({
        open: this.props.open,
        anchorEl: this.props.anchorEl,
      });
    }
  }

  handleAccountsCloseImport = () => {
    const { hideAccounts, setScreen } = this.props;
    hideAccounts();
    setScreen(SCREEN_IMPORT_OR_CREATE_ACCOUNT);
  };

  handleAccountsClose = async value => {
    const { accounts, hideAccounts, showSnackbar, setAccountInfo } = this.props;

    if (!value) {
      hideAccounts();
      return;
    }

    // set activeAccounts
    const activeAccount =
      accounts.find(a => a.clientId === value) || accounts[0];
    showSnackbar('Account is switched successfully!');
    await backgroundPage.setActiveAccount(activeAccount); // set background
    hideAccounts();
    setAccountInfo(accounts, activeAccount);
  };

  render() {
    const { anchorEl, open, activeAccount, accounts } = this.props;

    if (!accounts) {
      return null;
    }

    return (
      <Menu
        id="menuAccountsSelection"
        anchorEl={anchorEl}
        open={open}
        onClose={this.handleAccountsClose.bind(this, null)}
      >
        {accounts.map(option => (
          <MenuItem
            key={option.clientId}
            selected={option.clientId === activeAccount.clientId}
            onClick={this.handleAccountsClose.bind(this, option.clientId)}
          >
            {option.clientId}
          </MenuItem>
        ))}

        <MenuItem key="import" onClick={this.handleAccountsCloseImport}>
          Import Account
        </MenuItem>
      </Menu>
    );
  }
}

const mapStateToProps = state => ({
  open: state.dashboard.accountsOpen,
  anchorEl: state.dashboard.anchorEl,
  activeAccount: state.account.activeAccount,
  accounts: state.account.accounts,
});

const mapDispatchToProps = {
  showAccounts,
  hideAccounts,
  setAccountInfo,
  showSnackbar,
  setScreen,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountsMenu);
