import React, { PureComponent } from 'react';
import { Layout } from 'antd';
import pathToRegexp from 'path-to-regexp';
import classNames from 'classnames';
import { Link } from 'dva/router';
import './index.less';
import BaseMenu, { getMenuMatches } from './BaseMenu';
import { urlToList } from '@/components/_utils/pathTools';

const { Sider } = Layout;

/**
 * 获得菜单子节点
 * @memberof SiderMenu
 */
const getDefaultCollapsedSubMenus = props => {
  const {
    location: { pathname },
    flatMenuKeys,
  } = props;
  return urlToList(pathname)
    .map(item => getMenuMatches(flatMenuKeys, item)[0])
    .filter(item => item);
};

/**
 * Recursively flatten the data
 * [{path:string},{path:string}] => {path,path2}
 * @param  menu
 */
export const getFlatMenuKeys = (menu = []) =>
  menu.reduce((keys, item) => {
    keys.push(item.path);
    if (item.children) {
      return keys.concat(getFlatMenuKeys(item.children));
    }
    return keys;
  }, []);

/**
 * Find all matched menu keys based on paths
 * @param  flatMenuKeys: [/abc, /abc/:id, /abc/:id/info]
 * @param  paths: [/abc, /abc/11, /abc/11/info]
 */
export const getMenuMatchKeys = (flatMenuKeys, paths) =>
  paths.reduce(
    (matchKeys, path) =>
      matchKeys.concat(flatMenuKeys.filter(item => pathToRegexp(item).test(path))),
    []
  );

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.flatMenuKeys = getFlatMenuKeys(props.menuData);
    this.state = {
      openKeys: getDefaultCollapsedSubMenus(props),
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { pathname } = state;
    if (props.location.pathname !== pathname) {
      return {
        pathname: props.location.pathname,
        openKeys: getDefaultCollapsedSubMenus(props),
      };
    }
    if (props.flatMenuKeys !== state.flatMenuKeys) {
      return {
        flatMenuKeys: props.flatMenuKeys,
        openKeys: getDefaultCollapsedSubMenus(props)
      }
    }
    return null;
  }

  isMainMenu = key => {
    const { menuData } = this.props;
    return menuData.some(item => {
      if (key) {
        return item.key === key || item.path === key;
      }
      return false;
    });
  };

  handleOpenChange = openKeys => {
    const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [openKeys.pop()] : [...openKeys],
    });
  };

  render() {
    const { logo, collapsed, setting } = this.props;
    const { openKeys } = this.state;
    const { fixSiderbar, navTheme } = setting;
    const defaultProps = collapsed ? {} : { openKeys };
    const siderClassName = classNames('ysynet-sider', {
      fixSiderbar: fixSiderbar,
      light: navTheme === 'light',
    });
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        // onCollapse={onCollapse}
        width={200}
        theme={navTheme}
        className={siderClassName}
      >
        <div className={'ysynet-sidermenu-logo'} id="logo">
          <Link to="/">
            <img src={logo} alt="logo" />
            <h1>CHS-DRG</h1>
          </Link>
        </div>
        {
          this.props.children
            ? this.props.children
            : <BaseMenu
              {...this.props}
              mode="inline"
              handleOpenChange={this.handleOpenChange}
              onOpenChange={this.handleOpenChange}
              style={{ padding: '16px 0 64px', width: '100%', overflowX: 'hidden' }}
              {...defaultProps}
            />
        }
      </Sider>
    );
  }
}