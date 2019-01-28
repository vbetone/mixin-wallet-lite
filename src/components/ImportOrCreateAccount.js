import React from 'react';
import { connect } from 'react-redux';
import Card from '@material-ui/core/Card/Card';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import Typography from '@material-ui/core/Typography/Typography';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import VpnKey from '@material-ui/icons/VpnKey';
import PermIdentity from '@material-ui/icons/PermIdentity';

import logoMixin from '../images/Mixin.png';
import { showCreateAccount, showImportPrivateKey } from '../actions/wallet';
import ImportPrivateKey from './ImportPrivateKey';
import CreateAccount from './CreateAccount';

const ImportOrCreateAccount = ({ showImportPrivateKey, showCreateAccount }) => (
  <div>
    <div className="cards">
      <Card className="card sign-in-card">
        <div className="logo-container">
          <Tooltip title="Mixin">
            <img src={logoMixin} alt="Mixin" className="token-logo-lg" />
          </Tooltip>
        </div>
        <div className="space" />
        <Typography variant="h6">Import By</Typography>
        <div className="space" />
        <Grid container spacing={24}>
          <Grid item xs={12}>
            <Button
              className="sign-in-button button"
              color="secondary"
              variant="contained"
              onClick={showImportPrivateKey}
            >
              Private Key <VpnKey className="account-details-button-icon" />
            </Button>
            <div className="space" />
          </Grid>
        </Grid>
      </Card>
      <Card className="card sign-in-card">
        <div className="space" />
        <Typography variant="h6">Create account</Typography>
        <div className="space" />
        <Button
          className="sign-in-button button"
          color="secondary"
          variant="contained"
          onClick={showCreateAccount}
        >
          Create account{' '}
          <PermIdentity className="account-details-button-icon" />
        </Button>
        <div className="space" />
      </Card>
    </div>
    <ImportPrivateKey />
    <CreateAccount />
  </div>
);

const mapDispatchToProps = {
  showImportPrivateKey,
  showCreateAccount,
};

export default connect(
  null,
  mapDispatchToProps
)(ImportOrCreateAccount);
