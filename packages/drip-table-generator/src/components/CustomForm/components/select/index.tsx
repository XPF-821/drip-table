/**
 * This file is part of the jd-mkt5 launch.
 * @link     : https://ace.jd.com/
 * @author   : qianjing29 (qianjing29@jd.com)
 * @modifier : qianjing29 (qianjing29@jd.com)
 * @copyright: Copyright (c) 2020 JD Network Technology Co., Ltd.
 */
import React from 'react';
import { Select } from 'antd';
import { DTGComponentPropertySchema } from '@/typing';

type SelectProps = React.ComponentProps<typeof Select>;
type SelectValueType = SelectProps['value'];
type SelectOptionType = NonNullable<SelectProps['options']>[number];

interface Props {
  schema: DTGComponentPropertySchema;
  value?: SelectValueType;
  onChange?: (value: SelectValueType) => void;
  onValidate?: (errorMessage: string) => void;
}

export default class SelectComponent extends React.PureComponent<Props> {
  private get formattedValue() {
    const uiProps = this.props.schema['ui:props'] || {};
    if ((uiProps.mode === 'multiple' || uiProps.mode === 'tags') && !Array.isArray(this.props.value)) {
      return this.props.value ? [this.props.value] : [];
    }
    return this.props.value;
  }

  public render() {
    const config = this.props.schema;
    const uiProps = this.props.schema['ui:props'] || {};

    return (
      <Select
        {...uiProps}
        showSearch
        allowClear={uiProps.allowClear as boolean}
        style={{ width: 420, ...uiProps.style }}
        mode={uiProps.mode as 'multiple' | 'tags'}
        defaultValue={config.default as SelectValueType}
        value={this.formattedValue as SelectValueType}
        options={(uiProps.options as SelectOptionType[] || []).map(v => ({ label: v.label, value: v.value }))}
        onChange={(value) => {
          this.props.onChange?.(value);
        }}
      />
    );
  }
}
