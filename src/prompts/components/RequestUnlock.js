import React from 'react';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card/Card';
import Button from '@material-ui/core/Button/Button';
import NotificationService from '../../services/notificationService';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  container: {
  },
  card: {
    background: 'transparent',
    height: 280,
    margin: '50px 20px 50px 20px',
  },
  header: {
    marginTop: '40px',
  },
  content: {
    textAlign: 'left',
    marginBottom: '30px',
  },
  button: {
    background: 'transparent',
    color: 'gray',
    '&:hover': {
      backgroundColor: '#ffffff',
    },
  }
}

class RequestUnlock extends React.Component {
  constructor(props) {
    super(props);
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleCancel() {
    NotificationService.close();
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <div>
          <Card className={classes.card}>
            <section>
              <figure className={classes.header}>
                  <b>Wallet is locked</b>
              </figure>
              <figure className={classes.content}>
                  <br />
                  Before you can do anything with your Wallet you will need to unlock it.
                  <br />
                  <br />
                  We will purposely never show a prompt/popup which requires you to log in.
                  <br />
                  <br />
                  If you see a prompt/popup which is requesting your password, it is a malicious website trying to get your password.
                  Always only unlock Wallet from the extension's popup by clicking on the icon in your browser tray.
              </figure>
            </section>
          </Card>
        </div>
        <footer>
          <Button
            size="large"
            variant="contained"
            color="secondary"
            className={classes.button}
            onClick={this.handleCancel}
          >
            Cancel
          </Button>
        </footer>
      </div>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

const styled = withStyles(styles)(RequestUnlock);
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(styled);
