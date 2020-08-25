/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {TextPairingContainerProps} from '../helpers/TextPairingContainer';

import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import React from 'react';
import TextPairingContainer from '../helpers/TextPairingContainer';
import classNames from 'classnames';
import symphony from '@fbcsymphony/design-system/theme/symphony';
import {makeStyles} from '@material-ui/styles';
import {useFormElementContext} from '../Form/FormElementContext';
import {useMemo} from 'react';

const useStyles = makeStyles(_theme => ({
  root: {
    width: '24px',
    height: '24px',
    '&:not($disabled)': {
      cursor: 'pointer',
      '&:hover': {
        '& $selection, & $noSelection': {
          fill: symphony.palette.B700,
        },
      },
      '& $noSelection': {
        fill: symphony.palette.D200,
      },
      '& $selection': {
        fill: symphony.palette.primary,
      },
    },
  },
  disabled: {
    '& $noSelection, & $selection': {
      fill: symphony.palette.disabled,
    },
  },
  selection: {},
  noSelection: {},
}));

export type SelectionType = 'checked' | 'unchecked';

type Props = $ReadOnly<{|
  checked: boolean,
  indeterminate?: boolean,
  disabled?: ?boolean,
  onChange?: (selection: SelectionType) => void,
  onClick?: ?(SyntheticMouseEvent<Element>) => void,
  ...TextPairingContainerProps,
|}>;

const Checkbox = (props: Props) => {
  const {
    checked,
    indeterminate,
    onChange,
    onClick,
    disabled: propDisabled = false,
    ...TextPairingContainerProps
  } = props;
  const classes = useStyles();
  const CheckboxIcon = indeterminate
    ? IndeterminateCheckBoxIcon
    : checked
    ? CheckBoxIcon
    : CheckBoxOutlineBlankIcon;

  const {disabled: contextDisabled} = useFormElementContext();
  const disabled = useMemo(
    () => (propDisabled ? propDisabled : contextDisabled),
    [contextDisabled, propDisabled],
  );

  return (
    <TextPairingContainer {...TextPairingContainerProps} disabled={disabled}>
      <div
        className={classNames(classes.root, {
          [classes.disabled]: disabled,
        })}
        onClick={e => {
          if (disabled) {
            return;
          }
          if (onChange) {
            onChange(
              indeterminate ? 'unchecked' : checked ? 'unchecked' : 'checked',
            );
          }
          if (onClick) {
            onClick(e);
          }
        }}>
        <CheckboxIcon
          className={classNames({
            [classes.selection]: checked || indeterminate,
            [classes.noSelection]: !checked && !indeterminate,
          })}
        />
      </div>
    </TextPairingContainer>
  );
};

Checkbox.defaultProps = {
  checked: false,
  indeterminate: false,
};

export default Checkbox;
