/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {EnqueueSnackbarOptions} from 'notistack';
import type {OrganizationPlainAttributes} from '@fbcnms/sequelize-models/models/organization';
import type {UserType} from '@fbcnms/sequelize-models/models/user.js';
import type {WithAlert} from '@fbcnms/ui/components/Alert/withAlert';

import ActionTable from '../components/ActionTable';
import BusinessIcon from '@material-ui/icons/Business';
import Button from '@fbcnms/ui/components/design-system/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import LoadingFiller from '@fbcnms/ui/components/LoadingFiller';
import OrganizationDialog from './OrganizationDialog';
import Paper from '@material-ui/core/Paper';
import PersonAdd from '@material-ui/icons/PersonAdd';
import PersonIcon from '@material-ui/icons/Person';
import Popper from '@material-ui/core/Popper';
import React from 'react';
import Text from '../components/design-system/Text';
import axios from 'axios';
import withAlert from '@fbcnms/ui/components/Alert/withAlert';

import {comet, concrete} from '@fbcnms/ui/theme/colors';
import {makeStyles} from '@material-ui/styles';
import {useAxios, useRouter} from '@fbcnms/ui/hooks';
import {useCallback, useEffect, useState} from 'react';
import {useEnqueueSnackbar} from '@fbcnms/ui/hooks/useSnackbar';
import {useRelativeUrl} from '@fbcnms/ui/hooks/useRouter';

export type Organization = OrganizationPlainAttributes;

const ORGANIZATION_DESCRIPTION =
  'Multiple organizations can be independently managed, each with access to their own networks. ' +
  'As a host user, you can create and manage organizations here. You can also create users for these organizations.';

const useStyles = makeStyles(_ => ({
  addButton: {
    minWidth: '150px',
  },
  description: {
    margin: '20px 0',
  },
  header: {
    margin: '10px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  container: {
    margin: '40px 32px',
  },
  onBoardingDialog: {
    padding: '24px 0',
  },
  onBoardingDialogTitle: {
    padding: '0 24px',
    fontSize: '24px',
    color: comet,
    backgroundColor: concrete,
  },
  onBoardingDialogContent: {
    minHeight: '200px',
    padding: '16px 24px',
  },
  onBoardingDialogActions: {
    padding: '0 24px',
    backgroundColor: concrete,
    boxShadow: 'none',
  },
  onBoardingDialogButton: {
    minWidth: '120px',
  },
  subtitle: {
    margin: '16px 0',
  },
  tooltip: {
    backgroundColor: 'white',
    color: 'black',
    fontSize: '18px',
    padding: '16px 8px',
    pointerEvents: 'auto',
  },
  arrow: {
    color: 'white',
  },
  paper: {
    backgroundColor: '#FFFFFF',
    minHeight: '56px',
    display: 'flex',
    alignItems: 'center',
    minWidth: '350px',
    padding: '16px',
  },
  popperHelperText: {
    fontSize: '18px',
  },
  popperHelperSubtitle: {
    maxWidth: '400px',
    padding: '10px 0',
  },
}));

type Props = {...WithAlert, hideAdvancedFields: boolean};
type OnboardingDialogType = {
  open: boolean,
  setOpen: boolean => void,
};
function OnboardingDialog(props: OnboardingDialogType) {
  const classes = useStyles();
  return (
    <Dialog
      classes={{paper: classes.onBoardingDialog}}
      maxWidth={'sm'}
      fullWidth={true}
      open={props.open}
      keepMounted
      onClose={() => props.setOpen(false)}
      aria-describedby="alert-dialog-slide-description">
      <DialogTitle classes={{root: classes.onBoardingDialogTitle}}>
        {'Welcome to Magma Host Portal'}
      </DialogTitle>
      <DialogContent classes={{root: classes.onBoardingDialogContent}}>
        <DialogContentText id="alert-dialog-slide-description">
          <Text variant="subtitle1">
            In this portal, you can add and edit organizations and its user.
            Follow these steps to get started:
          </Text>
          <List dense={true}>
            <ListItem disableGutters>
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <Text variant="subtitle1">Add an organization</Text>
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <Text variant="subtitle1">Add a user for the organization</Text>
            </ListItem>
            <ListItem disableGutters>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <Text variant="subtitle1">
                Log in to the organization portal with the user account you
                created
              </Text>
            </ListItem>
          </List>
        </DialogContentText>
      </DialogContent>
      <DialogActions classes={{root: classes.onBoardingDialogActions}}>
        <Button
          className={classes.onBoardingDialogButton}
          skin="comet"
          onClick={() => props.setOpen(false)}>
          Get Started
        </Button>
      </DialogActions>
    </Dialog>
  );
}

async function getUsers(
  organizations: Organization[],
  setUsers: (Array<?UserType>) => void,
  enqueueSnackbar: (
    msg: string,
    cfg: EnqueueSnackbarOptions,
  ) => ?(string | number),
) {
  const requests = organizations.map(async organization => {
    try {
      const response = await axios.get(
        `/host/organization/async/${organization.name}/users`,
      );
      return response.data;
    } catch (error) {
      enqueueSnackbar('Organization added successfully', {
        variant: 'success',
      });
    }
  });
  const organizationUsers = await Promise.all(requests);
  if (organizationUsers) {
    setUsers([...organizationUsers.flat()]);
  }
}

function Organizations(props: Props) {
  const classes = useStyles();
  const relativeUrl = useRelativeUrl();
  const {history} = useRouter();
  const [organizations, setOrganizations] = useState<?(Organization[])>(null);
  const [addingUserFor, setAddingUserFor] = useState<?Organization>(null);
  const [currRow, setCurrRow] = useState<OrganizationRowType>({});
  const [users, setUsers] = useState<Array<?UserType>>([]);
  const [showOnboardingDialog, setShowOnboardingDialog] = useState(false);
  const [showOrganizationDialog, setShowOrganizationDialog] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const enqueueSnackbar = useEnqueueSnackbar();
  const createButtonRef = React.useRef(null);
  const linkHelperRef = React.useRef(null);

  const [showPopperHelper, setShowPopperHelper] = useState(true);
  const [showPopperLinkHelper, setShowPopperLinkHelper] = useState(true);

  const {error, isLoading} = useAxios({
    url: '/host/organization/async',
    onResponse: useCallback(res => {
      setOrganizations(res.data.organizations);
      if (res.data.organizations.length < 3) {
        setShowOnboardingDialog(true);
      }
    }, []),
  });
  useEffect(() => {
    if (organizations?.length) {
      getUsers(organizations, setUsers, enqueueSnackbar);
    }
  }, [organizations, addingUserFor]);

  if (error || isLoading || !organizations) {
    return <LoadingFiller />;
  }

  const onDelete = org => {
    props
      .confirm('Are you sure you want to delete this organization?')
      .then(async confirm => {
        if (!confirm) return;
        await axios.delete(`/host/organization/async/${org.id}`);
        const newOrganizations = organizations.filter(
          organization => organization.id !== org.id,
        );
        setOrganizations([...newOrganizations]);
      });
  };

  type OrganizationRowType = {
    name: string,
    networks: Array<string>,
    portalLink: string,
    userNumber: number,
    id: number,
  };

  const organizationRows: Array<OrganizationRowType> = organizations.map(
    row => {
      return {
        name: row.name,
        networks: row.networkIDs,
        portalLink: `${row.name}`,
        userNumber: users?.filter(user => user?.organization === row.name)
          .length,
        id: row.id,
      };
    },
  );

  return (
    <div className={classes.container}>
      <Grid container>
        <Grid container justify="space-between">
          <Text variant="h3">Organizations</Text>
          <Button
            skin="comet"
            ref={createButtonRef}
            className={classes.addButton}
            variant="contained"
            onClick={() => {
              setShowOrganizationDialog(true);
            }}>
            Add Organizations
          </Button>
        </Grid>
        <Popper
          placement={'left-start'}
          open={
            !showOnboardingDialog &&
            !showOrganizationDialog &&
            organizations.length < 2 &&
            showPopperHelper
          }
          anchorEl={createButtonRef.current}>
          <Paper elevation={2} className={classes.paper}>
            <Grid container alignContent="center" justify="space-around">
              <span className={classes.popperHelperText}>
                Start by adding an organization
              </span>
              <CloseIcon onClick={() => setShowPopperHelper(false)} />
            </Grid>
          </Paper>
        </Popper>

        <Grid xs={12} className={classes.description}>
          <Text variant="body2">{ORGANIZATION_DESCRIPTION}</Text>
        </Grid>
        <OnboardingDialog
          open={showOnboardingDialog}
          setOpen={open => setShowOnboardingDialog(open)}
        />
        <Grid xs={12}>
          <ActionTable
            data={organizationRows}
            columns={[
              {
                title: '',
                field: '',
                width: '40px',
                editable: 'never',
                render: rowData => (
                  <Text variant="subtitle3">
                    {rowData.tableData?.id + 1 || ''}
                  </Text>
                ),
              },
              {title: 'Name', field: 'name'},
              {title: 'Accessible Networks', field: 'networks'},
              {
                title: 'Link to Organization Portal',
                field: 'portalLink',
                render: rowData => {
                  return (
                    <Link
                      variant="subtitle3"
                      ref={
                        organizations.length === rowData.tableData?.id + 1 &&
                        organizations.length < 3
                          ? linkHelperRef
                          : null
                      }>
                      link to org
                    </Link>
                  );
                },
              },
              {title: 'Number of Users', field: 'userNumber'},
            ]}
            handleCurrRow={(row: OrganizationRowType) => {
              setCurrRow(row);
            }}
            actions={[
              {
                icon: () => <PersonAdd />,
                tooltip: 'Add User',
                onClick: (event, row) => {
                  setAddingUserFor(row);
                  setAddUser(true);
                  setShowOrganizationDialog(true);
                },
              },
            ]}
            menuItems={[
              {
                name: 'View',
                handleFunc: () => {
                  history.push(relativeUrl(`/detail/${currRow.name}`));
                },
              },
              {
                name: 'Delete',
                handleFunc: () => {
                  onDelete(currRow);
                },
              },
            ]}
            options={{
              actionsColumnIndex: -1,
              pageSizeOptions: [5, 10],
              toolbar: false,
            }}
          />
          <Popper
            open={!showOnboardingDialog && showPopperLinkHelper}
            anchorEl={linkHelperRef.current}
            placement={'bottom-end'}>
            <Paper elevation={2} className={classes.paper}>
              <Grid
                container
                alignContent="center"
                justify="space-around"
                direction="row">
                <Grid>
                  <div>
                    <Grid container alignContent="center" direction="column">
                      <span className={classes.popperHelperText}>
                        Log into the Organization Portal
                      </span>
                      <span className={classes.popperHelperSubtitle}>
                        Add and manage the Network, Access Gateway, Subscribers,
                        and Policies for the organization.
                      </span>
                    </Grid>
                  </div>
                </Grid>
                <Grid>
                  <CloseIcon
                    onClick={() => {
                      setShowPopperLinkHelper(false);
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Popper>
        </Grid>
        <OrganizationDialog
          edit={false}
          hideAdvancedFields={props.hideAdvancedFields}
          organization={null}
          user={null}
          open={showOrganizationDialog}
          addUser={addUser}
          setAddUser={() => setAddUser(true)}
          onClose={() => {
            setShowOrganizationDialog(false);
            setAddUser(false);
          }}
          onCreateOrg={org => {
            let newOrg = null;
            axios
              .post('/master/organization/async', org)
              .then(() => {
                enqueueSnackbar('Organization added successfully', {
                  variant: 'success',
                });
                axios
                  .get(`/master/organization/async/${org?.name ?? ''}`)
                  .then(resp => {
                    newOrg = resp.data.organization;
                    if (newOrg) {
                      setOrganizations([...organizations, newOrg]);
                      setAddingUserFor(newOrg);
                    }
                  });
              })
              .catch(error => {
                setAddUser(false);
                history.push(relativeUrl(''));
                enqueueSnackbar(error?.response?.data?.error || error, {
                  variant: 'error',
                });
              });
          }}
          onCreateUser={user => {
            axios
              .post(
                `/master/organization/async/${
                  addingUserFor?.name || ''
                }/add_user`,
                user,
              )
              .then(() => {
                enqueueSnackbar('User added successfully', {
                  variant: 'success',
                });
                setAddingUserFor(null);
                history.push(relativeUrl(''));
              })
              .catch(error => {
                enqueueSnackbar(error?.response?.data?.error || error, {
                  variant: 'error',
                });
              });
          }}
        />
      </Grid>
    </div>
  );
}

export default withAlert(Organizations);
