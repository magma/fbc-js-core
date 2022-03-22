/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */
import type {EditUser} from './OrganizationEdit';
import type {OrganizationPlainAttributes} from '@fbcnms/sequelize-models/models/organization';

import AppContext from '@fbcnms/ui/context/AppContext';
import Button from '@fbcnms/ui/components/design-system/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LoadingFillerBackdrop from '@fbcnms/ui/components/LoadingFillerBackdrop';
import OrganizationInfoDialog from './OrganizationInfoDialog';
import OrganizationUserDialog from './OrganizationUserDialog';
import React from 'react';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import {UserRoles} from '@fbcnms/auth/types';
import {brightGray, concrete, mirage, white} from '@fbcnms/ui/theme/colors';
import {makeStyles} from '@material-ui/styles';
import {useAxios} from '@fbcnms/ui/hooks';
import {useContext, useEffect, useState} from 'react';

const useStyles = makeStyles(_ => ({
  tabBar: {
    backgroundColor: brightGray,
    color: white,
  },
  dialog: {
    backgroundColor: concrete,
  },
  dialogActions: {
    backgroundColor: white,
    padding: '20px',
    zIndex: '1',
  },
  dialogContent: {
    padding: '32px',
    minHeight: '480px',
  },
  dialogTitle: {
    backgroundColor: mirage,
    padding: '16px 24px',
    color: white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
}));
type TabType =
  | 'automation'
  | 'admin'
  | 'inventory'
  | 'nms'
  | 'workorders'
  | 'hub';

export type DialogProps = {
  error: string,
  user: EditUser,
  organization: OrganizationPlainAttributes,
  onUserChange: EditUser => void,
  onOrganizationChange: OrganizationPlainAttributes => void,
  // Array of networks ids
  allNetworks: Array<string>,
  // If true, enable all networks for an organization
  shouldEnableAllNetworks: boolean,
  setShouldEnableAllNetworks: boolean => void,
  edit: boolean,
  getProjectTabs?: () => Array<{id: TabType, name: string}>,
  // flag to display advanced fields
  hideAdvancedFields: boolean,
};

type Props = {
  onClose: () => void,
  onCreateOrg: (org: $Shape<OrganizationPlainAttributes>) => void,
  onCreateUser: (user: CreateUserType) => void,
  // flag to display create user tab
  addUser: boolean,
  setAddUser: () => void,
  user: ?EditUser,
  open: boolean,
  organization: ?OrganizationPlainAttributes,
  // editing organization
  edit: boolean,
  // flag to display advanced fields
  hideAdvancedFields: boolean,
};

type CreateUserType = {
  email: string,
  id?: number,
  networkIDs: Array<string>,
  organization?: string,
  role: ?string,
  tabs?: Array<string>,
  password: ?string,
  passwordConfirmation?: string,
};

/**
 * Create Orgnization Dilaog
 * This component displays a dialog with 2 tabs
 * First tab: OrganizationInfoDialog, to create a new organization
 * Second tab: OrganizationUserDialog, to create a user that belongs to the new organization
 */
export default function (props: Props) {
  const {ssoEnabled} = useContext(AppContext);
  const classes = useStyles();
  const {error, isLoading, response} = useAxios({
    method: 'get',
    url: '/host/networks/async',
  });

  const [organization, setOrganization] = useState<OrganizationPlainAttributes>(
    props.organization || {},
  );
  const [currentTab, setCurrentTab] = useState(0);
  const [shouldEnableAllNetworks, setShouldEnableAllNetworks] = useState(false);
  const [user, setUser] = useState<EditUser>(props.user || {});
  const [createError, setCreateError] = useState('');
  const allNetworks = error || !response ? [] : response.data.sort();
  const organizationDialogTitle =
    currentTab === 1
      ? 'Add User'
      : props.edit
      ? 'Edit Organization'
      : 'Add Organization';

  useEffect(() => {
    setCurrentTab(props.addUser ? 1 : 0);
  }, [props.addUser]);

  useEffect(() => {
    setOrganization(props.organization || {});
    setCreateError('');
    setUser(props.user || {});
  }, [props.open, props.organization, props.user]);

  if (isLoading) {
    return <LoadingFillerBackdrop />;
  }

  const createProps = {
    user,
    organization,
    error: createError,
    onUserChange: (user: EditUser) => {
      setUser(user);
    },
    onOrganizationChange: (organization: OrganizationPlainAttributes) => {
      setOrganization(organization);
    },
    allNetworks,
    shouldEnableAllNetworks,
    setShouldEnableAllNetworks,
    edit: props.edit,
    hideAdvancedFields: props.hideAdvancedFields,
  };
  const onSave = async () => {
    if (currentTab === 0) {
      if (!organization.name) {
        setCreateError('Name cannot be empty');
        return;
      }
      const newOrg = {
        name: organization.name,
        networkIDs: shouldEnableAllNetworks
          ? allNetworks
          : Array.from(organization.networkIDs || []),
        customDomains: [], // TODO
        // default tab is nms
        tabs: Array.from(organization.tabs || ['nms']),
        csvCharset: '',
        ssoSelectedType: 'none',
        ssoCert: '',
        ssoEntrypoint: '',
        ssoIssuer: '',
        ssoOidcClientID: '',
        ssoOidcClientSecret: '',
        ssoOidcConfigurationURL: '',
      };

      props.onCreateOrg(newOrg);
      setCurrentTab(currentTab + 1);
      setCreateError('');
      props.setAddUser();
    } else {
      if (user.password != user.passwordConfirmation) {
        setCreateError('Passwords must match');
        return;
      }
      if (!user?.email) {
        setCreateError('Email cannot be empty');
        return;
      }

      if ((!user?.password ?? false) && !ssoEnabled && !user.id) {
        setCreateError('Password cannot be empty');
        return;
      }

      const newUser: CreateUserType = {
        email: user.email,
        password: user.password,
        role: user.role,
        networkIDs:
          user.role === UserRoles.SUPERUSER
            ? []
            : Array.from(user.networkIDs || []),
      };
      if ((user.id || ssoEnabled) && !user?.password) {
        delete newUser.password;
      }
      props.onCreateUser(newUser);
    }
  };

  return (
    <Dialog
      classes={{paper: classes.dialog}}
      open={props.open}
      onClose={props.onClose}
      maxWidth={'sm'}
      fullWidth={true}>
      <DialogTitle classes={{root: classes.dialogTitle}}>
        {Object.keys(user).length > 0 ? 'Edit User' : organizationDialogTitle}
      </DialogTitle>
      <Tabs
        indicatorColor="primary"
        value={currentTab}
        className={classes.tabBar}
        onChange={(_, v) => setCurrentTab(v)}>
        <Tab disabled={currentTab === 1} label={'Organization'} />
        <Tab disabled={currentTab === 0} label={'Users'} />
      </Tabs>
      <DialogContent classes={{root: classes.dialogContent}}>
        {currentTab === 0 && <OrganizationInfoDialog {...createProps} />}
        {currentTab === 1 && <OrganizationUserDialog {...createProps} />}
      </DialogContent>
      <DialogActions classes={{root: classes.dialogActions}}>
        <Button onClick={props.onClose} skin="regular">
          Cancel
        </Button>
        <Button
          disabled={
            Object.keys(organization).length < 1 || organization?.id === ''
          }
          skin="comet"
          onClick={onSave}>
          {'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}