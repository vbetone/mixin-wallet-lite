import React from 'react';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';

import { loadAssetsWithPreset } from '../utils/mixin';
import { getActiveUserData } from '../utils/crypto';
import { showDepositToken, showWithdrawToken } from '../actions/wallet';
import presetAssets from '../config/preset-assets';
import WithdrawToken from './WithdrawToken';
import DepositToken from './DepositToken';
import { setAssets } from '../actions/account';

class Assets extends React.Component {
  constructor(props) {
    super(props);
    this.state = { assets: presetAssets };
  }

  componentDidMount() {
    const { activeAccount } = this.props;
    this.loadAssets(activeAccount);
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (
      this.props.activeAccount !== prevProps.activeAccount ||
      this.props.reloadAccountNonce !== prevProps.reloadAccountNonce
    ) {
      this.loadAssets(this.props.activeAccount);
    }
  }

  loadAssets = async activeAccount => {
    const { setAssets } = this.props;
    const userData = await getActiveUserData(activeAccount);
    const assets = await loadAssetsWithPreset(userData);
    setAssets(assets);
    this.setState({ assets });
  };

  render() {
    const { assets } = this.state;
    const { showDepositToken, showWithdrawToken } = this.props;
    return (
      <div className="cards">
        <Card className="card assets-card">
          <Table className="assets-table">
            <TableBody>
              {assets.map(asset => {
                const balance = `${asset.balance || 0} ${asset.symbol}`;
                return (
                  <TableRow key={asset.asset_id}>
                    <TableCell className="assets-token-icon">
                      <img src={asset.icon_url} alt={asset.name} />
                    </TableCell>
                    <TableCell className="assets-token-balance">
                      {balance}
                    </TableCell>
                    <TableCell className="assets-token-deposit">
                      <Button
                        size="small"
                        color="secondary"
                        onClick={() => showDepositToken(asset)}
                      >
                        Deposit
                      </Button>
                    </TableCell>
                    <TableCell className="assets-token-withdraw">
                      <Button
                        size="small"
                        color="secondary"
                        onClick={() => showWithdrawToken(asset)}
                      >
                        Withdraw
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
        <DepositToken />
        <WithdrawToken />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  activeAccount: state.account.activeAccount,
  reloadAccountNonce: state.wallet.reloadAccountNonce,
});

const mapDispatchToProps = {
  showDepositToken,
  showWithdrawToken,
  setAssets,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Assets);
