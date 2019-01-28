import React, { Component } from 'react';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card/Card';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import Typography from '@material-ui/core/Typography/Typography';
import Button from '@material-ui/core/Button/Button';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import FormControl from '@material-ui/core/FormControl';
import Dialog from '@material-ui/core/Dialog/Dialog';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import IconButton from '@material-ui/core/IconButton/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField/TextField';
import LockOpen from '@material-ui/icons/LockOpen';

import AES from 'crypto-js/aes';

import { hideImportPrivateKey, importPrivateKey } from '../actions/wallet';


import Transition from './Transition';
import { isPrivateKeyValid, exportRsaPublicKeyFromPrivate } from '../utils/crypto';
import { backgroundPage } from '../utils/backgroundPage';
import { localStorage } from '../utils/localStorage';
import { showSnackbar } from '../actions/snackbar';
import { setAccountInfo } from '../actions/account';
import { SCREEN_WALLET, setScreen } from '../actions/app';
import { verifyPin } from '../utils/mixin';
import { strip } from '../utils/misc';

class ImportPrivateKey extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privateKey:'',
      importPin: '',
    };
  }

  disableSubmit = () => {
    const { privateKey, importPin } = this.state;
    return !isPrivateKeyValid(privateKey) || !importPin || importPin.length < 6;
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.importPrivateKey();
  };

  handlePinChange = event => {
    let value = event.target.value;
    value = value.replace(/\D/g, ''); // numeric only
    this.setState({ [event.target.name]: value });
  };

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };

  importPrivateKey = async () => {
    const {
      setAccountInfo,
      hideImportPrivateKey,
      showSnackbar,
      setScreen,
    } = this.props;
    const { privateKey, importPin } = this.state;

    const data = JSON.parse(
      Buffer.from(privateKey.trim(), 'base64').toString()
    );
    const userData = {
      clientId: data.uid,
      pinToken: data.pintoken,
      sessionId: data.sid,
      privateKey: data.key,
    };

    try {
      const resp = await verifyPin(importPin, userData);
      const clientId = userData.clientId;
      const fullName = resp.full_name;
      const passwordHashInBackground = await backgroundPage.getPasswordHash();
      const accounts = await localStorage.getAccounts();
      const encryptedUserData = AES.encrypt(
        JSON.stringify(userData),
        passwordHashInBackground
      ).toString();

      const accountExisted =
        accounts.filter(account => account.clientId === clientId).length > 0;
      if (accountExisted) {
        showSnackbar('Account already exists! Please import another one.');
        return;
      }
      const publicKey = strip(exportRsaPublicKeyFromPrivate(userData.privateKey));
      const activeAccount = {
        clientId,
        fullName,
        publicKey,
        encryptedUserData,
      };

      accounts.push(activeAccount);
      await localStorage.setAccounts(accounts);

      await backgroundPage.setActiveAccount(activeAccount);
      setAccountInfo(accounts, activeAccount);
      showSnackbar('Account is imported successfully!');

      setScreen(SCREEN_WALLET);
      hideImportPrivateKey();
    } catch (e) {
      console.error(e);
      showSnackbar(`Fail to show private key: ${e.description}`);
    }
  };

  render() {
    const { hideImportPrivateKey, open } = this.props;
    const { privateKey, importPin, showPassword } = this.state;
    return (
      <Dialog
        fullScreen
        aria-labelledby="switch-network-title"
        open={open}
        onClose={hideImportPrivateKey}
        TransitionComponent={Transition}
      >
        <AppBar position="static" className="appBar">
          <Toolbar>
            <Tooltip title="Close">
              <IconButton
                color="inherit"
                onClick={hideImportPrivateKey}
                aria-label="Close"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" color="inherit">
              Import Private Key
            </Typography>
          </Toolbar>
        </AppBar>
        <div className="cards">
          <Card className="card sign-in-card">
            <Typography variant="h6">Enter private key</Typography>
            <p className="import-private-key-description">
              Private key is encrypted and only stored in local Chrome storage
            </p>
            <TextField
              name="privateKey"
              label="Private key"
              className="private-key-field"
              multiline
              rows="8"
              autoComplete="off"
              value={privateKey}
              onChange={this.handleChange}
              helperText=""
              variant="outlined"
              margin="normal"
            />
            <FormControl className="import-pin" margin="normal">
              <InputLabel htmlFor="importPin">The 6 digit PIN</InputLabel>
              <Input
                required
                name="importPin"
                type={showPassword ? 'text' : 'password'}
                value={importPin}
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
              className="sign-in-button button"
              color="secondary"
              variant="contained"
              disabled={this.disableSubmit()}
              onClick={this.handleSubmit}
            >
              Import <LockOpen className="account-details-button-icon" />
            </Button>
            <div className="space" />
          </Card>
        </div>
      </Dialog>
    );
  }
}

const mapStateToProps = state => ({
  open: state.wallet.importPrivateKeyOpen,
});

const mapDispatchToProps = {
  hideImportPrivateKey,
  importPrivateKey,
  setAccountInfo,
  showSnackbar,
  setScreen,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportPrivateKey);
