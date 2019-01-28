import React from 'react';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button/Button';
import TextField from '@material-ui/core/TextField/TextField';
import { withStyles } from '@material-ui/core/styles';
import NotificationService from '../../services/notificationService';

const styles = {
  container: {

  },
  card: {
    background: 'transparent',
    height: 300,
    margin: '50px 20px 30px 20px',
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
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
  tf: {
    width: '100%'
  },
  rejectBtn: {
    background: 'transparent',
    color: 'gray',
    '&:hover': {
      backgroundColor: '#ffffff',
    },
    margin: 10,
  },
  acceptBtn: {
    margin: 10,
  }
}

class RequestIdentity extends React.Component {

  constructor(props) {
    super(props);
    this.handleReject = this.handleReject.bind(this);
    this.handleAccept = this.handleAccept.bind(this);
  }

  handleReject() {
    const { responder } = this.props;
    if (responder && typeof responder === 'function') {
      responder(null);
    }
    NotificationService.close();
  }

  handleAccept() {
    const { responder, data } = this.props;
    if (responder && typeof responder === 'function') {
      responder(data);
    }
    NotificationService.close();
  }

  render() {
    const { classes, data, domain } = this.props;
    const { clientId, fullName, publicKey } = data;
    return (
      <div className={ classes.container }>
        <div>
          <Card className={classes.card}>
            <div className={classes.header}>
              <h3><b className={classes.domain}>{domain}</b> is requesting your identity</h3>
            </div>
            <div className={classes.content}>
              <TextField
                disabled
                label="Full Name"
                value={fullName}
                margin="normal"
                className={classes.tf}
              >
              </TextField>
              <TextField
                disabled
                label="User Id"
                value={clientId}
                margin="normal"
                className={classes.tf}
              />
              <TextField
                disabled
                label="Public Key"
                value={publicKey}
                margin="normal"
                className={classes.tf}
              />
            </div>
          </Card>
          <footer>
            <Button
              size="large"
              variant="contained"
              color="secondary"
              className={classes.rejectBtn}
              onClick={this.handleReject}
            >
              Reject
            </Button>
            <Button
              size="large"
              variant="contained"
              color="primary"
              className={classes.acceptBtn}
              onClick={this.handleAccept}
            >
              Accept
            </Button>
          </footer>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  domain: state.prompt.domain,
  data: state.prompt.data,
  responder: state.prompt.responder
});

const mapDispatchToProps = {};

const styled = withStyles(styles)(RequestIdentity);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(styled);
