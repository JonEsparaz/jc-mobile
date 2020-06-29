﻿import React from 'react';
import Amplify from 'aws-amplify';
import awsConfig from '../../src/aws-exports';
import Header from '../../components/Header/Header'
import MyProfile from '../../components/MyProfile/MyProfile'
import { Container } from 'native-base';
import JCComponent, { JCState } from '../../components/JCComponent/JCComponent';

Amplify.configure(awsConfig);


interface Props {
  navigation: any
  route: any
}
interface State extends JCState {
  loadId: string
  createNew: boolean
  canSave: boolean
  isEditable: boolean


}
export default class ProfileScreen extends JCComponent<Props, State>{
  constructor(props: Props) {
    super(props);

    this.state = {
      ...this.getInitialState(),
      loadId: props.route.params.id,
      createNew: false,
      canSave: true,
      isEditable: true
    }

  }
  render(): React.ReactNode {
    //    const { navigate } = this.props.navigation;
    return (
      <Container data-testid="profile">
        <Header title="Profile" navigation={this.props.navigation} />
        <MyProfile loadId={this.state.loadId} navigation={this.props.navigation} />
      </Container>
    );
  }
}