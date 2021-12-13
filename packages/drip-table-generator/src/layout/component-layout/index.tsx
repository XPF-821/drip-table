/**
 * This file is part of the drip-table project.
 * @link     : https://drip-table.jd.com/
 * @author   : helloqian12138 (johnhello12138@163.com)
 * @modifier : helloqian12138 (johnhello12138@163.com)
 * @copyright: Copyright (c) 2020 JD Network Technology Co., Ltd.
 */

import React from 'react';
import chunk from 'lodash/chunk';
import { DripTableProps, DripTableRecordTypeBase } from 'drip-table';

import { globalActions, GlobalStore } from '@/store';
import { DripTableComponentConfig } from '@/typing';
import { mockId } from '@/utils';
import RichText from '@/components/RichText';
import components from '@/table-components';

import { defaultComponentIcon } from '../configs';

import styles from './index.module.less';

interface Props {
  width: React.CSSProperties['width'];
  customComponentPanel: {
    mode: 'add' | 'replace';
    components: DripTableComponentConfig[];
  } | undefined;
}

const ComponentLayout = (props: Props & { store: GlobalStore }) => {
  const getGroups = () => {
    let groups = [
      '基础组件',
      '自定义组件',
    ];
    if (props.customComponentPanel) {
      const customGroups = props.customComponentPanel.components.map(item => item.group);
      if (props.customComponentPanel.mode === 'add') {
        const theSet = new Set([...groups, ...customGroups]);
        groups = [...theSet];
      } else {
        groups = [...customGroups];
      }
    }
    return groups;
  };

  const getComponents = (groupName) => {
    let componentsToUse = components;
    if (props.customComponentPanel) {
      const customComponents = props.customComponentPanel.components;
      componentsToUse = props.customComponentPanel.mode === 'add' ? [...components, ...customComponents] : [...customComponents];
    }
    return [...componentsToUse].filter(item => item.group === groupName);
  };

  const [state, actions] = props.store;
  const store = { state, setState: actions };

  const componentCell = (item: DripTableComponentConfig) => (
    <div
      className={styles['component-container']}
      onClick={() => {
        const columnSchema: DripTableProps<DripTableRecordTypeBase>['schema']['columns'][number] & { $id: string; group: string } = {
          $id: `${item.$id}_${mockId()}`,
          dataIndex: '',
          title: item.title,
          group: '',
          width: void 0,
          description: '',
          'ui:type': item['ui:type'],
          'ui:props': {},
          type: item.type || 'null',
        };
        item.attrSchema.forEach((schema) => {
          if (typeof schema.default !== 'undefined') {
            if (schema.name.startsWith('ui:props')) {
              const key = schema.name.replace('ui:props.', '');
              columnSchema['ui:props'][key] = schema.default;
            } else {
              columnSchema[schema.name] = schema.default;
            }
          }
        });
        state.columns.push({
          ...columnSchema,
          key: state.columns.length + 1, // +1 是因为从1排序的
          sort: state.columns.length + 1,
        });
        globalActions.editColumns(store);
      }}
    >
      <div>
        { item.icon && item.icon.startsWith('base64')
          ? <div className={styles['component-icon']} style={{ backgroundImage: `url(${item.icon})` }} />
          : <RichText html={item.icon || defaultComponentIcon} wrapperClass={styles['component-icon']} /> }
        <span>{ item.title }</span>
      </div>
    </div>
  );

  return (
    <div className={styles['layout-left-wrapper']} style={{ width: props.width }}>
      <div className={styles['layout-left-title']}>组件区</div>
      <table style={{ width: '100%' }}>
        { getGroups().map((name, index) => (
          <React.Fragment key={index}>
            <thead key={`thead.${index}`}>
              <tr><td colSpan={2}><div className={styles['group-title']}>{ name }</div></td></tr>
            </thead>
            <tbody key={`tbody.${index}`}>
              { chunk(getComponents(name), 2).map((items, i, componentsInLayout) => (
                <React.Fragment key={i}>
                  {
                      i === 0
                        ? (
                          <tr key={`groupItem.group.${index}.${i}.gutter.before`}>
                            <td colSpan={2}>
                              <div className={styles['components-line__gutter']} />
                            </td>
                          </tr>
                        )
                        : null
                    }
                  <tr key={`groupItem.group.${index}.${i}`} className={styles['components-line']}>
                    { items.map(item => <td key={item.$id}>{ componentCell(item) }</td>) }
                  </tr>
                  {
                      i === componentsInLayout.length - 1
                        ? (
                          <tr key={`groupItem.group.${index}.${i}.gutter.after`}>
                            <td colSpan={2}>
                              <div className={styles['components-line__gutter']} />
                            </td>
                          </tr>
                        )
                        : null
                    }
                </React.Fragment>
              )) }
            </tbody>
          </React.Fragment>
        )) }
      </table>
    </div>
  );
};

export default ComponentLayout;
