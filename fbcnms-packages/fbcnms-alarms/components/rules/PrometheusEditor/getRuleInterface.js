/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import PrometheusEditor from './PrometheusEditor';
import {
  PREDEFINED_RULE_IMPORT_STATE,
  PREDEFINED_RULE_VERSION_LABEL,
} from '../../rules/RuleInterface';
import type {AlertConfig} from '../../AlarmAPIType';
import type {ApiUtil} from '../../AlarmsApi';
import type {GenericRule, RuleInterfaceMap} from '../../rules/RuleInterface';

export const PROMETHEUS_RULE_TYPE = 'prometheus';

export default function getPrometheusRuleInterface({
  apiUtil,
}: {
  apiUtil: ApiUtil,
}): RuleInterfaceMap<AlertConfig> {
  return {
    [PROMETHEUS_RULE_TYPE]: {
      friendlyName: PROMETHEUS_RULE_TYPE,
      RuleEditor: PrometheusEditor,
      /**
       * Get alert rules from backend and map to generic
       */
      getRules: async req => {
        const rules = await apiUtil.getAlertRules(req);
        return rules.map<GenericRule<AlertConfig>>(rule =>
          promAlertConfigToGenericRule(rule),
        );
      },
      deleteRule: params => apiUtil.deleteAlertRule(params),
      getPredefinedRules: async req => {
        if (typeof apiUtil.getPrometheusPredefinedRules === 'function') {
          const predefined = await apiUtil.getPrometheusPredefinedRules(req);
          // getAlertRules fetches only the prometheus alert rules
          const existingRules = await apiUtil.getAlertRules(req);
          const existing = existingRules.reduce((_rules, rule) => {
            _rules?.set(rule.alert, rule);
            return _rules;
          }, new Map<string, AlertConfig>());
          return predefined.reduce((_rules, rule) => {
            const mappedRule = promAlertConfigToGenericRule(rule);
            const existingRule = existing.get(mappedRule.name);
            if (existingRule == null) {
              mappedRule.predefinedRuleState =
                PREDEFINED_RULE_IMPORT_STATE.NEEDS_IMPORT;
              _rules.push(mappedRule);
            } else {
              const existingVer = parseInt(
                existingRule.labels
                  ? existingRule.labels[PREDEFINED_RULE_VERSION_LABEL]
                  : null,
              );
              const newVer = parseInt(
                rule.labels ? rule.labels[PREDEFINED_RULE_VERSION_LABEL] : null,
              );
              if (
                !isNaN(existingVer) &&
                !isNaN(newVer) &&
                newVer > existingVer
              ) {
                mappedRule.predefinedRuleState =
                  PREDEFINED_RULE_IMPORT_STATE.UPGRADE;
              } else {
                mappedRule.predefinedRuleState =
                  PREDEFINED_RULE_IMPORT_STATE.READY;
              }
            }
            return _rules;
          }, []);
        }
        return [];
      },
    },
  };
}

function promAlertConfigToGenericRule(
  alertConfig: AlertConfig,
): GenericRule<AlertConfig> {
  return {
    name: alertConfig.alert,
    description: alertConfig.annotations?.description || '',
    severity: alertConfig.labels?.severity || '',
    period: alertConfig.for || '',
    expression: alertConfig.expr,
    ruleType: PROMETHEUS_RULE_TYPE,
    rawRule: alertConfig,
  };
}
