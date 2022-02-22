/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 *
 */

import React from 'react';
import {PROMETHEUS_RULE_TYPE} from './rules/PrometheusEditor/getRuleInterface';
import type {ApiUtil} from './AlarmsApi';
import type {FiringAlarm, Labels} from './AlarmAPIType';
import type {RuleInterfaceMap} from './rules/RuleInterface';

export type AlarmContext = {|
  apiUtil: ApiUtil,
  filterLabels?: (labels: Labels) => Labels,
  ruleMap: RuleInterfaceMap<*>,
  getAlertType?: ?GetAlertType,
  getNetworkId?: () => string,
  // feature flags
  thresholdEditorEnabled?: boolean,
  alertManagerGlobalConfigEnabled?: boolean,
|};

/***
 * Determine the type of alert based on its labels/annotations. Since all
 * alerts come from alertmanager, regardless of source, we can only determine
 * the source by inspecting the labels/annotations.
 */
export type GetAlertType = (
  alert: FiringAlarm,
  ruleMap?: RuleInterfaceMap<mixed>,
) => $Keys<RuleInterfaceMap<mixed>>;

const notImplemented = (..._) => Promise.reject('not implemented');
const emptyApiUtil = {
  useAlarmsApi: () => ({
    response: null,
    error: new Error('not implemented'),
    isLoading: false,
  }),
  viewFiringAlerts: notImplemented,
  getTroubleshootingLink: notImplemented,
  viewMatchingAlerts: notImplemented,
  createAlertRule: notImplemented,
  editAlertRule: notImplemented,
  getAlertRules: notImplemented,
  deleteAlertRule: notImplemented,
  getSuppressions: notImplemented,
  createReceiver: notImplemented,
  editReceiver: notImplemented,
  getReceivers: notImplemented,
  deleteReceiver: notImplemented,
  getRouteTree: notImplemented,
  editRouteTree: notImplemented,
  getMetricNames: notImplemented,
  getMetricSeries: notImplemented,
  getGlobalConfig: notImplemented,
  editGlobalConfig: notImplemented,
  getTenants: notImplemented,
  getAlertmanagerTenancy: notImplemented,
  getPrometheusTenancy: notImplemented,
  getPrometheusPredefinedRules: notImplemented,
};

const context = React.createContext<AlarmContext>({
  apiUtil: emptyApiUtil,
  filterLabels: x => x,
  ruleMap: {},
  getAlertType: _ => PROMETHEUS_RULE_TYPE,
  thresholdEditorEnabled: false,
  alertManagerGlobalConfigEnabled: false,
});

export function useAlarmContext() {
  return React.useContext(context);
}

export default context;
