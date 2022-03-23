/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {DialogProps} from './OrganizationDialog';

import FormLabel from '@material-ui/core/FormLabel';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import React from 'react';
import Select from '@material-ui/core/Select';

import {AltFormField} from '../components/design-system/FormField/FormField';
import {UserRoles} from '@fbcnms/auth/types';
import {makeStyles} from '@material-ui/styles';

const useStyles = makeStyles(_ => ({
  addButton: {
    minWidth: '150px',
  },
  selectItem: {
    fontSize: '12px',
    fontFamily: '"Inter", sans-serif',
    fontWeight: '600',
  },
}));

/**
 * Create User Tab
 * This component displays a form used to create a user that belongs to a new organization
 */
export default function OrganizationUserDialog(props: DialogProps) {
  const {user} = props;
  const classes = useStyles();

  return (
    <List>
      {props.error && (
        <AltFormField label={''}>
          <FormLabel error>{props.error}</FormLabel>
        </AltFormField>
      )}
      <AltFormField disableGutters label={'Email'}>
        <OutlinedInput
          data-testid="email"
          placeholder="Email"
          fullWidth={true}
          value={user.email}
          onChange={({target}) => {
            props.onUserChange({...user, email: target.value});
          }}
        />
      </AltFormField>
      <AltFormField disableGutters label={'Password'}>
        <OutlinedInput
          type="password"
          data-testid="password"
          placeholder="Enter Password"
          fullWidth={true}
          value={user.password}
          onChange={({target}) => {
            props.onUserChange({...user, password: target.value});
          }}
        />
      </AltFormField>
      <AltFormField disableGutters label={'Confirm Password'}>
        <OutlinedInput
          type="password"
          data-testid="passwordConfirmation"
          placeholder="Enter Password Confirmation"
          fullWidth={true}
          value={user?.passwordConfirmation}
          onChange={({target}) => {
            props.onUserChange({...user, passwordConfirmation: target.value});
          }}
        />
      </AltFormField>
      <AltFormField
        disableGutters
        label={'Role'}
        subLabel={
          'The role decides permissions that the user has to areas and features '
        }>
        <Select
          fullWidth={true}
          variant={'outlined'}
          value={user.role ?? 0}
          onChange={({target}) => {
            props.onUserChange({...user, role: target.value});
          }}
          input={<OutlinedInput id="direction" />}>
          <MenuItem key={UserRoles.USER} value={UserRoles.USER}>
            <ListItemText
              classes={{primary: classes.selectItem}}
              primary={'User'}
            />
          </MenuItem>
          <MenuItem
            key={UserRoles.READ_ONLY_USER}
            value={UserRoles.READ_ONLY_USER}>
            <ListItemText
              classes={{primary: classes.selectItem}}
              primary={'Read Only User'}
            />
          </MenuItem>
          <MenuItem key={UserRoles.SUPERUSER} value={UserRoles.SUPERUSER}>
            <ListItemText
              classes={{primary: classes.selectItem}}
              primary={'SuperUser'}
            />
          </MenuItem>
        </Select>
      </AltFormField>
    </List>
  );
}
