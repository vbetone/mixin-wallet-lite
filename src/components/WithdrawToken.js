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
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import LinearProgress from '@material-ui/core/LinearProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';

import { getActiveUserData, isAddress } from '../utils/crypto';

import Transition from './Transition';

import { hideWithdrawToken, reloadAccount } from '../actions/wallet';
import { showSnackbar } from '../actions/snackbar';
import { withdraw } from '../utils/mixin';

class WithdrawToken extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      withdrawTo: '',
      withdrawMemo: '',
      withdrawAmount: '',
      withdrawPin: '',
      isLoading: false,
    };
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

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

  disableSubmit = () => {
    return !this.isWithdrawValid();
  };

  isWithdrawValid = () => {
    const { withdrawTo, withdrawAmount, isLoading, withdrawPin } = this.state;

    return (
      !isLoading &&
      withdrawTo &&
      isAddress(withdrawTo) &&
      withdrawAmount > 0 &&
      withdrawPin.length === 6
    );
  };

  isWithdrawing = () => {
    const { isLoading } = this.state;
    return !!isLoading;
  };

  withdrawToken = async () => {
    const {
      withdrawTo,
      withdrawMemo,
      withdrawAmount,
      withdrawPin,
    } = this.state;
    this.setState({ isLoading: true });

    const {
      asset,
      showSnackbar,
      hideWithdrawToken,
      activeAccount,
      reloadAccount,
    } = this.props;

    const userData = await getActiveUserData(activeAccount);
    const withdrawData = {
      withdrawTo,
      withdrawMemo,
      withdrawAmount,
      withdrawPin,
    };
    try {
      showSnackbar('Submitting withdraw transaction, please wait...');
      await withdraw(asset, userData, withdrawData);
      this.setState({
        isLoading: false,
        withdrawTo: '',
        withdrawMemo: '',
        withdrawAmount: '',
        withdrawPin: '',
      });
      reloadAccount();
      showSnackbar('Withdraw successfully!');
      hideWithdrawToken();
    } catch (error) {
      this.setState({ isLoading: false });
      console.error(error);
      showSnackbar(`Withdraw failed: ${error.description}`);
    }
  };

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };

  renderWithdrawing() {
    if (this.isWithdrawing()) {
      return (
        <div className="loading-info">
          <p>Submitting withdraw transaction, please wait...</p>
          <LinearProgress />
        </div>
      );
    }

    return null;
  }

  render() {
    const { open, asset, hideWithdrawToken, activeAccount } = this.props;
    if (!asset || !activeAccount) {
      return null;
    }

    const {
      withdrawTo,
      withdrawMemo,
      withdrawAmount,
      withdrawPin,
      showPassword,
    } = this.state;

    const balance = `${asset.balance || 0} ${asset.symbol}`;
    const addressLabel =
      asset.symbol === 'EOS' ? 'Account name' : 'Account address';

    return (
      <Dialog
        fullScreen
        open={open}
        onClose={hideWithdrawToken}
        TransitionComponent={Transition}
      >
        <AppBar position="static" className="appBar">
          <Toolbar>
            <Tooltip title="Close">
              <IconButton
                color="inherit"
                onClick={hideWithdrawToken}
                aria-label="Close"
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="h6" color="inherit">
              Withdraw
            </Typography>
          </Toolbar>
        </AppBar>
        <div>
          <Card className="card withdraw-card">
            <div className="withdraw-summary">
              <img src={asset.icon_url} alt={asset.name} />
              <p>{balance}</p>
            </div>
            <TextField
              required
              name="withdrawTo"
              label={addressLabel}
              className="withdraw-to"
              value={withdrawTo}
              onChange={this.handleChange}
              disabled={this.isWithdrawing()}
            />
            <TextField
              name="withdrawMemo"
              label="Memo"
              className="withdraw-memo"
              value={withdrawMemo}
              onChange={this.handleChange}
              margin="normal"
              inputProps={{ maxLength: 140 }}
              disabled={this.isWithdrawing()}
            />
            <TextField
              required
              name="withdrawAmount"
              label="Withdrawal Amount"
              className="withdraw-amount"
              value={withdrawAmount}
              onChange={this.handleAmountChange}
              margin="normal"
              type="number"
              placeholder="0.00"
              disabled={this.isWithdrawing()}
            />
            <FormControl className="withdraw-pin" margin="normal">
              <InputLabel htmlFor="withdrawPin">The 6 digit PIN</InputLabel>
              <Input
                required
                name="withdrawPin"
                type={showPassword ? 'text' : 'password'}
                value={withdrawPin}
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
                disabled={this.isWithdrawing()}
              />
            </FormControl>
            <Button
              id="withdraw-token-button"
              className="withdraw-token-button"
              variant="contained"
              color="secondary"
              disabled={this.disableSubmit()}
              onClick={this.withdrawToken}
            >
              Withdraw <Send className="withdraw-button-icon" />
            </Button>
            {this.renderWithdrawing()}
          </Card>
        </div>
      </Dialog>
    );
  }
}

const mapStateToProps = state => ({
  open: state.wallet.withdrawTokenOpen,
  activeAccount: state.account.activeAccount,
  asset: state.wallet.asset,
});

const mapDispatchToProps = {
  hideWithdrawToken,
  showSnackbar,
  reloadAccount,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WithdrawToken);
