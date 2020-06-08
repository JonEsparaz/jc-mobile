import { Content, Left, Right, Body, StyleProvider, Container, Card, CardItem, Button } from 'native-base';
import { Text } from 'react-native'
import * as React from 'react';

import getTheme from '../../native-base-theme/components';
import { Image } from 'react-native'
import { constants } from '../../src/constants'
import JCComponent from '../JCComponent/JCComponent';

interface Props {
  navigation: any
}

export default class MyConversations extends JCComponent<Props> {
  constructor(props: Props) {
    super(props);
  }
  openConversation(): void {
    console.log("Navigate to conversationScreen")
    this.props.navigation.navigate("ConversationScreen");
  }

  render(): React.ReactNode {

    const items =
      [
        {
          "id": "121",
          "name": "Dave Smith",
          "role": "Youth Pastor in Calgary Area",
          "image": "../../assets/profile-placeholder.png",
          "message": "Hi community! We’re looking for a good resource for our sunday school kids program. Could you share your thoughs and resources if possible? Thank you!"
        },
        {
          "id": "122",
          "name": "Jason Petrovic",
          "role": "Communications Manager",
          "image": "../../assets/profile-placeholder.png",
          "message": "Everyone who is interested in joining our youth summer workshop with pastor @Zachary Soreff starting next weekend, this is last call for your signups! "
        },
        {
          "id": "123",
          "name": "Zachary Soreff",
          "role": "Community Pastor in Calgary Area",
          "image": "../../assets/profile-placeholder.png",
          "message": "Our team just published latest addition to the summer kids camps curriculum. Let us know any feedback - http://jesuscollective.com/345663"
        },
      ]
    if (!constants["SETTING_ISVISIBLE_conversation"])
      return null
    else
      return (
        <StyleProvider style={getTheme()}>

          <Container style={{ width: "100%", flexDirection: 'column', alignItems: 'flex-start', minHeight: 725, marginTop: 50 }} >
            <Button transparent onPress={() => { this.openConversation() }}><Text style={this.styles.style.fontConnectWith}>Latest Conversations</Text></Button>
            <Content>
              {items.map((item) => {
                return (
                  <Card key={item.id} style={this.styles.style.conversationCard}>
                    <CardItem style={{ paddingTop: 28, }}>
                      <Left>
                        <Image style={{ margin: 0, padding: 0, width: 40, height: 45 }} source={require("../../assets/profile-placeholder.png")} />
                        <Body>
                          <Text style={this.styles.style.fontConnectWithName}>{item.name}</Text>
                          <Text style={this.styles.style.fontConnectWithRole}>{item.role}</Text>
                        </Body>
                      </Left>
                      <Right>
                        <Button bordered style={this.styles.style.connectWithSliderButton} onPress={() => { this.openConversation() }}><Text style={this.styles.style.fontStartConversation}>Open</Text></Button>
                      </Right>
                    </CardItem>
                    <CardItem>
                      <Text style={this.styles.style.fontConnectWithRole}>{item.message}</Text>
                    </CardItem>
                  </Card>)
              })}
            </Content>

          </Container>
        </StyleProvider>

      )
  }
}