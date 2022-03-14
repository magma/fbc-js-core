/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {DataRows} from '../components/DataGrid';

import DataGrid from '../components/DataGrid';
import React from 'react';

type OverviewProps = {
  name: string,
  networkIds: Set<string>,
};

/**
 * Organization basic information
 */
export default function OrganizationSummary(props: OverviewProps) {
  const {name, networkIds} = props;
  const kpiData: DataRows[] = [
    [
      {
        category: 'Organization Name',
        value: name,
      },
    ],
    [
      {
        category: 'Accessible Networks',
        value: [...(networkIds || [])].join(', ') || '-',
      },
    ],
    [
      {
        category: 'Link to Organization Portal',
        value: `link to ${name} org`,
      },
    ],
  ];
  return <DataGrid data={kpiData} />;
}
