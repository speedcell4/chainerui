import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import {
  loadResults,
  createCommand,
  updateGlobalPollingRate,
  updateGlobalChartSize
} from '../actions';
import NavigationBar from '../components/NavigationBar';
import BreadcrumbLink from '../components/BreadcrumbLink';
import ResultSummary from '../components/result/ResultSummary';
import Args from '../components/result/Args';
import Commands from '../components/result/Commands';
import Snapshots from '../components/result/Snapshots';
import { defaultConfig } from '../constants';
import { startPolling, stopPolling } from '../utils';

class ResultDetail extends React.Component {
  componentDidMount() {
    const { pollingRate } = this.props.globalConfig;
    this.resultsPollingTimer = startPolling(this.props.loadResults, pollingRate);
  }

  componentWillReceiveProps(nextProps) {
    const currentPollingRate = this.props.globalConfig.pollingRate;
    const nextPollingRate = nextProps.globalConfig.pollingRate;

    if (currentPollingRate !== nextPollingRate) {
      stopPolling(this.resultsPollingTimer);
      this.resultsPollingTimer = startPolling(this.props.loadResults, nextPollingRate);
    }
  }

  componentWillUnmount() {
    stopPolling(this.resultsPollingTimer);
  }

  render() {
    const {
      result, globalConfig, fetchState
    } = this.props;
    return (
      <div className="result-detail">
        <NavigationBar
          fetchState={fetchState}
          globalConfig={globalConfig}
          onGlobalConfigPollingRateUpdate={this.props.updateGlobalPollingRate}
          onGlobalConfigChartSizeUpdate={this.props.updateGlobalChartSize}
        />
        <Container fluid>
          <BreadcrumbLink
            length={3}
            project={{ id: 1, name: 'MyProject' }}
            result={result}
          />
          <div className="row">
            <div className="col-sm-6 p-2">
              <ResultSummary result={result} />
            </div>
            <div className="col-sm-6 p-2">
              <Args args={result.args || []} />
            </div>
            <div className="col-sm-6 p-2">
              {
                (result.id != null) ? (
                  <Commands
                    resultId={result.id}
                    commands={result.commands || []}
                    onCommandSubmit={this.props.createCommand}
                  />
                ) : null
              }
            </div>
            <div className="col-sm-6 p-2">
              <Snapshots snapshots={result.snapshots || []} />
            </div>
          </div>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const resultId = Number(ownProps.params.resultId);
  const {
    entities,
    fetchState,
    config = defaultConfig
  } = state;
  const globalConfig = config.global;
  const { results = {} } = entities;
  const result = results[resultId] || {};
  return { result, fetchState, globalConfig };
};

ResultDetail.propTypes = {
  result: PropTypes.shape({
    id: PropTypes.number,
    pathName: PropTypes.string,
    name: PropTypes.string,
    args: PropTypes.arrayOf(PropTypes.any),
    logs: PropTypes.arrayOf(PropTypes.any)
  }).isRequired,
  fetchState: PropTypes.shape({
    results: PropTypes.string
  }).isRequired,
  globalConfig: PropTypes.objectOf(PropTypes.any).isRequired,
  loadResults: PropTypes.func.isRequired,
  createCommand: PropTypes.func.isRequired,
  updateGlobalPollingRate: PropTypes.func.isRequired,
  updateGlobalChartSize: PropTypes.func.isRequired
};

export default connect(mapStateToProps, {
  loadResults,
  createCommand,
  updateGlobalPollingRate,
  updateGlobalChartSize
})(ResultDetail);

