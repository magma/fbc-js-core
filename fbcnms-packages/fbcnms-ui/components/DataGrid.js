/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */
import typeof SvgIcon from '@material-ui/core/@@SvgIcon';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import React from 'react';

import {brightGray, comet, concrete} from '@fbcnms/ui/theme/colors';
import {makeStyles} from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  dataBlock: {
    boxShadow: `0 0 0 1px ${concrete}`,
  },
  dataLabel: {
    fontWeight: '500',
    color: comet,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  dataValue: {
    fontSize: '18px',
    color: brightGray,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: props =>
      props.hasStatus
        ? 'calc(100% - 16px)'
        : props.hasIcon
        ? 'calc(100% - 32px)'
        : '100%',
  },
  dataBox: {
    width: '100%',
    padding: props => (props.collapsed ? '0' : null),

    '& > div': {
      width: '100%',
    },
  },
  dataIcon: {
    display: 'flex',
    alignItems: 'center',

    '& svg': {
      fill: comet,
      marginRight: theme.spacing(1),
    },
  },
  list: {
    padding: 0,
  },
}));

// Data Icon adds an icon to the left of the value
function DataIcon(icon: SvgIcon, val: string) {
  const props = {hasIcon: true};
  const classes = useStyles(props);
  const Icon = icon;
  return (
    <Grid container alignItems="center">
      <Grid item className={classes.dataIcon}>
        <Icon />
      </Grid>
      <Grid item className={classes.dataValue}>
        {val}
      </Grid>
    </Grid>
  );
}

type Data = {
  icon?: SvgIcon,
  category?: string,
  value: number | string,
  unit?: string,
  statusCircle?: boolean,
  statusInactive?: boolean,
  status?: boolean,
  tooltip?: string,
};

export type DataRows = Data[];

type Props = {data: DataRows[], testID?: string};

export default function DataGrid(props: Props) {
  const classes = useStyles();
  const dataGrid = props.data.map((row, i) => (
    <Grid key={i} container direction="row">
      {row.map((data, j) => {
        const dataEntryValue = data.value + (data.unit ?? '');

        return (
          <React.Fragment key={`data-${i}-${j}`}>
            <Grid
              item
              container
              alignItems="center"
              xs={12}
              md
              key={`data-${i}-${j}`}
              zeroMinWidth
              className={classes.dataBlock}>
              <Grid item xs={12}>
                <CardHeader
                  data-testid={data.category}
                  className={classes.dataBox}
                  title={data.category}
                  titleTypographyProps={{
                    variant: 'caption',
                    className: classes.dataLabel,
                    title: data.category,
                  }}
                  subheaderTypographyProps={{
                    variant: 'body1',
                    className: classes.dataValue,
                    title: data.tooltip ?? dataEntryValue,
                  }}
                  subheader={
                    data.icon
                      ? DataIcon(data.icon, dataEntryValue)
                      : dataEntryValue
                  }
                />
              </Grid>
            </Grid>
          </React.Fragment>
        );
      })}
    </Grid>
  ));
  return (
    <Card elevation={0}>
      <Grid
        container
        alignItems="center"
        justify="center"
        data-testid={props.testID ?? null}>
        {dataGrid}
      </Grid>
    </Card>
  );
}
