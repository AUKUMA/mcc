import React, { useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Link, Switch, Route } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  BookOutlined,
  PlusSquareOutlined,
  SettingOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { RootState } from '../store';
import {
  changeNumColumns,
  setFilter,
  setSeriesBannerUrl,
} from '../features/library/actions';
import { setStatusText } from '../features/statusbar/actions';
import SeriesDetails from './SeriesDetails';
import Search from './Search';
import StatusBar from './StatusBar';
import styles from './DashboardPage.css';
import routes from '../constants/routes.json';
import {
  importSeries,
  loadChapterList,
  loadSeries,
  loadSeriesList,
  reloadSeriesList,
} from '../features/library/utils';
import * as database from '../util/db';
import Settings from './Settings';
import About from './About';
import Library from './Library';
import { Series } from '../models/types';

const { Content, Sider } = Layout;

const mapState = (state: RootState) => ({
  seriesList: state.library.seriesList,
  series: state.library.series,
  chapterList: state.library.chapterList,
  userTags: state.library.userTags,
  columns: state.library.columns,
  filter: state.library.filter,
  seriesBannerUrl: state.library.seriesBannerUrl,
  completedStartReload: state.library.completedStartReload,
  refreshOnStart: state.settings.refreshOnStart,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatch = (dispatch: any) => ({
  changeNumColumns: (columns: number) => dispatch(changeNumColumns(columns)),
  setStatusText: (text?: string) => dispatch(setStatusText(text)),
  loadSeriesList: () => loadSeriesList(dispatch),
  loadSeries: (id: number) => loadSeries(dispatch, id),
  loadChapterList: (seriesId: number) => loadChapterList(dispatch, seriesId),
  reloadSeriesList: (seriesList: Series[], callback?: () => void) =>
    reloadSeriesList(dispatch, seriesList, callback),
  importSeries: (series: Series) => importSeries(dispatch, series),
  setFilter: (filter: string) => dispatch(setFilter(filter)),
  setSeriesBannerUrl: (seriesBannerUrl: string | null) =>
    dispatch(setSeriesBannerUrl(seriesBannerUrl)),
});

const connector = connect(mapState, mapDispatch);
type PropsFromRedux = ConnectedProps<typeof connector>;

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsFromRedux & {};

const DashboardPage: React.FC<Props> = (props: Props) => {
  useEffect(() => {
    database
      .init()
      // eslint-disable-next-line promise/always-return
      .then(() => {
        props.loadSeriesList();
      })
      .catch((error) => console.log(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      props.refreshOnStart &&
      !props.completedStartReload &&
      props.seriesList.length > 0
    ) {
      props.reloadSeriesList(props.seriesList, props.loadSeriesList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.seriesList]);

  return (
    <Layout className={styles.pageLayout}>
      <Sider className={styles.sider}>
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<BookOutlined />}>
            <Link to={routes.LIBRARY} onClick={() => props.loadSeriesList()}>
              Library
            </Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<PlusSquareOutlined />}>
            <Link to={routes.SEARCH}>Add Series</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<SettingOutlined />}>
            <Link to={routes.SETTINGS}>Settings</Link>
          </Menu.Item>
          <Menu.Item key="4" icon={<InfoCircleOutlined />}>
            <Link to={routes.ABOUT}>About</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className={`site-layout ${styles.contentLayout}`}>
        <Content className={styles.content}>
          <Switch>
            <Route path={`${routes.SERIES}/:id`} exact>
              <SeriesDetails />
            </Route>
            <Route path={routes.SETTINGS} exact>
              <Settings />
            </Route>
            <Route path={routes.ABOUT} exact>
              <About />
            </Route>
            <Route path={routes.SEARCH} exact>
              <Search importSeries={props.importSeries} />
            </Route>
            <Route path={routes.LIBRARY}>
              <Library />
            </Route>
          </Switch>
        </Content>
      </Layout>
      <StatusBar />
    </Layout>
  );
};

export default connector(DashboardPage);
