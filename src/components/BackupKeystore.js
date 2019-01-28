import React from 'react';
import { connect } from 'react-redux';

import Dialog from '@material-ui/core/Dialog/Dialog';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Typography from '@material-ui/core/Typography/Typography';
import Card from '@material-ui/core/Card/Card';
import CloseIcon from '@material-ui/icons/Close';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FileCopyIcon from '@material-ui/icons/FileCopy';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { getActiveUserData } from '../utils/crypto';

import Transition from './Transition';

import { hideBackupKeystore } from '../actions/wallet';
import { showSnackbar } from '../actions/snackbar';
import { exportPrivateKey, verifyPin } from '../utils/mixin';

class BackupKeystore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backupPin: '',
      privateKey: null,
    };
  }

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };

  handlePinChange = event => {
    let value = event.target.value;
    value = value.replace(/\D/g, ''); // numeric only
    this.setState({ [event.target.name]: value });
  };

  disableSubmit = () => {
    return !(this.state.backupPin && this.state.backupPin.length === 6);
  };

  handleSubmit = event => {
    event.preventDefault();
    this.showPrivateKey(this.state.backupPin);
  };

  showPrivateKey = async pin => {
    const { activeAccount, showSnackbar } = this.props;
    const userData = await getActiveUserData(activeAccount);
    try {
      await verifyPin(pin, userData);
      const privateKey = exportPrivateKey(userData);
      this.setState({ privateKey });
    } catch (e) {
      console.error(e);
      showSnackbar(`Fail to show private key: ${e.description}`);
    }
  };

  copyPrivateKey = () => {
    const { showSnackbar } = this.props;
    showSnackbar(`Private key copied to clipboard!`);
  };

  renderPrivateKey() {
    const { privateKey } = this.state;
    if (!privateKey) {
      return null;
    }

    return (
      <Card className="card backup-keystore-card">
        <div className="private-key">
          <CopyToClipboard text={privateKey} onCopy={this.copyPrivateKey}>
            <Button
              id="copy-private-key1"
              color="secondary"
              variant="contained"
            >
              Copy private key{' '}
              <FileCopyIcon className="copy-private-key-icon" />
            </Button>
          </CopyToClipboard>
          <div>{privateKey}</div>
          <CopyToClipboard text={privateKey} onCopy={this.copyPrivateKey}>
            <Button
              id="copy-private-key2"
              color="secondary"
              variant="contained"
            >
              Copy private key{' '}
              <FileCopyIcon className="copy-private-key-icon" />
            </Button>
          </CopyToClipboard>
        </div>
      </Card>
    );
  }

  handleClose = () => {
    const { hideBackupKeystore } = this.props;
    this.setState({ privateKey: null });
    hideBackupKeystore();
  };

  render() {
    const { open } = this.props;
    const { backupPin, showPassword } = this.state;

    return (
      <Dialog
        fullScreen
        open={open}
        onClose={this.handleClose}
        TransitionComponent={Transition}
      >
        <AppBar position="static" className="appBar">
          <Toolbar>
            <Tooltip title="Close">
              <IconButton
                color="inherit"
                onClick={this.handleClose}
                aria-label="Close"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" color="inherit">
              Backup private key
            </Typography>
          </Toolbar>
        </AppBar>
        <div>
          <Card className="card backup-keystore-card">
            <FormControl className="backup-pin" margin="normal">
              <InputLabel htmlFor="backupPin">The 6 digit PIN</InputLabel>
              <Input
                required
                name="backupPin"
                type={showPassword ? 'text' : 'password'}
                value={backupPin}
                onChange={this.handlePinChange}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="Toggle password visibility"
                      onClick={this.handleClickShowPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
                placeholder="123456"
                inputProps={{ maxLength: 6 }}
              />
            </FormControl>
            <Button
              id="show-private-key-button"
              className="button"
              color="secondary"
              variant="contained"
              disabled={this.disableSubmit()}
              onClick={this.handleSubmit}
            >
              Show backup private key{' '}
              <Visibility className="show-private-key-icon" />
            </Button>
          </Card>
          {this.renderPrivateKey()}
        </div>
      </Dialog>
    );
  }
}

const mapStateToProps = state => ({
  open: state.wallet.backupKeystoreOpen,
  activeAccount: state.account.activeAccount,
});

const mapDispatchToProps = {
  hideBackupKeystore,
  showSnackbar,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BackupKeystore);
