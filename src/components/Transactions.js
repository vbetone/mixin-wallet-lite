import React from 'react';
import { connect } from 'react-redux';

import Card from '@material-ui/core/Card';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Avatar from '@material-ui/core/Avatar';
import orangeAvatar from '@material-ui/core/colors/deepOrange';
import greenAvatar from '@material-ui/core/colors/green';
import Grid from '@material-ui/core/Grid';

import moment from 'moment';

import {
  getTxAbbreviation,
  getActiveUserData,
  getAddressAbbreviation,
} from '../utils/crypto';
import { loadTransactions } from '../utils/mixin';

const EXPLORER_TX_URL = 'https://mixin.one/snapshots/';

const styles = {
  orangeAvatar: {
    color: '#fff',
    fontSize: 8,
    width: 25,
    height: 25,
    backgroundColor: orangeAvatar[500],
  },
  greenAvatar: {
    color: '#fff',
    fontSize: 8,
    width: 25,
    height: 25,
    backgroundColor: greenAvatar[500],
  },
};

class Transactions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { activeAccount } = this.props;
    this.loadTransactions(activeAccount);
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (
      this.props.activeAccount !== prevProps.activeAccount ||
      this.props.reloadAccountNonce !== prevProps.reloadAccountNonce
    ) {
      this.loadTransactions(this.props.activeAccount);
    }
  }

  loadTransactions = async activeAccount => {
    const userData = await getActiveUserData(activeAccount);
    const transactions = await loadTransactions(userData);
    this.setState({ transactions });
  };

  renderAvatarColor(amount) {
    if (amount > 0) {
      return styles.greenAvatar;
    }
    return styles.orangeAvatar;
  }

  renderAvatar(amount) {
    if (amount > 0) {
      return 'IN';
    }
    return 'OUT';
  }

  renderFromOrTo(amount, opponentId) {
    if (amount > 0) {
      return `From: ${getAddressAbbreviation(opponentId)}`;
    }
    return `To: ${getAddressAbbreviation(opponentId)}`;
  }

  renderTransactionsTable() {
    const { transactions } = this.state;
    const { assets } = this.props;
    if (!assets || assets.length === 0) {
      return null;
    }

    return (
      <div>
        <Table className="transactions-table">
          <TableHead>
            <TableRow>
              <TableCell className="transactions-icon" />
              <TableCell className="transactions-time-hash">
                Time/Snapshot
              </TableCell>
              <TableCell className="transactions-in-out" />
              <TableCell className="transactions-addresses">From/To</TableCell>
              <TableCell className="transactions-amount" numeric>
                Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(transaction => {
              const amount = transaction.amount;
              const positiveAmount = amount > 0 ? amount : -amount;
              const txURL = `${EXPLORER_TX_URL}${transaction.snapshot_id}`;
              const avatar = this.renderAvatar(amount);
              const avatarColor = this.renderAvatarColor(amount);
              const asset = assets.find(
                a => a.asset_id === transaction.asset_id
              );
              const icon = asset && asset.icon_url;
              const symbol = asset && asset.symbol;
              return (
                <TableRow key={transaction.snapshot_id}>
                  <TableCell className="transactions-icon" scope="row">
                    <img
                      src={icon}
                      alt={symbol}
                      className="transactions-icon-image"
                    />
                  </TableCell>
                  <TableCell
                    className="transactions-time-hash"
                    component="th"
                    scope="row"
                  >
                    <Grid container justify="flex-start" alignItems="center">
                      {moment(transaction.created_at).format(
                        'MMM Do, h:mm:ss a'
                      )}
                      <br />
                      <a
                        href={txURL}
                        className="tx-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getTxAbbreviation(transaction.snapshot_id)}
                      </a>
                    </Grid>
                  </TableCell>
                  <TableCell className="transactions-in-out">
                    <Avatar style={avatarColor}>{avatar}</Avatar>{' '}
                  </TableCell>
                  <TableCell className="transactions-addresses">
                    <span>
                      {' '}
                      {this.renderFromOrTo(
                        amount,
                        transaction.opponent_id
                      )}{' '}
                    </span>
                  </TableCell>
                  <TableCell className="transactions-amount" numeric>
                    {positiveAmount} {symbol}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }

  render() {
    const { transactions } = this.state;
    if (!transactions) {
      return (
        <div className="cards">
          <Card className="card transactions-card">
            <p>Loading transactions...</p>
          </Card>
        </div>
      );
    } else if (transactions.length === 0) {
      return (
        <div className="cards">
          <Card className="card transactions-card">
            <p>No transactions</p>
          </Card>
        </div>
      );
    }
    return (
      <div className="cards">
        <Card className="card transactions-card">
          {this.renderTransactionsTable()}
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  activeAccount: state.account.activeAccount,
  assets: state.account.assets,
  reloadAccountNonce: state.wallet.reloadAccountNonce,
});

export default connect(mapStateToProps)(Transactions);
