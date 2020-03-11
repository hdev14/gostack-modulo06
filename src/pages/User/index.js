import React, {Component} from 'react';
import {ActivityIndicator} from 'react-native';
import api from '../../services/api';

// Styles
import Container from '../../styles/components/Container';
import Stars from '../../styles/components/List';
import Avatar from '../../styles/components/Avatar';
import Name from '../../styles/components/Name';
import Bio from '../../styles/components/Bio';

import {Header, Starred, Info, Title, Author} from './styles';

export default class User extends Component {
  static navigationOptions = ({route}) => ({
    title: route.params.user.name,
  });

  state = {
    stars: [],
    login: '',
    loading: false,
    page: {
      next: 1,
      least: 1,
    },
  };

  async componentDidMount() {
    const {user} = this.props.route.params;

    this.setState({loading: true});

    const response = await api.get(`/users/${user.login}/starred?per_page=5`);

    const page = this.getPages(response.headers.link);

    this.setState({
      stars: response.data,
      login: user.login,
      loading: false,
      page,
    });
  }

  loadMore = async () => {
    const {stars, login, page} = this.state;

    if (page.next > page.last) {
      return;
    }

    const response = await api.get(
      `/users/${login}/starred?per_page=5&page=${page.next}`,
    );
    console.tron.log(this.getPages(response.headers.link));
    this.setState({
      stars: [...stars, ...response.data],
      page: {
        next: page.next + 1,
        last: page.last,
      },
    });
  };

  getPages(link) {
    console.tron.log(link);
    const [linkNextPage, linkLastPage] = link.split(',');
    const regexpPage = RegExp(/&page=(\d+).*$/);
    const next = Number(linkNextPage.match(regexpPage)[1]);
    const last = Number(linkLastPage.match(regexpPage)[1]);

    return {next, last};
  }

  render() {
    const {user} = this.props.route.params;
    const {stars, loading} = this.state;

    return (
      <Container>
        <Header>
          <Avatar
            source={{uri: user.avatar}}
            size={{height: '100px', width: '100px'}}
            borderRadius="50px"
          />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <ActivityIndicator color="#ddd" size={100} style={{marginTop: 100}} />
        ) : (
          <Stars
            data={stars}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            keyExtractor={star => String(star.id)}
            renderItem={({item}) => (
              <Starred>
                <Avatar
                  source={{uri: item.owner.avatar_url}}
                  size={{height: '42px', width: '42px'}}
                  borderRadius="21px"
                />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
