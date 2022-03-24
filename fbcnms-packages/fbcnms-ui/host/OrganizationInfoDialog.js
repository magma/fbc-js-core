/**
 * Copyright 2020 The Magma Authors.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @flow strict-local
 * @format
 */
import {getProjectTabs as getAllProjectTabs} from '@fbcnms/projects/projects';
import type {DialogProps} from './OrganizationDialog';

import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import Button from '@fbcnms/ui/components/design-system/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Collapse from '@material-ui/core/Collapse';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import React from 'react';
import Select from '@material-ui/core/Select';

import {AltFormField} from '../components/design-system/FormField/FormField';
import {useState} from 'react';

const ENABLE_ALL_NETWORKS_HELPER =
  'By checking this, the organization will have access to all existing and future networks.';

/**
 * Create Organization Tab
 * This component displays a form used to create an organization
 */
export default function (props: DialogProps) {
  const {
    organization,
    allNetworks,
    shouldEnableAllNetworks,
    setShouldEnableAllNetworks,
    edit,
    hideAdvancedFields,
  } = props;
  const [open, setOpen] = useState(false);
  const allTabs = props.getProjectTabs
    ? props.getProjectTabs()
    : getAllProjectTabs();

  return (
    <List>
      {props.error && (
        <AltFormField label={''}>
          <FormLabel error>{props.error}</FormLabel>
        </AltFormField>
      )}
      <AltFormField disableGutters label={'Organization Name'}>
        <OutlinedInput
          disabled={edit}
          data-testid="name"
          placeholder="Organization Name"
          fullWidth={true}
          value={organization.name}
          onChange={({target}) => {
            props.onOrganizationChange({...organization, name: target.value});
          }}
        />
      </AltFormField>
      {!hideAdvancedFields && (
        <>
          <AltFormField disableGutters label={'Accessible Tabs'}>
            <Select
              fullWidth={true}
              variant={'outlined'}
              multiple={true}
              renderValue={selected => selected.join(', ')}
              value={Array.from(organization.tabs || [])}
              onChange={({target}) => {
                props.onOrganizationChange({
                  ...organization,
                  // $FlowIgnore: value guaranteed to match the string literals
                  tabs: [...target.value],
                });
              }}
              input={<OutlinedInput id="direction" />}>
              {allTabs.map(tab => (
                <MenuItem key={tab.id} value={tab.id}>
                  <ListItemText primary={tab.name} />
                </MenuItem>
              ))}
            </Select>
          </AltFormField>
        </>
      )}
      <ListItem disableGutters>
        <Button variant="text" onClick={() => setOpen(!open)}>
          Advanced Settings
        </Button>
        <ArrowDropDown />
      </ListItem>
      <Collapse in={open}>
        <AltFormField
          disableGutters
          label={'Accessible Networks'}
          subLabel={'The networks that the organization have access to'}>
          <Select
            fullWidth={true}
            variant={'outlined'}
            multiple={true}
            renderValue={selected => selected.join(', ')}
            value={organization.networkIDs || []}
            onChange={({target}) => {
              props.onOrganizationChange({
                ...organization,
                networkIDs: [...target.value],
              });
            }}
            input={<OutlinedInput id="direction" />}>
            {allNetworks.map(network => (
              <MenuItem key={network} value={network}>
                <ListItemText primary={network} />
              </MenuItem>
            ))}
          </Select>
        </AltFormField>
        <FormControlLabel
          disableGutters
          label={'Give this organization access to all networks'}
          control={
            <Checkbox
              checked={shouldEnableAllNetworks}
              onChange={() =>
                setShouldEnableAllNetworks(!shouldEnableAllNetworks)
              }
            />
          }
        />
        <FormHelperText>{ENABLE_ALL_NETWORKS_HELPER}</FormHelperText>

        {!hideAdvancedFields && (
          <>
            <AltFormField disableGutters label={'CSV Charset'}>
              <OutlinedInput
                data-testid="csvCharset"
                placeholder="CSV Charset (default: utf-8)"
                fullWidth={true}
                value={organization.csvCharset}
                onChange={({target}) => {
                  props.onOrganizationChange({
                    ...organization,
                    csvCharset: target.value,
                  });
                }}
              />
            </AltFormField>
            <AltFormField disableGutters label={'Single Sign-On'}>
              <Select
                fullWidth={true}
                variant={'outlined'}
                value={organization.ssoSelectedType || 'none'}
                onChange={({target}) => {
                  props.onOrganizationChange({
                    ...organization,
                    // $FlowIgnore: value guaranteed to match the string literals
                    ssoSelectedType: target.value,
                  });
                }}
                input={<OutlinedInput id="direction" />}>
                <MenuItem key={'none'} value={'none'}>
                  <ListItemText primary={'Disabled'} />
                </MenuItem>
                <MenuItem key={'oidc'} value={'oidc'}>
                  <ListItemText primary={'OpenID Connect'} />
                </MenuItem>
                <MenuItem key={'saml'} value={'saml'}>
                  <ListItemText primary={'SAML'} />
                </MenuItem>
              </Select>
            </AltFormField>

            {organization.ssoSelectedType === 'saml' ? (
              <>
                <AltFormField disableGutters label={'Issuer'}>
                  <OutlinedInput
                    data-testid="issuer"
                    placeholder="Issuer"
                    fullWidth={true}
                    value={organization.ssoIssuer}
                    onChange={({target}) => {
                      props.onOrganizationChange({
                        ...organization,
                        ssoIssuer: target.value,
                      });
                    }}
                  />
                </AltFormField>

                <AltFormField disableGutters label={'Entrypoint'}>
                  <OutlinedInput
                    data-testid="entrypoint"
                    placeholder="Entrypoint"
                    fullWidth={true}
                    value={organization.ssoEntrypoint}
                    onChange={({target}) => {
                      props.onOrganizationChange({
                        ...organization,
                        ssoEntrypoint: target.value,
                      });
                    }}
                  />
                </AltFormField>

                <AltFormField disableGutters label={'Certificate'}>
                  <OutlinedInput
                    data-testid="Certificate"
                    placeholder="Certificate"
                    fullWidth={true}
                    value={organization.ssoCert}
                    onChange={({target}) => {
                      props.onOrganizationChange({
                        ...organization,
                        ssoCert: target.value,
                      });
                    }}
                  />
                </AltFormField>
              </>
            ) : null}
            {organization.ssoSelectedType === 'oidc' ? (
              <>
                <AltFormField disableGutters label={'Client ID'}>
                  <OutlinedInput
                    data-testid="ClientID"
                    placeholder="Client ID"
                    fullWidth={true}
                    value={organization.ssoOidcClientID}
                    onChange={({target}) => {
                      props.onOrganizationChange({
                        ...organization,
                        ssoOidcClientID: target.value,
                      });
                    }}
                  />
                </AltFormField>

                <AltFormField disableGutters label={'Client Secret'}>
                  <OutlinedInput
                    data-testid="ClientSecret"
                    placeholder="ClientSecret"
                    fullWidth={true}
                    value={organization.ssoOidcClientSecret}
                    onChange={({target}) => {
                      props.onOrganizationChange({
                        ...organization,
                        ssoOidcClientSecret: target.value,
                      });
                    }}
                  />
                </AltFormField>

                <AltFormField disableGutters label={'Configuration URL'}>
                  <OutlinedInput
                    data-testid="Configuration URL"
                    placeholder="Configuration URL"
                    fullWidth={true}
                    value={organization.ssoOidcConfigurationURL}
                    onChange={({target}) => {
                      props.onOrganizationChange({
                        ...organization,
                        ssoOidcConfigurationURL: target.value,
                      });
                    }}
                  />
                </AltFormField>
              </>
            ) : null}
          </>
        )}
      </Collapse>
    </List>
  );
}
