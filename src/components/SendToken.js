import React from 'react';
import { connect } from 'react-redux';

import IconButton from '@material-ui/core/IconButton/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog/Dialog';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import Typography from '@material-ui/core/Typography/Typography';
import Card from '@material-ui/core/Card/Card';
import TextField from '@material-ui/core/TextField/TextField';
import Button from '@material-ui/core/Button/Button';
import Send from '@material-ui/icons/Send';
import LinearProgress from '@material-ui/core/LinearProgress';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import FormControl from '@material-ui/core/FormControl';

import { getActiveUserData, isAddress } from '../utils/crypto';

import Transition from './Transition';

import { hideSendToken, reloadAccount } from '../actions/wallet';
import { showSnackbar } from '../actions/snackbar';

import { transfer } from '../utils/mixin';

class SendToken extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sendTo: '',
      sendAmount: '',
      sendMemo: '',
      sendPin: '',
      isLoading: false,
      selectedAsset: props.assets[0].asset_id,
    };
  }

  handleAmountChange = event => {
    const formattedAmount = event.target.value
      .replace(/^0+(?!\.|$)/, '')
      .replace(/[^0-9 .]+/g, '')
      .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1');

    this.setState({ [event.target.name]: formattedAmount });
  };

  handlePinChange = event => {
    let value = event.target.value;
    value = value.replace(/\D/g, ''); // numeric only
    this.setState({ [event.target.name]: value });
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };

  disableSubmit = () => {
    return !this.isSendValid();
  };

  isSendValid = () => {
    const { activeAccount, assets } = this.props;
    const { address } = activeAccount;
    const { sendTo, sendAmount, isLoading, selectedAsset, sendPin } = this.state;
    const asset = assets.find(a => a.asset_id === selectedAsset);

    return (
      !isLoading &&
      sendTo &&
      isAddress(sendTo) &&
      asset &&
      asset.balance &&
      parseFloat(asset.balance) >= parseFloat(sendAmount) &&
      sendAmount > 0 &&
      sendTo !== address &&
      sendPin && sendPin.length === 6
    );
  };

  isSending = () => {
    const { isLoading } = this.state;
    return !!isLoading;
  };

  sendToken = async () => {
    const { sendTo, sendAmount, sendMemo, sendPin, selectedAsset } = this.state;
    this.setState({ isLoading: true });

    const {
      assets,
      showSnackbar,
      hideSendToken,
      activeAccount,
      reloadAccount,
    } = this.props;
    const asset = assets.find(a => a.asset_id === selectedAsset);
    const userData = await getActiveUserData(activeAccount);
    const sendData = {
      sendTo,
      sendAmount,
      sendMemo,
      sendPin,
    };

    try {
      showSnackbar('Submitting transfer transaction, please wait...');
      await transfer(asset, userData, sendData);
      this.setState({
        isLoading: false,
        sendTo: '',
        sendAmount: '',
        sendMemo: '',
        sendPin: '',
      });
      reloadAccount();
      showSnackbar('Transfer successfully!');
      hideSendToken();
    } catch (error) {
      this.setState({ isLoading: false });
      console.error(error);
      showSnackbar(`Transfer failed: ${error.description}`);
    }
  };

  renderSending() {
    if (this.isSending()) {
      return (
        <div>
          <p>Submitting send transaction, please wait...</p>
          <LinearProgress />
        </div>
      );
    }

    return null;
  }

  render() {
    const { open, hideSendToken, activeAccount, assets } = this.props;
    if (!activeAccount) {
      return null;
    }

    const {
      sendTo,
      sendAmount,
      sendMemo,
      selectedAsset,
      sendPin,
      showPassword,
    } = this.state;

    if (!assets || assets.length === 0) {
      return null;
    }

    return (
      <Dialog
        fullScreen
        open={open}
        onClose={hideSendToken}
        TransitionComponent={Transition}
      >
        <AppBar position="static" className="appBar">
          <Toolbar>
            <Tooltip title="Close">
              <IconButton
                color="inherit"
                onClick={hideSendToken}
                aria-label="Close"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" color="inherit">
              Transfer
            </Typography>
          </Toolbar>
        </AppBar>
        <div>
          <Card className="card send-card">
            <TextField
              select
              label="Token"
              name="selectedAsset"
              className="send-token"
              value={selectedAsset}
              onChange={this.handleChange}
              helperText="Please select the token to send"
              margin="normal"
            >
              {assets.map(asset => (
                <MenuItem key={asset.asset_id} value={asset.asset_id}>
                  <div className="send-asset-container">
                    <img
                      src={asset.icon_url}
                      alt={asset.symbol}
                      className="send-asset-icon"
                    />
                    <div className="send-asset-info">
                      {asset.balance || 0} {asset.symbol}
                    </div>
                  </div>
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              name="sendTo"
              label="To User ID"
              className="send-to"
              autoComplete="off"
              value={sendTo}
              onChange={this.handleChange}
              margin="normal"
              disabled={this.isSending()}
            />
            <TextField
              required
              name="sendAmount"
              label="Amount"
              className="send-amount"
              value={sendAmount}
              onChange={this.handleAmountChange}
              margin="normal"
              type="number"
              placeholder="0.00"
              disabled={this.isSending()}
            />
            <TextField
              name="sendMemo"
              label="Memo"
              className="send-memo"
              value={sendMemo}
              onChange={this.handleChange}
              margin="normal"
              inputProps={{ maxLength: 140 }}
              disabled={this.isSending()}
            />
            <FormControl className="send-pin" margin="normal">
              <InputLabel htmlFor="sendPin">The 6 digit PIN</InputLabel>
              <Input
                required
                name="sendPin"
                type={showPassword ? 'text' : 'password'}
                value={sendPin}
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
                disabled={this.isSending()}
              />
            </FormControl>
            <Button
              id="send-token-button"
              className="send-token-button"
              variant="contained"
              color="secondary"
              disabled={this.disableSubmit()}
              onClick={this.sendToken}
            >
              Transfer <Send className="send-button-icon" />
            </Button>
            {this.renderSending()}
          </Card>
        </div>
      </Dialog>
    );
  }
}

const mapStateToProps = state => ({
  open: state.wallet.sendTokenOpen,
  activeAccount: state.account.activeAccount,
  assets: state.account.assets,
});

const mapDispatchToProps = {
  hideSendToken,
  showSnackbar,
  reloadAccount,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SendToken);
