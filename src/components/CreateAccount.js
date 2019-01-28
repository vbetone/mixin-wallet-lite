import React, { Component } from 'react';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card/Card';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import Typography from '@material-ui/core/Typography/Typography';
import Button from '@material-ui/core/Button/Button';
import Dialog from '@material-ui/core/Dialog/Dialog';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import IconButton from '@material-ui/core/IconButton/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import PermIdentity from '@material-ui/icons/PermIdentity';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import FormControl from '@material-ui/core/FormControl';

import AES from 'crypto-js/aes';

import { localStorage } from '../utils/localStorage';
import { backgroundPage } from '../utils/backgroundPage';

import { hideCreateAccount } from '../actions/wallet';
import { showSnackbar } from '../actions/snackbar';
import { setAccountInfo } from '../actions/account';
import { SCREEN_WALLET, setScreen } from '../actions/app';
import { showWalletBackup } from '../actions/wallet';

import Transition from './Transition';
import { createUser, exportPrivateKey, updatePin } from '../utils/mixin';

class CreateAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: '',
      accountPin: '',
    };
  }

  disableSubmit = () => {
    const { accountPin } = this.state;
    return !accountPin || accountPin.length < 6;
  };

  handleSubmit = event => {
    event.preventDefault();
    this.createAccount();
  };

  handlePinChange = event => {
    let value = event.target.value;
    value = value.replace(/\D/g, ''); // numeric only
    this.setState({ [event.target.name]: value });
  };

  handleChange = event => {
    const value = event.target.value;
    this.setState({ [event.target.name]: value });
  };

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };

  createAccount = async () => {
    const {
      setAccountInfo,
      hideCreateAccount,
      showSnackbar,
      setScreen,
      showWalletBackup,
    } = this.props;

    const { fullName, accountPin } = this.state;

    try {
      const createUserResult = await createUser(fullName);
      const userData = {
        privateKey: createUserResult.privateKey,
        clientId: createUserResult.user_id,
        sessionId: createUserResult.session_id,
        pinToken: createUserResult.pin_token,
      };
      await updatePin(userData, '', accountPin);

      const clientId = userData.clientId;
      const publicKey = createUserResult.publicKey;
      const passwordHashInBackground = await backgroundPage.getPasswordHash();
      const accounts = await localStorage.getAccounts();
      const encryptedUserData = AES.encrypt(
        JSON.stringify(userData),
        passwordHashInBackground
      ).toString();

      const accountExisted = accounts.filter(account => account.clientId === clientId).length > 0;
      if (accountExisted) {
        showSnackbar('Account already exists! Please import another one.');
        return;
      }

      const activeAccount = {
        clientId,
        fullName: createUserResult.full_name,
        publicKey,
        encryptedUserData,
      };

      accounts.push(activeAccount);
      await localStorage.setAccounts(accounts);

      await backgroundPage.setActiveAccount(activeAccount);
      setAccountInfo(accounts, activeAccount);
      showSnackbar('Account is created successfully!');

      const privateKey = exportPrivateKey(userData);
      showWalletBackup(privateKey);
      setScreen(SCREEN_WALLET);
      hideCreateAccount();
    } catch (e) {
      console.error(e);
      showSnackbar('Failed to create user, please try again latter!');
    }
  };

  render() {
    const { hideCreateAccount, open } = this.props;
    const { fullName, accountPin, showPassword } = this.state;
    return (
      <Dialog
        fullScreen
        aria-labelledby="switch-network-title"
        open={open}
        onClose={hideCreateAccount}
        TransitionComponent={Transition}
      >
        <AppBar position="static" className="appBar">
          <Toolbar>
            <Tooltip title="Close">
              <IconButton
                color="inherit"
                onClick={hideCreateAccount}
                aria-label="Close"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" color="inherit">
              Create Account
            </Typography>
          </Toolbar>
        </AppBar>
        <div className="cards">
          <Card className="card sign-in-card">
            <Typography variant="h6">Create New Account on Mixin</Typography>
            <p className="create-account-description">
              Account information is encrypted and only stored in local Chrome
              storage
            </p>
            <FormControl className="full-name" margin="normal">
              <InputLabel htmlFor="fullName">Full Name</InputLabel>
              <Input
                required
                name="fullName"
                type="text"
                value={fullName}
                onChange={this.handleChange}
                placeholder="Full Name"
                inputProps={{ maxLength: 32 }}
              />
            </FormControl>
            <FormControl className="account-pin" margin="normal">
              <InputLabel htmlFor="accountPin">The 6 digit PIN</InputLabel>
              <Input
                required
                name="accountPin"
                type={showPassword ? 'text' : 'password'}
                value={accountPin}
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
              Create <PermIdentity className="account-details-button-icon" />
            </Button>
            <div className="space" />
          </Card>
        </div>
      </Dialog>
    );
  }
}

const mapStateToProps = state => ({
  open: state.wallet.createAccountOpen,
});

const mapDispatchToProps = {
  hideCreateAccount,
  setAccountInfo,
  showSnackbar,
  setScreen,
  showWalletBackup,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateAccount);
