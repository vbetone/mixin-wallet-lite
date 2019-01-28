import React from 'react';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card/Card';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import IconButton from '@material-ui/core/IconButton/IconButton';
import PermIdentity from '@material-ui/icons/PermIdentity';
import VpnKey from '@material-ui/icons/VpnKey';

import { getIdenticonImage } from '../utils/identicon';

import AccountsMenu from './AccountsMenu';
import ChangeNetwork from './ChangeNetwork';
import BackupKeystore from './BackupKeystore';
import Price from './Price';

import { hideAccounts, showAccounts } from '../actions/dashboard';
import { showSnackbar } from '../actions/snackbar';
import { reloadAccount, showBackupKeystore } from '../actions/wallet';

import logoMixin from '../images/Mixin.png';

class Dashboard extends React.Component {
  showAccounts = async event => {
    const { showAccounts } = this.props;
    showAccounts(event.currentTarget);
  };

  loadActiveAccountDetails = async () => {
    const { showSnackbar, reloadAccount  } = this.props;
    showSnackbar('Reloading account details...');
    reloadAccount();
  };

  render() {
    const { activeAccount, showBackupKeystore } = this.props;
    const { clientId, fullName } = activeAccount;
    const identiconImage = getIdenticonImage(clientId);

    return (
      <div className="cards">
        <Card className="card sign-in-card">
          <div className="address-bar">
            <img className="identicon" src={identiconImage} alt={clientId} />{' '}
            <span>{fullName}</span>
            <Tooltip title="Switch accounts">
              <IconButton
                aria-label="Switch accounts"
                aria-owns="menuAccountsSelection"
                aria-haspopup="true"
                onClick={this.showAccounts}
              >
                <PermIdentity />
              </IconButton>
            </Tooltip>
            <AccountsMenu />
          </div>
          <div className="logo-container">
            <Tooltip title="Reload Account Details">
              <img
                src={logoMixin}
                alt="mixin"
                className="token-logo"
                onClick={this.loadActiveAccountDetails}
              />
            </Tooltip>
          </div>

          <Price />

          <div className="balance">
            User ID
            <Tooltip title="Backup private key">
              <IconButton aria-label="Details" onClick={showBackupKeystore}>
                <VpnKey />
              </IconButton>
            </Tooltip>
            <div className="address"> {clientId}</div>
          </div>
        </Card>
        <AccountsMenu />
        <BackupKeystore />
        <ChangeNetwork />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  activeAccount: state.account.activeAccount,
  sendTokenOpen: state.wallet.sendTokenOpen,
  accountsOpen: state.dashboard.accountsOpen,
});

const mapDispatchToProps = {
  showSnackbar,
  showAccounts,
  hideAccounts,
  showBackupKeystore,
  reloadAccount,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
