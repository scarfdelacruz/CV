/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';

import injectReducer from 'utils/injectReducer';
import injectSaga from 'utils/injectSaga';
import {
  makeSelectRepos,
  makeSelectLoading,
  makeSelectError,
} from 'containers/App/selectors';
import H2 from 'components/H2';
// import ReposList from 'components/ReposList';
import CircularProgress from '@material-ui/core/CircularProgress';
import AtPrefix from './AtPrefix';
import CenteredSection from './CenteredSection';
import Form from './Form';
import Input from './Input';
import Section from './Section';
import messages from './messages';
import { loadRepos } from '../App/actions';
import { changeUsername } from './actions';
import { makeSelectUsername } from './selectors';
import reducer from './reducer';
import saga from './saga';

export class HomePage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this); // bind function once
    this.state = {
      data: [],
      per: 3,
      page: 1,
      scrolling: false,
      myloading: true,
      nodatabool: false,
    };
  }

  componentWillMount() {
    window.addEventListener('scroll', this.handleScroll, false);
    // window.addEventListener('scroll', this.onScroll, false);
    this.loadUser();
    const that = this;
    function foo() {
      that.setState({
        myloading: false,
      });
    }
    setTimeout(foo, 3000);
  }

  componentDidMount() {
    if (this.props.username && this.props.username.trim().length > 0) {
      this.props.onSubmitForm();
    }
  }

  componentWillUnmount() {
    // you need to unbind the same listener that was binded.
    window.removeEventListener('scroll', this.handleScroll, false);
  }

  loadUser() {
    const { per, page, data } = this.state;
    const url = `https://reqres.in/api/users?per_page=${per}&page=${page}`;
    const that = this;
    function callApi() {
      fetch(url)
        .then(response => response.json())
        .then(json => {
          if (json.data.length === 0) {
            that.setState({
              nodatabool: true,
            });
          }
          that.setState({
            data: [...data, ...json.data],
            scrolling: true,
          });
        });
    }
    setTimeout(callApi, 500);
  }

  loadMore() {
    if (this.state.scrolling === true && this.state.nodatabool === false) {
      this.setState(
        prevState => ({
          page: prevState.page + 1,
          scrolling: false,
        }),
        this.loadUser,
      );
    }
  }

  handleScroll() {
    const container = document.querySelector('#test');
    const lastLi = container.querySelector('ul.container > li:last-child');
    if (lastLi !== null) {
      const lastLiOffset = lastLi.offsetTop + lastLi.clientHeight;
      const pageOffset = window.pageYOffset + window.innerHeight;
      if (pageOffset > lastLiOffset) {
        this.loadMore();
      }
    }
  }

  render() {
    // const { loading, error, repos } = this.props;
    const { myloading, nodatabool } = this.state;
    // const reposListProps = {
    //   loading,
    //   error,
    //   repos,
    // };
    // console.log('ReposList', reposListProps);
    return (
      <article>
        <Helmet>
          <title>Paulo Dela Cruz</title>
          <meta
            name="description"
            content="A React.js Boilerplate application homepage"
          />
        </Helmet>
        <div>
          <CenteredSection>
            <H2>
              <FormattedMessage {...messages.startProjectHeader} />
            </H2>
            <p>
              <FormattedMessage {...messages.startProjectMessage} />
            </p>
          </CenteredSection>
          <Section>
            <H2>
              <FormattedMessage {...messages.list} />
            </H2>
            {/* <Form onSubmit={this.props.onSubmitForm}>
              <label htmlFor="username">
                <FormattedMessage {...messages.trymeMessage} />
                <AtPrefix>
                  <FormattedMessage {...messages.trymeAtPrefix} />
                </AtPrefix>
                <Input
                  id="username"
                  type="text"
                  placeholder="mxstbr"
                  value={this.props.username}
                  onChange={this.props.onChangeUsername}
                />
              </label>
            </Form> */}
            {/* <ReposList {...reposListProps} /> */}
            <div id="test">
              {myloading === false ? (
                <div>
                  <ul className="container">
                    {this.state.data.map(data => (
                      <li key={data.id}>
                        <div>
                          <div>
                            <img alt="" src={data.avatar} />
                          </div>
                          <div>{data.first_name}</div>
                          <div>{data.last_name}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div>
                    {nodatabool === false ? (
                      <CircularProgress />
                    ) : (
                      <p>No More Available User</p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <CircularProgress />
                </div>
              )}
            </div>
          </Section>
        </div>
      </article>
    );
  }
}

HomePage.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onSubmitForm: PropTypes.func,
  username: PropTypes.string,
  onChangeUsername: PropTypes.func,
};

export function mapDispatchToProps(dispatch) {
  return {
    onChangeUsername: evt => dispatch(changeUsername(evt.target.value)),
    onSubmitForm: evt => {
      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
      dispatch(loadRepos());
    },
  };
}

const mapStateToProps = createStructuredSelector({
  repos: makeSelectRepos(),
  username: makeSelectUsername(),
  loading: makeSelectLoading(),
  error: makeSelectError(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'home', reducer });
const withSaga = injectSaga({ key: 'home', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(HomePage);
