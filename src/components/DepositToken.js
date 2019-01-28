import React from 'react';
import { connect } from 'react-redux';

import Dialog from '@material-ui/core/Dialog/Dialog';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Typography from '@material-ui/core/Typography/Typography';
import Card from '@material-ui/core/Card/Card';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import CloseIcon from '@material-ui/icons/Close';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import loadQRCode from '../utils/loadQRCode';

import Transition from './Transition';

import { hideDepositToken } from '../actions/wallet';
import { showSnackbar } from '../actions/snackbar';
import { getActiveUserData } from '../utils/crypto';
import { loadDepositInfo } from '../utils/mixin';

class DepositToken extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (
      this.props.asset &&
      (this.props.asset !== prevProps.asset ||
        this.props.activeAccount !== prevProps.activeAccount)
    ) {
      this.loadDepositInfo(this.props.asset, this.props.activeAccount);
    }
  }

  loadDepositInfo = async (asset, activeAccount) => {
    const userData = await getActiveUserData(activeAccount);
    const assetInfo = await loadDepositInfo(asset, userData);

    if (assetInfo.symbol === 'EOS') {
      const accountName = assetInfo.account_name;
      const accountTag = assetInfo.account_tag;
      const qrCodeForName = await loadQRCode(accountName);
      const qrCodeForTag = await loadQRCode(accountTag);
      this.setState({
        isEOS: true,
        asset: assetInfo,
        qrCodeForName,
        qrCodeForTag,
      });
    } else {
      const address = assetInfo.public_key;
      const qrCode = await loadQRCode(address);
      this.setState({ isEOS: false, asset: assetInfo, qrCode });
    }
  };

  handleCopyToClipBoard = () => {
    const { showSnackbar } = this.props;
    showSnackbar('Deposit info copied to clipboard.');
  };

  renderDepositCard = (asset, qrCode, balance) => {
    return (
      <Card className="card account-details-card">
        <div className="withdraw-summary">
          <img src={asset.icon_url} alt={asset.name} />
          <p>{balance}</p>
        </div>
        <Typography variant="h6">Send to this address to deposit</Typography>
        {qrCode && (
          <img src={qrCode} alt="account address" className="qr-code" />
        )}
        <div className="account-details-address">
          <div className="address">
            {asset.public_key}
            <CopyToClipboard
              text={asset.public_key}
              onCopy={this.handleCopyToClipBoard}
            >
              <IconButton>
                <FileCopyIcon />
              </IconButton>
            </CopyToClipboard>
          </div>
        </div>
        <p className="deposit-description">
          Deposit will arrive after at least {asset.confirmations} block
          confirmations.
        </p>
      </Card>
    );
  };

  renderEOSDepositCard = (asset, qrCodeForName, qrCodeForTag, balance) => {
    return (
      <Card className="card account-details-card">
        <div className="withdraw-summary">
          <img src={asset.icon_url} alt={asset.name} />
          <p>{balance}</p>
        </div>
        <Typography variant="h6">
          Send to this account and tag to deposit
        </Typography>
        <p>Account Name</p>
        {qrCodeForName && (
          <img src={qrCodeForName} alt="account address" className="qr-code" />
        )}
        <div className="account-details-address">
          <div className="address">
            {asset.account_name}
            <CopyToClipboard
              text={asset.account_name}
              onCopy={this.handleCopyToClipBoard}
            >
              <IconButton>
                <FileCopyIcon />
              </IconButton>
            </CopyToClipboard>
          </div>
        </div>
        <p>Account Tag</p>
        {qrCodeForTag && (
          <img src={qrCodeForTag} alt="account address" className="qr-code" />
        )}
        <div className="account-details-address">
          <div className="address">
            {asset.account_tag}
            <CopyToClipboard
              text={asset.account_tag}
              onCopy={this.handleCopyToClipBoard}
            >
              <IconButton>
                <FileCopyIcon />
              </IconButton>
            </CopyToClipboard>
          </div>
        </div>
        <p className="deposit-description">
          Both Account Name and Account Tag are required to successfully deposit
          your EOS to Mixin Wallet, deposit will arrive after at least{' '}
          {asset.confirmations} block confirmations.
        </p>
      </Card>
    );
  };

  render() {
    const { activeAccount, open, hideDepositToken } = this.props;
    const { asset, isEOS, qrCode, qrCodeForName, qrCodeForTag } = this.state;

    if (!activeAccount || !asset) {
      return null;
    }

    const balance = `${asset.balance || 0} ${asset.symbol}`;

    return (
      <Dialog
        fullScreen
        open={open}
        onClose={hideDepositToken}
        TransitionComponent={Transition}
      >
        <AppBar position="static" className="appBar">
          <Toolbar>
            <Tooltip title="Close">
              <IconButton
                color="inherit"
                onClick={hideDepositToken}
                aria-label="Close"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" color="inherit">
              Deposit
            </Typography>
          </Toolbar>
        </AppBar>
        <div>
          {!isEOS && this.renderDepositCard(asset, qrCode, balance)}
          {isEOS &&
            this.renderEOSDepositCard(
              asset,
              qrCodeForName,
              qrCodeForTag,
              balance
            )}
        </div>
      </Dialog>
    );
  }
}

const mapStateToProps = state => ({
  open: state.wallet.depositTokenOpen,
  asset: state.wallet.asset,
  activeAccount: state.account.activeAccount,
});

const mapDispatchToProps = {
  hideDepositToken,
  showSnackbar,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DepositToken);
