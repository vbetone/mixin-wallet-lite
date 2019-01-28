import React from 'react';
import { connect } from 'react-redux';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Card from '@material-ui/core/Card/Card';
import TextField from '@material-ui/core/TextField/TextField';
import Button from '@material-ui/core/Button/Button';
import Send from '@material-ui/icons/Send';
import LinearProgress from '@material-ui/core/LinearProgress';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import FormControl from '@material-ui/core/FormControl';
import { withStyles } from '@material-ui/core/styles';
import NotificationService from '../../services/notificationService';


const styles = {
  card: {
    background: 'transparent',
    margin: '20px 20px 20px 20px',
  },
  header: {
    marginTop: 10,
    marginBottom: 0,
  },
  domain: {
    color: '#3583d6',
  },
  content: {
    margin: '0 20px 0 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  assetIcon: {
    width: 20,
    height: 20,
  },
  tf: {
    width: '100%',
  },
  sendButton: {
    width: '50%',
    margin: '10px 0 10px 0',
  },
  sendButtonIcon: {
    marginLeft: 10
  }
}

class RequestTransfer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sendPin: '',
      isLoading: false,
      showPassword: false,
      rememberPin: false,
    };
  }

  handlePinChange = event => {
    let value = event.target.value;
    value = value.replace(/\D/g, ''); // numeric only
    this.setState({ [event.target.name]: value });
  };

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };

  disableSubmit = () => {
    return !this.isSendValid();
  };

  isSendValid = () => {
    const { sendPin } = this.state;
    const { data } = this.props;
    const { asset, sendAmount, sendTo } = data;

    return (
      sendTo &&
      asset &&
      asset.balance &&
      parseFloat(asset.balance) >= parseFloat(sendAmount) &&
      sendAmount > 0 &&
      sendPin && sendPin.length === 6
    );
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.checked });
  };

  isSending = () => {
    const { isLoading } = this.state;
    return !!isLoading;
  };

  sendToken = () => {
    try {
      const { sendPin, rememberPin } = this.state;
      const { data, responder } = this.props;
      const sendData = { sendPin, rememberPin, ...data };
      if (responder && typeof responder === 'function') {
        responder(sendData);
      }
      NotificationService.close();
    } catch (error) {
      console.error(error);
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
    const { classes, data, domain } = this.props;
    const { asset, sendAmount, sendMemo, sendTo } = data;
    const { rememberPin, showPassword, sendPin } = this.state;
    return (
      <div className={classes.container}>
        <div>
        <Card className={classes.card}>
          <div className={classes.header}>
            <h3><b className={classes.domain}>{domain}</b> is requesting transfer</h3>
          </div>
          <div className={classes.content}>
            <TextField
              disabled
              label="Token"
              className={classes.tf}
              value={`${asset.balance || 0} ${asset.symbol}`}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <img
                      src={asset.icon_url}
                      alt={asset.symbol}
                      className={classes.assetIcon}
                    />
                  </InputAdornment>
                )
              }}
            >
            </TextField>
            <TextField
              required
              name="sendTo"
              label="To User ID"
              className={classes.tf}
              autoComplete="off"
              value={sendTo}
              margin="normal"
              disabled
            />
            <TextField
              required
              name="sendAmount"
              label="Amount"
              className={classes.tf}
              value={sendAmount}
              margin="normal"
              type="number"
              placeholder="0.00"
              disabled
            />
            <TextField
              name="sendMemo"
              label="Memo"
              className={classes.tf}
              value={sendMemo}
              margin="normal"
              inputProps={{ maxLength: 140 }}
              disabled
            />
            <FormControl className={classes.tf} margin="normal">
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
                placeholder="666666"
                inputProps={{ maxLength: 6 }}
                disabled={this.isSending()}
              />
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberPin}
                    onChange={this.handleChange}
                    name="rememberPin"
                    color="primary"
                  />
                }
                label="Remember Pin"
              />
            <Button
              id="send-token-button"
              className={classes.sendButton}
              variant="contained"
              color="secondary"
              disabled={this.disableSubmit()}
              onClick={this.sendToken}
            >
              Transfer <Send className={classes.sendButtonIcon} />
            </Button>
          </div>
        </Card>
      </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  data: state.prompt.data,
  domain: state.prompt.domain,
  responder: state.prompt.responder
});

const mapDispatchToProps = {};

const styled = withStyles(styles)(RequestTransfer);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(styled);
