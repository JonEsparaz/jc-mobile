import { View, Form, Label, Content, Picker, Item, Input } from 'native-base';
import { Text, Image, TouchableOpacity } from 'react-native'
import * as React from 'react';
import * as queries from '../../src/graphql/queries';
import * as mutations from '../../src/graphql/mutations';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import GRAPHQL_AUTH_MODE from 'aws-amplify-react-native';
import { GraphQLResult } from '@aws-amplify/api/lib/types';
import ProfileImage from '../ProfileImage/ProfileImage';
import { Auth } from 'aws-amplify';
import { GetOrganizationQuery, CreateOrganizationInput } from '../../src/API'
import Amplify from 'aws-amplify'
import awsconfig from '../../src/aws-exports';
import Validate from '../Validate/Validate';
import moment from 'moment';
import JCButton, { ButtonTypes } from '../Forms/JCButton'
import EditableLocation from '../Forms/EditableLocation'
import MyMap from '../MyMap/MyMap'
import EditableText from '../Forms/EditableText';
//import { AlertConfigInput } from '../../src/API'
import { numberOfEmployees, sundayAttendance, orgTypesChurches, orgTypesNonChurch } from '../MyProfile/dropdown'
import { constants } from '../../src/constants'
import JCComponent, { JCState } from '../JCComponent/JCComponent';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MapData } from '../MyGroups/MyGroups';
import EditableUsers from '../Forms/EditableUsers'
//import JCSwitch from '../../components/JCSwitch/JCSwitch';

const orgTypes = orgTypesChurches.concat(orgTypesNonChurch)

Amplify.configure(awsconfig);

interface Props {
  finalizeProfile?(): void
  navigation?: any
  route?: any
  loadId?: string
  create: boolean
}
export type OrganizationData = NonNullable<GetOrganizationQuery['getOrganization']>;

interface State extends JCState {
  OrganizationDetails: OrganizationData
  interest: string
  interestsArray: any
  profileImage: any
  validationText: any
  mapVisible: any
  // mapCoord: any
  isEditable: boolean
  showAccountSettings: boolean
  editMode: boolean
  mapData: MapData[]
  initCenter: any
  dirty: boolean
  oldPass: string
  newPass: string
  passError: string
  currentUser: string
  newAdmins: any[];
  toAddAdmin: any;
  removeAdmins: any[];
}
class OrganizationImpl extends JCComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...super.getInitialState(),
      OrganizationDetails: null,
      interest: null,
      interestsArray: [],
      profileImage: "",
      validationText: null,
      showAccountSettings: false,
      mapVisible: false,
      isEditable: false,
      editMode: false,
      mapData: [],
      initCenter: { lat: 44, lng: -78.0 },
      dirty: false,
      oldPass: '',
      newPass: '',
      passError: '',
      currentUser: null,
      newAdmins: [],
      toAddAdmin: null,
      removeAdmins: null,
    }
    this.getUserDetails().then(() => this.getOrg())
  }

  convertProfileToMapData() {
    if (this.state.OrganizationDetails.location && this.state.OrganizationDetails.location.latitude && this.state.OrganizationDetails.location.longitude)
      this.setState({
        mapData: [{
          latitude: Number(this.state.OrganizationDetails.location.latitude) + Number(this.state.OrganizationDetails.location.randomLatitude),
          longitude: Number(this.state.OrganizationDetails.location.longitude) + Number(this.state.OrganizationDetails.location.randomLatitude),
          name: 'test',
          user: this.state.OrganizationDetails,
          link: "",
          type: "organization"
        }],
        initCenter: { lat: Number(this.state.OrganizationDetails.location.latitude) + Number(this.state.OrganizationDetails.location.randomLatitude), lng: Number(this.state.OrganizationDetails.location.longitude) + Number(this.state.OrganizationDetails.location.randomLatitude) }
      })
  }

  async getUserDetails(): Promise<void> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      this.setState({ currentUser: user['username'] })
    }
    catch (e) {
      console.log(e)
    }
  }

  async getOrg(): Promise<void> {
    if (!this.state.currentUser) {
      return
    }

    if (this.props.loadId && this.props.create === false) {
      try {
        const getOrg = await API.graphql(graphqlOperation(queries.getOrganization, { id: this.props.loadId })) as GraphQLResult<GetOrganizationQuery>;
        this.setState({
          OrganizationDetails: getOrg.data.getOrganization,
          isEditable: getOrg.data.getOrganization.admins.includes(this.state.currentUser),
        }, () => { this.getProfileImage(); this.convertProfileToMapData() }
        )
      } catch (e) {
        console.error(e)
      }
    } else {
      try {
        const id = `organization-${Date.now()}`;
        const orgInput: CreateOrganizationInput = {
          id: id,
          superAdmin: this.state.currentUser,
          admins: [this.state.currentUser],
          orgName: '',
          profileState: 'Incomplete',
          parentOrganizationId: id,
          joined: moment().format()
        }
        const createOrg: any = await API.graphql({
          query: mutations.createOrganization,
          variables: { input: orgInput },
          authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
        })
        this.setState({
          OrganizationDetails: createOrg.data.createOrganization,
          isEditable: true,
          editMode: true,
        }, () => { this.getProfileImage(); this.convertProfileToMapData() }
        )
      } catch (e) {
        console.error(e)
      }
    }
  }

  /*handleAlertInputChange(event: any, name: string): void {

    const value = event.target === undefined ? event : event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    console.log(value)
    const updateData = { ...this.state.OrganizationDetails }
    if (updateData.alertConfig == null) {
      const z: {
        __typename: "AlertConfig";
        emailDirectMessage: string;
        emailGroupMessage: string;
        emailEventMessage: string;
        emailOrgMessage: string;
        emailResourceMessage: string;
        emailCourseMessage: string;
        emailPromotions: string;
      } = {
        __typename: "AlertConfig",
        emailDirectMessage: "false",
        emailGroupMessage: "false",
        emailEventMessage: "false",
        emailOrgMessage: "false",
        emailResourceMessage: "false",
        emailCourseMessage: "false",
        emailPromotions: "false"
      }
      updateData.alertConfig = z
      delete updateData.alertConfig.__typename
    }
    updateData.alertConfig[name] = value.toString()
    this.setState({
      OrganizationDetails: updateData,
      dirty: true
    }, async () => {
      try {
        const updateUser = await API.graphql(graphqlOperation(mutations.updateUser, { input: { id: this.state.OrganizationDetails.id, alertConfig: this.state.OrganizationDetails.alertConfig } }));
        console.log(updateUser)
      } catch (e) {
        console.log(e)

      }
    });
  }*/
  handleInputChange(event: any, name: string): void {

    const value = event.target === undefined ? event : event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    // const name = target.name;
    console.log(value)
    const updateData = { ...this.state.OrganizationDetails }
    updateData[name] = value
    this.setState({
      OrganizationDetails: updateData,
      dirty: true
    }, () => {
      if (name === "location")
        this.convertProfileToMapData()
    });
  }
  clean(item: OrganizationData): OrganizationData {
    delete item.parentOrganization
    delete item.subOrganizations
    delete item.ownsGroups
    delete item.members
    delete item.resource
    delete item.createdAt
    delete item.updatedAt
    if (item.profileImage)
      delete item.profileImage["__typename"]
    return item
  }
  async finalizeProfile(): Promise<void> {
    const validation = Validate.Organization(this.state.OrganizationDetails)
    if (validation.result) {
      try {
        const toSave = this.clean(this.state.OrganizationDetails)
        toSave["profileState"] = "Complete"
        await API.graphql(graphqlOperation(mutations.updateOrganization, { input: toSave }));
        this.setState({ dirty: false, editMode: false })
      } catch (e) {
        console.log(e)
      }
    }
    this.setState({ validationText: validation.validationError })
  }
  async onProfileImageChange(e: any): Promise<void> {
    const file = e.target.files[0];
    const user = await Auth.currentCredentials();
    const userId = user.identityId
    const lastDot = file.name.lastIndexOf('.');
    const ext = file.name.substring(lastDot + 1);
    const fn = 'profile/upload/organization-' + new Date().getTime() + '.' + ext
    const fnSave = fn.replace("/upload", "").replace(".", "-[size].").replace("." + ext, ".png")

    Storage.put(fn, file, {
      level: 'protected',
      contentType: file.type,
      identityId: userId
    })
      .then(() => {
        const updateData = { ...this.state.OrganizationDetails }
        updateData['profileImage'] = {
          __typename: "Image",
          userId: userId,
          filenameUpload: fn,
          filenameLarge: fnSave.replace('[size]', 'large'),
          filenameMedium: fnSave.replace('[size]', 'medium'),
          filenameSmall: fnSave.replace('[size]', 'small')
        }
        this.setState({
          OrganizationDetails: updateData,
          dirty: true
        }, () => {
          this.getProfileImage()
        });
      })
      .catch(err => console.log(err));
  }
  getProfileImage(): void {
    console.log("get profile image")
    //console.log(this.state.OrganizationDetails.profileImage)
    if (this.state.OrganizationDetails.profileImage != null)
      Storage.get(this.state.OrganizationDetails.profileImage.filenameUpload, {
        level: 'protected',
        identityId: this.state.OrganizationDetails.profileImage.userId
      })
        .then(result => this.setState({ profileImage: result }))
        .catch(err => { console.log(err) });
  }

  async addAdmins(): Promise<void> {
    if (!this.state.newAdmins || this.state.newAdmins.length === 0) {
      return
    }

    const newAdmins = this.state.OrganizationDetails.admins;

    this.state.newAdmins.forEach(user => {

      if (!newAdmins.includes(user.id))
        newAdmins.push(user.id)
    })

    try {
      const addAdmins = await API.graphql(graphqlOperation(mutations.updateOrganization, { input: { id: this.state.OrganizationDetails.id, admins: newAdmins } }));
      console.log({ 'success': addAdmins })
    } catch (err) {
      console.error(err)
    }
  }

  async removeAdmins(): Promise<void> {
    if (!this.state.removeAdmins || this.state.removeAdmins.length === 0) {
      return
    }
    const toRemove = [];
    this.state.removeAdmins.forEach(user => {
      if (user.id !== this.state.OrganizationDetails.superAdmin)
        toRemove.push(user.id)
    })
    const remainingAdmins = this.state.OrganizationDetails.admins.filter(user => !toRemove.includes(user));
    try {
      const addAdmins = await API.graphql(graphqlOperation(mutations.updateOrganization, { input: { id: this.state.OrganizationDetails.id, admins: remainingAdmins } }));
      console.log({ 'success': addAdmins })
    } catch (err) {
      console.error(err)
    }
  }


  showMap(): void {
    console.log("showMap")
    this.setState({ mapVisible: true })
  }
  renderMap() {
    return (
      this.state.OrganizationDetails.location?.geocodeFull ? <MyMap initCenter={this.state.initCenter} visible={true} mapData={this.state.mapData} type={"profile"}></MyMap> : null
    )
  }

  showProfile(id: string): void {
    console.log("Navigate to profileScreen")
    this.props.navigation.push("ProfileScreen", { id: id, create: false });
  }

  deleteOrg(): void {
    Auth.currentAuthenticatedUser().then((user) => {
      if (this.state.OrganizationDetails.superAdmin === user['username']) {
        const deleteOrganization: any = API.graphql({
          query: mutations.deleteOrganization,
          variables: {
            input: { id: this.state.OrganizationDetails.id }
          },
          authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
        })
        deleteOrganization.then((c: any) => {
          console.log(c)
          this.props.navigation.navigate("HomeScreen")
        }).catch((e: any) => {
          console.log(e)
          this.props.navigation.navigate("HomeScreen")
        })
      } else {
        return false;
      }
    })
  }

  handleEditMode() {
    if (this.state.dirty && window.confirm('You have unsaved changes'))
      this.setState({ editMode: !this.state.editMode, showAccountSettings: false })
    else if (!this.state.dirty)
      this.setState({ editMode: !this.state.editMode, showAccountSettings: false })
  }

  renderMainUserGroup(group) {
    switch (group) {
      case 'verifiedUser':
        return <Text style={this.styles.style.fontFormUserType}>Verified</Text>
      case 'friend':
        return <Text style={this.styles.style.fontFormUserType}>Friend</Text >
      case 'partner':
        return <Text style={this.styles.style.fontFormUserType}>Partner</Text>
      case 'admin':
        return <Text style={this.styles.style.fontFormUserType}>Admin</Text>
      default:
        return <Text style={this.styles.style.fontFormUserType}>Un-Verified</Text >
    }
  }
  /*openConversation(initialUser, name): void {
    console.log("Navigate to conversationScreen")
    this.props.navigation.push("ConversationScreen", { initialUserID: initialUser, initialUserName: name });
  }*/
  render(): React.ReactNode {
    return (
      (this.state.OrganizationDetails != null ?
        <Content>
          <View style={this.styles.style.myProfileTopButtons}>
            {this.state.isEditable && (this.state.editMode || this.state.showAccountSettings) ?
              <Text style={this.styles.style.profileFontTitle}>Setup your profile</Text>
              : <Text style={this.styles.style.profileFontTitle}>{this.state.OrganizationDetails.orgName}</Text>
            }
            <View style={this.styles.style.myProfileTopButtonsExternalContainer}>
              {this.state.isEditable ?
                <View style={this.styles.style.myProfileTopButtonsInternalContainer}>
                  {this.state.editMode ? <JCButton enabled={this.state.dirty}
                    data-testid="org-save"
                    buttonType={ButtonTypes.SolidRightMargin}
                    onPress={() => { this.finalizeProfile() }}>Save Profile</JCButton> : null}
                  {this.props.loadId && this.state.showAccountSettings ? <JCButton buttonType={ButtonTypes.SolidProfileDelete} onPress={() => this.deleteOrg()}>Delete</JCButton> : null}
                </View>
                : null
              }
              {
                this.state.isEditable && (this.state.editMode || this.state.showAccountSettings) ?
                  <Text style={this.styles.style.myProfileErrorValidation}>{this.state.validationText}</Text>
                  : null
              }
            </View>
          </View>

          <Form style={this.styles.style.myProfileMainContainer}>
            <View style={this.styles.style.profileScreenLeftCard}>
              <View style={this.styles.style.myProfileImageWrapper}>
                <Image style={this.styles.style.myProfileImage}
                  source={this.state.profileImage == "" ? require('../../assets/profile-placeholder.png') : this.state.profileImage} onError={() => { this.getProfileImage() }}>
                </Image>
                {this.state.isEditable && this.state.editMode ?
                  <View style={this.styles.style.fileInputWrapper}>
                    <JCButton buttonType={ButtonTypes.SolidProfile} onPress={() => { null }}>Set Profile Picture</JCButton>
                    <input data-testid="org-image" style={{ cursor: 'pointer', fontSize: "200px", position: "absolute", top: "0px", right: "0px", opacity: "0" }} type="file" accept='image/*' onChange={(e) => this.onProfileImageChange(e)} />
                  </View>
                  : null
                }
                {/*<Text style={this.styles.style.fontFormProfileImageText}>Upload a picture of minimum 500px wide. Maximum size is 700kb.</Text>*/}
              </View>
              <View style={this.styles.style.myProfilePersonalInfoWrapper}>
                <Text style={this.styles.style.fontFormName}>{this.state.OrganizationDetails.orgName}</Text>
                {this.state.isEditable && this.state.editMode ?
                  <Text style={this.styles.style.fontFormSmall}>One sentence about us</Text>
                  : null
                }
                <EditableText onChange={(e) => { this.handleInputChange(e, "aboutMeShort") }}
                  placeholder="Short sentence about me" multiline={true}
                  placeholderTextColor="#757575"
                  textStyle={this.styles.style.fontFormSmallDarkGrey}
                  inputStyle={this.styles.style.fontFormAboutMe}
                  data-testid="org-aboutMeShort"
                  value={this.state.OrganizationDetails.aboutMeShort} isEditable={this.state.isEditable && this.state.editMode}></EditableText>

                <View style={this.styles.style.myProfileCoordinates}>
                  <Text style={this.styles.style.fontFormSmallDarkGreyCoordinates}><Image style={{ width: "22px", height: "22px", top: 6, marginRight: 5 }} source={require('../../assets/svg/pin 2.svg')}></Image>{this.state.OrganizationDetails.location?.geocodeFull ? this.state.OrganizationDetails.location.geocodeFull : "Location not defined"}</Text>
                  {this.state.isEditable && this.state.OrganizationDetails.profileState !== "Incomplete" ? <JCButton buttonType={ButtonTypes.EditButton} onPress={() => this.handleEditMode()}>{this.state.editMode ? 'View Profile' : 'Edit Profile'}</JCButton> : null}
                </View>
                <Text style={this.styles.style.fontFormSmallGrey}><Image style={{ width: "22px", height: "22px", top: 3, marginRight: 5 }} source={require('../../assets/svg/calendar.svg')}></Image>{this.state.OrganizationDetails.joined ? moment(this.state.OrganizationDetails.joined).format('MMMM Do YYYY') : "Join date unknown"}</Text>
                <Text style={this.styles.style.fontFormSmallGrey}><Image style={{ width: "22px", height: "22px", top: 3, marginRight: 5 }} source={require('../../assets/svg/church.svg')}></Image>{this.state.OrganizationDetails.orgName ? this.state.OrganizationDetails.orgName : "No Organization Name"}</Text>
                {/*!this.state.isEditable ?
                  <Button bordered style={this.styles.style.connectWithSliderButton} onPress={() => { this.openConversation(this.state.OrganizationDetails.id, this.state.OrganizationDetails.given_name + " " + this.state.OrganizationDetails.family_name) }}><Text style={this.styles.style.fontStartConversation}>Start Conversation</Text></Button>
                : null*/}

                {this.state.isEditable && this.state.OrganizationDetails.profileState !== "Incomplete" && constants['SETTING_ISVISIBLE_PROFILE_MESSAGES'] ?
                  <View style={{ borderBottomWidth: 1, borderTopWidth: 1, borderColor: '#33333320', paddingVertical: 10 }}><JCButton data-testid="org-setmap" buttonType={ButtonTypes.TransparentBoldBlackNoMargin} onPress={() => console.error('messages not yet supported')}>Messages</JCButton></View>
                  : null
                }
                {this.state.isEditable && this.state.OrganizationDetails.profileState !== "Incomplete" && constants['SETTING_ISVISIBLE_PROFILE_ACCOUNTSETTINGS'] ?
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#33333320', paddingVertical: 10, borderRightWidth: this.state.showAccountSettings ? 7 : 0, borderRightColor: '#F0493E' }}><JCButton data-testid="org-setmap" buttonType={ButtonTypes.TransparentBoldBlackNoMargin} onPress={() => this.setState({ showAccountSettings: !this.state.showAccountSettings, editMode: false })}>Account Settings</JCButton></View>
                  : null
                }
              </View>

              {this.state.isEditable && this.state.editMode ?
                <Text style={this.styles.style.fontFormSmallHeader}>Public Location</Text>
                : null
              }
              {this.state.isEditable && this.state.editMode ?
                <EditableLocation onChange={(value: any, location: any) => {
                  if (location) {
                    this.handleInputChange({ latitude: location.lat, longitude: location.lng, geocodeFull: value, randomLatitude: this.state.OrganizationDetails.location?.randomLatitude ? this.state.OrganizationDetails.location.randomLatitude : (Math.random() * 0.04) - 0.02, randomLongitude: this.state.OrganizationDetails.location?.randomLongitude ? this.state.OrganizationDetails.location.randomLongitude : (Math.random() * 0.04) - 0.02 }, "location");
                  }
                }}
                  multiline={false} textStyle={this.styles.style.fontRegular}
                  inputStyle={this.styles.style.groupNameInput} value={this.state.OrganizationDetails.location?.geocodeFull}
                  isEditable={this.state.isEditable && this.state.editMode} citiesOnly={true}>
                </EditableLocation>
                : null
              }

              {!this.state.editMode ?
                <View>
                  <Text style={{ fontFamily: "Graphik-Bold-App", fontSize: 20, lineHeight: 25, letterSpacing: -0.3, color: "#333333", paddingTop: 48, paddingBottom: 12 }}>Members ({this.state.OrganizationDetails.admins.length - 1})</Text>
                  <View style={this.styles.style.groupAttendeesPictures}>
                    {this.state.OrganizationDetails.admins.map((id: any, index: any) => {
                      if (id === this.state.OrganizationDetails.superAdmin) {
                        return null
                      }
                      return (
                        <TouchableOpacity key={index} onPress={() => { this.showProfile(id) }}>
                          <ProfileImage key={index} user={id} size="small" />
                        </TouchableOpacity>
                      )
                    })}
                  </View>

                  <Text style={{ fontFamily: "Graphik-Bold-App", fontSize: 20, lineHeight: 25, letterSpacing: -0.3, color: "#333333", paddingBottom: 12 }}>Administrator</Text>
                  <TouchableOpacity onPress={() => { this.showProfile(this.state.OrganizationDetails.superAdmin) }}>
                    <ProfileImage user={this.state.OrganizationDetails.superAdmin} size="small" />
                  </TouchableOpacity>
                </View> : null}


              {this.state.isEditable && this.state.editMode ?
                <Text style={this.styles.style.profilePrivateInformation}>Private Information</Text>
                : null
              }
              {this.state.isEditable && this.state.editMode ?
                <View style={{ backgroundColor: '#FFFFFF', width: "100%", marginBottom: 30 }}>
                  <Item stackedLabel>
                    <Label style={this.styles.style.fontFormSmall}><Text style={this.styles.style.fontFormMandatory}>*</Text>Address</Label>
                    <Input data-testid="org-Address" style={this.styles.style.fontFormMediumInput} value={this.state.OrganizationDetails.address}
                      onChange={(e) => { this.handleInputChange(e, "address") }} />
                  </Item>
                  <Item stackedLabel>
                    <Label style={this.styles.style.fontFormSmall}><Text style={this.styles.style.fontFormMandatory}>*</Text>City</Label>
                    <Input data-testid="org-City" style={this.styles.style.fontFormMediumInput} value={this.state.OrganizationDetails.city}
                      onChange={(e) => { this.handleInputChange(e, "city") }} />
                  </Item>
                  <Item stackedLabel>
                    <Label style={this.styles.style.fontFormSmall}><Text style={this.styles.style.fontFormMandatory}>*</Text>Province/State</Label>
                    <Input data-testid="org-Province" style={this.styles.style.fontFormMediumInput} value={this.state.OrganizationDetails.province}
                      onChange={(e) => { this.handleInputChange(e, "province") }} />
                  </Item>
                  <Item stackedLabel>
                    <Label style={this.styles.style.fontFormSmall}><Text style={this.styles.style.fontFormMandatory}>*</Text>Postal/Zip Code</Label>
                    <Input data-testid="org-PostalCode" style={this.styles.style.fontFormMediumInput} value={this.state.OrganizationDetails.postalCode}
                      onChange={(e) => { this.handleInputChange(e, "postalCode") }} />
                  </Item>
                  <Item stackedLabel>
                    <Label style={this.styles.style.fontFormSmall}><Text style={this.styles.style.fontFormMandatory}>*</Text>Country</Label>
                    <Input data-testid="org-Country" style={this.styles.style.fontFormMediumInput} value={this.state.OrganizationDetails.country}
                      onChange={(e) => { this.handleInputChange(e, "country") }} />
                  </Item>
                  <Item stackedLabel>
                    <Label style={this.styles.style.fontFormSmall}><Text style={this.styles.style.fontFormMandatory}>*</Text>Email Address</Label>
                    <Input data-testid="org-Email" style={this.styles.style.fontFormMediumInput} value={this.state.OrganizationDetails.adminEmail}
                      onChange={(e) => { this.handleInputChange(e, "adminEmail") }} />
                  </Item>
                  <Item stackedLabel>
                    <Label style={this.styles.style.fontFormSmall}><Text style={this.styles.style.fontFormMandatory}>*</Text>Phone #</Label>
                    <Input data-testid="org-Phone" style={this.styles.style.fontFormMediumInput} value={this.state.OrganizationDetails.phone}
                      onChange={(e) => { this.handleInputChange(e, "phone") }} />
                  </Item>
                </View>
                : null}
            </View>

            {!this.state.showAccountSettings ?
              <View style={this.styles.style.profileScreenRightCard}>
                <View style={{ width: '100%' }}>
                  {this.renderMap()}
                </View>
                {this.state.isEditable && this.state.editMode ?
                  <Text style={this.styles.style.fontMyProfileLeftTop}>Tell us more about you</Text>
                  : null
                }
                {this.state.isEditable && this.state.editMode ?
                  <Text style={this.styles.style.myprofileAboutMe}><Text style={this.styles.style.fontFormMandatory}>*</Text>About us</Text>
                  : <Text style={this.styles.style.myprofileAboutMe}>About us</Text>
                }
                <EditableText onChange={(e) => { this.handleInputChange(e, "aboutMeLong") }}
                  placeholder="type here" multiline={true}
                  data-testid="org-aboutMeLong"
                  textStyle={this.styles.style.fontFormSmallDarkGrey}
                  inputStyle={{ borderWidth: 1, borderColor: "#dddddd", marginTop: 15, marginBottom: 60, width: "100%", paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, fontFamily: 'Graphik-Regular-App', fontSize: 16, lineHeight: 28 }}
                  value={this.state.OrganizationDetails.aboutMeLong} isEditable={this.state.isEditable && this.state.editMode}></EditableText>

                <Text style={this.styles.style.fontFormSmall}>&nbsp;</Text>
                {this.state.isEditable && this.state.editMode ? <View>
                  <Text style={this.styles.style.fontBold}><Text style={this.styles.style.fontFormMandatory}>*</Text>Tell us about your organization</Text>
                  {this.state.isEditable && this.state.editMode || this.state.OrganizationDetails.orgName ? <View>
                    <Label style={this.styles.style.fontFormSmall}>Organization Name</Label>
                    <EditableText onChange={(e) => { this.handleInputChange(e, "orgName") }}
                      multiline={false}
                      data-testid="org-orgName"
                      textStyle={this.styles.style.fontFormSmallDarkGrey}
                      inputStyle={this.styles.style.myProfileOrgTypeInput}
                      value={this.state.OrganizationDetails.orgName} isEditable={this.state.isEditable && this.state.editMode}></EditableText>
                  </View> : null}

                  {(this.state.isEditable && this.state.editMode) || (this.state.OrganizationDetails.orgType && this.state.OrganizationDetails.orgType !== 'None') ? <View style={{ marginTop: 15 }}>
                    <Label style={this.styles.style.fontFormSmall}>Type of Organization</Label>
                    {this.state.isEditable && this.state.editMode ?
                      <View style={this.styles.style.myProfileOrgView}>
                        <Picker style={this.styles.style.myprofilePicker}
                          onValueChange={(itemValue) => { this.handleInputChange(itemValue, "orgType") }}
                          selectedValue={orgTypes.includes(this.state.OrganizationDetails.orgType) ? this.state.OrganizationDetails.orgType : this.state.OrganizationDetails.orgType === null || this.state.OrganizationDetails.orgType === 'None' ? 'None' : ""}
                        >
                          <Picker.Item label={'None Selected'} value={'None'} />
                          {orgTypes.map((item, index) => {
                            return (<Picker.Item key={index} label={item} value={item} />)
                          })}
                          <Picker.Item label={"Other"} value={""} />
                        </Picker>
                        {this.state.OrganizationDetails.orgType === "" || (!orgTypes.includes(this.state.OrganizationDetails.orgType) && this.state.OrganizationDetails.orgType !== "None" && this.state.OrganizationDetails.orgType !== null) ?
                          <EditableText onChange={(e) => { this.handleInputChange(e, "orgType") }}
                            multiline={false}
                            textStyle={this.styles.style.fontFormSmallDarkGrey}
                            inputStyle={this.styles.style.myProfileOrgTypeInput}
                            value={this.state.OrganizationDetails.orgType} isEditable={this.state.isEditable && this.state.editMode}></EditableText> : null}
                      </View>
                      : this.state.OrganizationDetails.orgType && this.state.OrganizationDetails.orgType !== 'None' ?
                        <EditableText
                          multiline={true}
                          textStyle={this.styles.style.fontFormSmallDarkGrey}
                          value={this.state.OrganizationDetails.orgType} isEditable={false} /> : null
                    }
                  </View> : null}



                  {orgTypes.includes(this.state.OrganizationDetails.orgType) && (this.state.OrganizationDetails.orgSize || this.state.editMode) ? <View style={{ marginTop: 15 }}>
                    {this.state.isEditable && this.state.editMode ?
                      <View>
                        <Label style={this.styles.style.fontFormSmall}>How many employees are there in the organization?</Label>
                        <Picker style={this.styles.style.myprofilePicker}
                          onValueChange={(itemValue) => { this.handleInputChange(itemValue, "orgSize") }}
                          selectedValue={this.state.OrganizationDetails.orgSize}
                        >
                          <Picker.Item label={'None Selected'} value={''} />
                          {numberOfEmployees.map((item, index) => {
                            return (<Picker.Item key={index} label={item} value={item} />)
                          })}
                        </Picker>
                      </View>
                      : this.state.OrganizationDetails.orgSize ?
                        <View>
                          <Label style={this.styles.style.fontFormSmall}>Employees</Label>

                          <EditableText
                            multiline={true}
                            textStyle={this.styles.style.fontFormSmallDarkGrey}
                            value={this.state.OrganizationDetails.orgSize} isEditable={false} />
                        </View> : null
                    }
                  </View> : null}

                  {orgTypesChurches.includes(this.state.OrganizationDetails.orgType) && (this.state.OrganizationDetails.sundayAttendance || this.state.editMode) ? <View style={{ marginTop: 15 }}>
                    {this.state.isEditable && this.state.editMode ?
                      <View>
                        <Label style={this.styles.style.fontFormSmall}>Average Sunday morning attendance</Label>
                        <Picker style={this.styles.style.myprofilePicker}
                          onValueChange={(itemValue) => { this.handleInputChange(itemValue, "sundayAttendance") }}
                          selectedValue={this.state.OrganizationDetails.sundayAttendance}
                        >
                          <Picker.Item label={'None Selected'} value={''} />
                          {sundayAttendance.map((item, index) => {
                            return (<Picker.Item key={index} label={item} value={item} />)
                          })}
                        </Picker>
                      </View>
                      :
                      this.state.OrganizationDetails.sundayAttendance ? <View>
                        <Label style={this.styles.style.fontFormSmall}>Average Sunday morning attendance</Label>
                        <EditableText
                          multiline={true}
                          textStyle={this.styles.style.fontFormSmallDarkGrey}
                          value={this.state.OrganizationDetails.sundayAttendance} isEditable={false} />
                      </View> : null
                    }
                  </View> : null}

                  {orgTypes.includes(this.state.OrganizationDetails.orgType) && (this.state.OrganizationDetails.numberVolunteers || this.state.editMode) ? <View style={{ marginTop: 15 }}>
                    {this.state.isEditable && this.state.editMode ?
                      <View>
                        <Label style={this.styles.style.fontFormSmall}>Number of volunteers</Label>
                        <Picker style={this.styles.style.myprofilePicker}
                          onValueChange={(itemValue) => { this.handleInputChange(itemValue, "numberVolunteers") }}
                          selectedValue={this.state.OrganizationDetails.numberVolunteers}
                        >
                          <Picker.Item label={'None Selected'} value={''} />
                          {numberOfEmployees.map((item, index) => {
                            return (<Picker.Item key={index} label={item} value={item} />)
                          })}
                        </Picker>
                      </View>
                      : this.state.OrganizationDetails.numberVolunteers ?
                        <View>
                          <Label style={this.styles.style.fontFormSmall}>Number of volunteers</Label>
                          <EditableText
                            multiline={true}
                            textStyle={this.styles.style.fontFormSmallDarkGrey}
                            value={this.state.OrganizationDetails.numberVolunteers} isEditable={false} />
                        </View> : null
                    }
                  </View> : null}


                  {orgTypesChurches.includes(this.state.OrganizationDetails.orgType) && (this.state.OrganizationDetails.denomination || this.state.editMode) ? <View style={{ marginTop: 15 }}>
                    <Text style={this.styles.style.fontFormSmall}>Denomination</Text>
                    <EditableText onChange={(e) => { this.handleInputChange(e, "denomination") }}
                      multiline={true}
                      data-testid="org-denomination"
                      textStyle={this.styles.style.fontFormSmallDarkGrey}
                      placeholder="Type here."
                      inputStyle={{ borderWidth: 1, borderColor: "#dddddd", width: "100%", marginBottom: 15, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, fontFamily: 'Graphik-Regular-App', fontSize: 16, lineHeight: 28 }}
                      value={this.state.OrganizationDetails.denomination} isEditable={this.state.isEditable && this.state.editMode}></EditableText>
                  </View> : null}

                  {orgTypesNonChurch.includes(this.state.OrganizationDetails.orgType) && (this.state.OrganizationDetails.pplServed || this.state.editMode) ? <View style={{ marginTop: 15 }}>
                    <Text style={this.styles.style.fontFormSmall}>{this.state.editMode ? 'How many people do you serve?' : 'People impacted by our services'}</Text>
                    <EditableText onChange={(e) => { this.handleInputChange(e, "pplServed") }}
                      multiline={true}
                      data-testid="org-pplServed"
                      textStyle={this.styles.style.fontFormSmallDarkGrey}
                      placeholder="Type here."
                      inputStyle={{ borderWidth: 1, borderColor: "#dddddd", width: "100%", marginBottom: 15, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, fontFamily: 'Graphik-Regular-App', fontSize: 16, lineHeight: 28 }}
                      value={this.state.OrganizationDetails.pplServed} isEditable={this.state.isEditable && this.state.editMode}></EditableText>
                  </View> : null}

                  {this.state.OrganizationDetails.orgDescription || this.state.editMode ? <View style={{ marginTop: 15 }}>
                    <Text style={this.styles.style.fontFormSmall}>Description of church or ministry organization</Text>
                    <EditableText onChange={(e) => { this.handleInputChange(e, "orgDescription") }}
                      multiline={true}
                      data-testid="org-orgDescription"
                      textStyle={this.styles.style.fontFormSmallDarkGrey}
                      placeholder="Type here."
                      inputStyle={{ borderWidth: 1, borderColor: "#dddddd", width: "100%", marginBottom: 15, paddingTop: 10, paddingRight: 10, paddingBottom: 10, paddingLeft: 10, fontFamily: 'Graphik-Regular-App', fontSize: 16, lineHeight: 28 }}
                      value={this.state.OrganizationDetails.orgDescription} isEditable={this.state.isEditable && this.state.editMode}></EditableText>
                  </View> : null}

                </View> : null}
              </View>
              : <View style={this.styles.style.profileScreenRightCard}>
                <Text style={this.styles.style.myprofileAboutMe}>Account Settings</Text>

                <EditableUsers
                  onChange={(newAdmins: any[]) => this.setState({ newAdmins })}
                  multiline={false}
                  showProfileImages={true}
                  textStyle={this.styles.style.fontFormSmallDarkGrey}
                  inputStyle={this.styles.style.fontFormLargeInput}
                  value={this.state.newAdmins} isEditable={true}></EditableUsers>
                <JCButton buttonType={ButtonTypes.SolidAboutMe} onPress={() => this.addAdmins()}><Text>Add Admins</Text></JCButton>

                {/*<EditableUsers
                  onChange={(removeAdmins: any[]) => this.setState({ removeAdmins })}
                  multiline={false}
                  showProfileImages={true}
                  textStyle={this.styles.style.fontFormSmallDarkGrey}
                  inputStyle={this.styles.style.fontFormLargeInput}
                  value={this.state.removeAdmins} isEditable={true}></EditableUsers>
                <JCButton buttonType={ButtonTypes.SolidAboutMe} onPress={() => this.removeAdmins()}><Text>Remove Admins</Text></JCButton>*/}
                {/*<Label style={{ ...this.styles.style.fontFormSmallDarkGrey, marginBottom: 15 }}>Alert Settings</Label>
                  <JCSwitch containerWidth={500} switchLabel="Receive Email Alerts for Direct Messages" initState={this.state.OrganizationDetails.alertConfig?.emailDirectMessage == "true"} onPress={(e) => { this.handleAlertInputChange(e, "emailDirectMessage") }}></JCSwitch>
                  <JCSwitch containerWidth={500} switchLabel="Receive Email Alerts for Group Messages" initState={this.state.OrganizationDetails.alertConfig?.emailGroupMessage == "true"} onPress={(e) => { this.handleAlertInputChange(e, "emailGroupMessage") }}></JCSwitch>
                  <JCSwitch containerWidth={500} switchLabel="Receive Email Alerts for Event Messages" initState={this.state.OrganizationDetails.alertConfig?.emailEventMessage == "true"} onPress={(e) => { this.handleAlertInputChange(e, "emailEventMessage") }}></JCSwitch>
                  <JCSwitch containerWidth={500} switchLabel="Receive Email Alerts for Resource Messages" initState={this.state.OrganizationDetails.alertConfig?.emailResourceMessage == "true"} onPress={(e) => { this.handleAlertInputChange(e, "emailResourceMessage") }}></JCSwitch>
                  <JCSwitch containerWidth={500} switchLabel="Receive Email Alerts for Course Messages" initState={this.state.OrganizationDetails.alertConfig?.emailCourseMessage == "true"} onPress={(e) => { this.handleAlertInputChange(e, "emailCourseMessage") }}></JCSwitch>
                  <JCSwitch containerWidth={500} switchLabel="Receive Email Alerts for Organization Messages" initState={this.state.OrganizationDetails.alertConfig?.emailOrgMessage == "true"} onPress={(e) => { this.handleAlertInputChange(e, "emailOrgMessage") }}></JCSwitch>
                  <JCSwitch containerWidth={500} switchLabel="Receive Email Alerts for Org Messages" initState={this.state.OrganizationDetails.alertConfig?.emailPromotions == "true"} onPress={(e) => { this.handleAlertInputChange(e, "emailPromotions") }}></JCSwitch>*/}
              </View>}
          </Form>
        </Content>
        : null)
    )
  }
}

export default function Organization(props: Props): JSX.Element {
  const route = useRoute();
  const navigation = useNavigation()
  return <OrganizationImpl {...props} navigation={navigation} route={route} />;
}