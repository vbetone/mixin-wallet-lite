import React from 'react';
import { connect } from 'react-redux';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import IconButton from '@material-ui/core/IconButton';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import Transition from './Transition';

import { hideWalletBackup } from '../actions/wallet';
import { showSnackbar } from '../actions/snackbar';

class WalletBackup extends React.Component {
  handleCopyToClipBoard = () => {
    const { showSnackbar } = this.props;
    showSnackbar('Private key copied to clipboard.');
  };

  render() {
    const { open, privateKey, hideWalletBackup } = this.props;
    if (!privateKey) {
      return null;
    }

    return (
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
          Backup private key
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <span className="red">
              Please write down your private key and remember your pin, in case
              you need to restore the account later. Please notice we don't
              store your private key and pin.
              <CopyToClipboard
                text={privateKey}
                onCopy={() => this.handleCopyToClipBoard()}
              >
                <IconButton>
                  <FileCopyIcon />
                </IconButton>
              </CopyToClipboard>
            </span>
            <br />
            <br />
            <span className="private-key">{privateKey}</span>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={hideWalletBackup} color="secondary">
            I have backed up the private key
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = state => ({
  open: state.wallet.walletBackupOpen,
  privateKey: state.wallet.privateKey,
});

const mapDispatchToProps = {
  hideWalletBackup,
  showSnackbar,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletBackup);
