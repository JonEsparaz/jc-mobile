import React, { useState } from "react";
import Amplify from "aws-amplify";
import awsConfig from "../../src/aws-exports";
Amplify.configure(awsConfig);
import { ActivityIndicator, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";
import HandleStripePayment from "./HandleStripePayment";
import { ElementsConsumer } from "@stripe/react-stripe-js";

import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import "./CardSectionStyles.css";

import { Label, Content, Card, CardItem, Body } from "native-base";
import { Text } from "react-native";
import GRAPHQL_AUTH_MODE from "aws-amplify-react-native";
import * as customMutations from "../../src/graphql-custom/mutations";
import * as mutations from "../../src/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";
import { Auth } from "aws-amplify";
import JCComponent, { JCState } from "../../components/JCComponent/JCComponent";
import { UserContext, UserState } from "../../screens/HomeScreen/UserContext";
import JCButton, { ButtonTypes } from "../../components/Forms/JCButton";
import JCModal from "../../components/Forms/JCModal";
import { TouchableOpacity } from "react-native";
import * as queries from "../../src/graphql/queries";
import { v4 as uuidv4 } from "uuid";
import {
  GetProductQuery,
  GetUserQuery,
  ListProductsQuery,
} from "../../src/API";
import { GraphQLResult } from "@aws-amplify/api/lib/types";
import EditableText from "../../components/Forms/EditableText";

import EditableRichText from "../../components/Forms/EditableRichText";
import { useNavigation, useRoute } from "@react-navigation/native";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

interface Props {
  navigation?: any;
  route?: any;
  authState?: string;
}
interface State extends JCState {
  showSubscriptionSelector: boolean;
  products: NonNullable<ListProductsQuery["listProducts"]>["items"];
  userData: NonNullable<GetUserQuery>["getUser"];
  currentProduct: NonNullable<ListProductsQuery["listProducts"]>["items"];
  joinedProduct: string[];
  idempotency: string;
  quantities: number[][];
  invoice: any;
  processing: "entry" | "processing" | "complete";
}
class BillingImpl extends JCComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      ...super.getInitialState(),
      showSubscriptionSelector: false,
      products: [],
      currentProduct: [],
      idempotency: uuidv4(),
      processing: "entry",
      joinedProduct: props.route?.params?.joinedProduct
        ? props.route?.params?.joinedProduct == "null"
          ? []
          : props.route?.params?.joinedProduct.split(",")
        : [],
    };
    console.log({ joinedProduct: this.state.joinedProduct });
    this.setInitialData();
  }

  async setInitialData(): Promise<void> {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const getUser = (await API.graphql({
        query: queries.getUser,
        variables: { id: user["username"] },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as GraphQLResult<GetUserQuery>;
      if (getUser.data) {
        this.setState({ userData: getUser.data.getUser });
        console.log({ USER: getUser.data?.getUser });
      }
    } catch (e) {
      console.log({ UserError: e });
    }
    try {
      const listProducts = (await API.graphql({
        query: queries.listProducts,
        variables: { limit: 50 },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      })) as GraphQLResult<ListProductsQuery>;
      if (listProducts.data?.listProducts)
        this.setState({ products: listProducts.data.listProducts.items });
      if (this.state.currentProduct?.length == 0)
        if (this.state.joinedProduct.length == 0) {
          if (listProducts.data?.listProducts?.items) {
            this.setState(
              {
                currentProduct: [listProducts.data.listProducts.items[0]],
                quantities: [
                  Array(
                    listProducts.data.listProducts.items[0]?.tiered?.length
                  ).fill(1),
                ],
              },
              () => {
                this.createInvoice();
              }
            );
            console.log(listProducts.data.listProducts.items[0]);
          }
        } else {
          console.log("Bad");
          /* const products = listProducts.data?.listProducts?.items?.filter(
            (item) => this.state.joinedProduct?.includes(item?.stripePaymentID)
          );
          this.setState(
            {
              currentProduct: products,
              quantities: Array(products?.length).fill(1),
            },
            () => {
              this.createInvoice();
            }
          );*/
        }
    } catch (err) {
      console.error(err);
    }
  }
  async createStripeUser() {
    try {
      const user = await Auth.currentAuthenticatedUser();
      console.log(user);
      const customer: any = await API.graphql({
        query: mutations.createCustomer,
        variables: {
          idempotency: this.state.idempotency,
          firstName: user.attributes.given_name,
          lastName: user.attributes.family_name,
          email: user.attributes.email,
          phone: user.attributes.phone_number,
          billingAddress: this.state.userData?.billingAddress,
        },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      });
      console.log({ customer: customer });
      //customerId = customer.data.createCustomer.customer.id;
    } catch (e) {
      console.log(e);
    }
  }
  getPriceItems() {
    let priceItems = this.state.currentProduct
      ?.map((item, index: number) => {
        let priceItems2 = item?.tiered?.map((item2, index2: number) => {
          return {
            price: item2?.stripePaymentID,
            quantity: this.state.quantities[index][index2],
          };
        });
        return priceItems2;
      })
      .flat();
    console.log(priceItems);
    return priceItems;
  }
  async createInvoice() {
    let priceItems = this.getPriceItems();

    try {
      const invoice: any = await API.graphql({
        query: customMutations.previewInvoice,
        variables: {
          idempotency: this.state.idempotency,
          priceInfo: {
            prices: priceItems,
          },
        },
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      });
      console.log({ invoice: invoice.data.previewInvoice.invoice });
      this.setState({ invoice: invoice.data.previewInvoice.invoice });
    } catch (e) {
      console.log(e);
    }
  }
  selectProduct(product: any) {
    this.setState(
      {
        showSubscriptionSelector: false,
        currentProduct: this.state.currentProduct?.concat(product),
        quantities: this.state.quantities.concat(1),
        invoice: null,
      },
      () => {
        this.createInvoice();
      }
    );
  }

  static UserConsumer = UserContext.Consumer;
  renderAddProductModal(): React.ReactNode {
    return (
      <JCModal
        visible={this.state.showSubscriptionSelector}
        title="Select a Subscription"
        onHide={() => {
          this.setState({ showSubscriptionSelector: false });
        }}
      >
        <>
          <Content>
            {this.state.products?.map(
              (
                product: NonNullable<GetProductQuery>["getProduct"],
                index: number
              ) => {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      this.selectProduct(product);
                    }}
                  >
                    <Card>
                      <CardItem>
                        <Body>
                          <Text
                            style={{
                              fontFamily: "Graphik-Bold-App",
                              paddingRight: 0,
                              fontSize: 20,
                            }}
                          >
                            {product?.name}
                          </Text>
                          <Text
                            style={{
                              fontFamily: "Graphik-Bold-App",
                              color: "#F0493E",
                            }}
                          >
                            ${product?.price?.toFixed(2)}/{product?.pricePer}
                          </Text>
                          <EditableRichText
                            value={product?.marketingDescription}
                            isEditable={false}
                            textStyle=""
                          ></EditableRichText>
                        </Body>
                      </CardItem>
                    </Card>
                  </TouchableOpacity>
                );
              }
            )}
          </Content>
        </>
      </JCModal>
    );
  }

  async makePayment(
    stripe: Stripe | null,
    elements: StripeElements | null
  ): Promise<void> {
    this.setState({ processing: "processing" }, async () => {
      await this.createStripeUser();
      let priceItems = this.getPriceItems();
      try {
        const status = await new HandleStripePayment().handleSubmit(
          stripe,
          elements,
          this.state.idempotency,
          priceItems,
          () => {
            this.setState({ processing: "complete" });
          }
        );
        console.log(status);
      } catch (e) {
        console.log({ "Payment Error": e });
      }
    });
  }
  removeProduct(index: number) {
    const temp = this.state.currentProduct;
    const temp2 = this.state.quantities;
    temp?.splice(index);
    temp2.splice(index);
    this.setState(
      {
        currentProduct: temp,
        quantities: temp2,
        invoice: null,
      },
      () => {
        this.createInvoice();
      }
    );
  }
  updateQuantity(index: number, index2: number, value) {
    const temp = this.state.quantities;
    temp[index][index2] = value;
    this.setState(
      {
        quantities: temp,
        invoice: null,
      },
      () => {
        this.createInvoice();
      }
    );
  }
  renderProduct(item, index: number) {
    return (
      <View
        key={index}
        style={{
          borderWidth: 1,
          borderStyle: "solid",
          borderRadius: 4,
          borderColor: "rgba(51, 51, 51, 0.1)",
          shadowColor: "rgba(0, 0, 0, 0.45)",
          padding: 25,
          shadowOffset: { width: 5, height: 5 },
          shadowRadius: 30,
        }}
      >
        <Text
          style={{
            alignSelf: "flex-start",
            fontFamily: "Graphik-Bold-App",
            paddingRight: 0,
            fontSize: 20,
          }}
        >
          {item.name}
        </Text>
        <TouchableOpacity
          style={{ alignSelf: "flex-end" }}
          onPress={() => {
            this.removeProduct(index);
          }}
        >
          <AntDesign name="close" size={20} color="black" />
        </TouchableOpacity>

        <Text
          style={{
            fontFamily: "Graphik-Bold-App",
            color: "#F0493E",
          }}
        >
          ${item.price.toFixed(2)}/{item.pricePer}
        </Text>
        {!item.stripeIsTiered
          ? item.tiered.map((item, index2: number) => {
              return (
                <>
                  <Text>{item.name}</Text>
                  <EditableText
                    placeholder="Quantity"
                    multiline={false}
                    data-testid="course-weekTitle"
                    textStyle={
                      this.styles.style.fontFormSmallDarkGreyCourseTopEditable
                    }
                    inputStyle={{
                      borderWidth: 1,
                      borderColor: "#dddddd",
                      marginTop: 5,
                      marginBottom: 5,
                      width: "20%",
                      paddingTop: 5,
                      paddingRight: 5,
                      paddingBottom: 5,
                      paddingLeft: 5,
                      fontFamily: "Graphik-Regular-App",
                      fontSize: 10,
                      lineHeight: 15,
                    }}
                    onChange={(value) => {
                      this.updateQuantity(index, index2, value);
                    }}
                    value={this.state.quantities[index][index2].toString()}
                    isEditable={true}
                  ></EditableText>
                </>
              );
            })
          : null}
        {/*
            <EditableRichText
              value={item.marketingDescription}
              isEditable={false}
              textStyle=""
            ></EditableRichText>
            */}
      </View>
    );
  }
  showSubscriptionSelector() {
    this.setState({ showSubscriptionSelector: true });
  }
  async handleInputChange(value: string, field: string) {
    console.log({ field: value });
    console.log(this.state.userData);
    try {
      if (this.state.userData.billingAddress == null) {
        const user = await API.graphql(
          graphqlOperation(mutations.updateUser, {
            input: {
              id: this.state.userData.id,
              billingAddress: {
                country: "",
                line1: "",
                line2: "",
                state: "",
                postal_code: "",
                city: "",
              },
            },
          })
        );
        this.setState({ userData: user.data.updateUser }, async () => {
          await this.handleInputChange(value, field);
        });
      } else {
        let temp = this.state.userData;
        temp.billingAddress[field] = value;
        const user = await API.graphql(
          graphqlOperation(mutations.updateUser, {
            input: {
              id: this.state.userData?.id,
              billingAddress: temp.billingAddress,
            },
          })
        );

        this.setState({ userData: temp });
      }
    } catch (e) {
      console.log({ errorupdating: e });
    }
  }
  isMakePaymentEnabled(): boolean {
    const billingAddress = this.state.userData?.billingAddress;
    if (!billingAddress) return false;
    if (!billingAddress.line1) return false;
    if (!billingAddress.line2) return false;
    if (!billingAddress.state) return false;
    if (!billingAddress.country) return false;
    if (!billingAddress.city) return false;
    if (!billingAddress.postal_code) return false;
    return (
      this.state.currentProduct.length > 0 &&
      billingAddress.line1.length > 0 &&
      billingAddress.line2?.length > 0 &&
      billingAddress.state?.length > 0 &&
      billingAddress.country?.length > 0 &&
      billingAddress.city?.length > 0 &&
      billingAddress.postal_code?.length > 0
    );
  }
  async completePaymentProcess(actions, state: UserState) {
    await actions.updateGroups();
    console.log({ Groups: state.groups });
    actions.updatePaidState();
  }
  render() {
    return (
      <ElementsConsumer>
        {({ stripe, elements }) => (
          <BillingImpl.UserConsumer>
            {({ userState, userActions }) => {
              if (!userState) return null;
              return this.state.processing == "complete" ? (
                <Content>
                  <View style={this.styles.style.signUpScreen1PaymentColumn1}>
                    <Text
                      style={{
                        fontFamily: "Graphik-Bold-App",
                      }}
                    >
                      Payment Successful
                      <JCButton
                        onPress={() => {
                          this.completePaymentProcess(userActions, userState);
                        }}
                        buttonType={ButtonTypes.TransparentNoPadding}
                      >
                        Continue...
                      </JCButton>
                    </Text>
                  </View>
                </Content>
              ) : (
                <>
                  {this.state.processing == "processing" ? (
                    <Content>
                      <View
                        style={this.styles.style.signUpScreen1PaymentColumn1}
                      >
                        <Text
                          style={{
                            fontFamily: "Graphik-Bold-App",
                          }}
                        >
                          Processing Payment
                        </Text>
                        <ActivityIndicator />
                      </View>
                    </Content>
                  ) : null}

                  <Content
                    style={{
                      display:
                        this.state.processing == "entry" ? "flex" : "none",
                    }}
                  >
                    <View style={this.styles.style.signUpScreen1PaymentColumn1}>
                      <Text
                        style={{
                          fontFamily: "Graphik-Bold-App",
                        }}
                      >
                        Billing Information
                      </Text>
                      {this.state.userData && (
                        <>
                          <Label style={this.styles.style.fontFormSmall}>
                            <Text style={this.styles.style.fontFormMandatory}>
                              *
                            </Text>
                            Billing Line 1
                          </Label>

                          <EditableText
                            onChange={(e) => {
                              this.handleInputChange(e, "line1");
                            }}
                            multiline={false}
                            data-testid="profile-currentRole"
                            textStyle={this.styles.style.fontFormSmallDarkGrey}
                            inputStyle={{
                              borderWidth: 1,
                              borderColor: "#dddddd",
                              width: "100%",
                              marginBottom: 15,
                              paddingTop: 10,
                              paddingRight: 10,
                              paddingBottom: 10,
                              paddingLeft: 10,
                              fontFamily: "Graphik-Regular-App",
                              fontSize: 16,
                              lineHeight: 28,
                            }}
                            value={
                              this.state.userData.billingAddress?.line1
                                ? this.state.userData.billingAddress?.line1
                                : ""
                            }
                            isEditable={true}
                          ></EditableText>
                          <Label style={this.styles.style.fontFormSmall}>
                            <Text style={this.styles.style.fontFormMandatory}>
                              *
                            </Text>
                            Billing Line 2
                          </Label>

                          <EditableText
                            onChange={(e) => {
                              this.handleInputChange(e, "line2");
                            }}
                            multiline={false}
                            data-testid="profile-currentRole"
                            textStyle={this.styles.style.fontFormSmallDarkGrey}
                            inputStyle={{
                              borderWidth: 1,
                              borderColor: "#dddddd",
                              width: "100%",
                              marginBottom: 15,
                              paddingTop: 10,
                              paddingRight: 10,
                              paddingBottom: 10,
                              paddingLeft: 10,
                              fontFamily: "Graphik-Regular-App",
                              fontSize: 16,
                              lineHeight: 28,
                            }}
                            value={
                              this.state.userData.billingAddress?.line2
                                ? this.state.userData.billingAddress?.line2
                                : ""
                            }
                            isEditable={true}
                          ></EditableText>
                          <Label style={this.styles.style.fontFormSmall}>
                            <Text style={this.styles.style.fontFormMandatory}>
                              *
                            </Text>
                            City
                          </Label>

                          <EditableText
                            onChange={(e) => {
                              this.handleInputChange(e, "city");
                            }}
                            multiline={false}
                            data-testid="profile-currentRole"
                            textStyle={this.styles.style.fontFormSmallDarkGrey}
                            inputStyle={{
                              borderWidth: 1,
                              borderColor: "#dddddd",
                              width: "100%",
                              marginBottom: 15,
                              paddingTop: 10,
                              paddingRight: 10,
                              paddingBottom: 10,
                              paddingLeft: 10,
                              fontFamily: "Graphik-Regular-App",
                              fontSize: 16,
                              lineHeight: 28,
                            }}
                            value={
                              this.state.userData.billingAddress?.city
                                ? this.state.userData.billingAddress?.city
                                : ""
                            }
                            isEditable={true}
                          ></EditableText>
                          <Label style={this.styles.style.fontFormSmall}>
                            <Text style={this.styles.style.fontFormMandatory}>
                              *
                            </Text>
                            State/Province
                          </Label>

                          <EditableText
                            onChange={(e) => {
                              this.handleInputChange(e, "state");
                            }}
                            multiline={false}
                            data-testid="profile-currentRole"
                            textStyle={this.styles.style.fontFormSmallDarkGrey}
                            inputStyle={{
                              borderWidth: 1,
                              borderColor: "#dddddd",
                              width: "100%",
                              marginBottom: 15,
                              paddingTop: 10,
                              paddingRight: 10,
                              paddingBottom: 10,
                              paddingLeft: 10,
                              fontFamily: "Graphik-Regular-App",
                              fontSize: 16,
                              lineHeight: 28,
                            }}
                            value={
                              this.state.userData.billingAddress?.state
                                ? this.state.userData.billingAddress?.state
                                : ""
                            }
                            isEditable={true}
                          ></EditableText>
                          <Label style={this.styles.style.fontFormSmall}>
                            <Text style={this.styles.style.fontFormMandatory}>
                              *
                            </Text>
                            Country
                          </Label>

                          <EditableText
                            onChange={(e) => {
                              this.handleInputChange(e, "country");
                            }}
                            multiline={false}
                            data-testid="profile-currentRole"
                            textStyle={this.styles.style.fontFormSmallDarkGrey}
                            inputStyle={{
                              borderWidth: 1,
                              borderColor: "#dddddd",
                              width: "100%",
                              marginBottom: 15,
                              paddingTop: 10,
                              paddingRight: 10,
                              paddingBottom: 10,
                              paddingLeft: 10,
                              fontFamily: "Graphik-Regular-App",
                              fontSize: 16,
                              lineHeight: 28,
                            }}
                            value={
                              this.state.userData.billingAddress?.country
                                ? this.state.userData.billingAddress?.country
                                : ""
                            }
                            isEditable={true}
                          ></EditableText>
                          <Label style={this.styles.style.fontFormSmall}>
                            <Text style={this.styles.style.fontFormMandatory}>
                              *
                            </Text>
                            Zip/Postal Code
                          </Label>

                          <EditableText
                            onChange={(e) => {
                              this.handleInputChange(e, "postal_code");
                            }}
                            multiline={false}
                            data-testid="profile-currentRole"
                            textStyle={this.styles.style.fontFormSmallDarkGrey}
                            inputStyle={{
                              borderWidth: 1,
                              borderColor: "#dddddd",
                              width: "100%",
                              marginBottom: 15,
                              paddingTop: 10,
                              paddingRight: 10,
                              paddingBottom: 10,
                              paddingLeft: 10,
                              fontFamily: "Graphik-Regular-App",
                              fontSize: 16,
                              lineHeight: 28,
                            }}
                            value={
                              this.state.userData.billingAddress?.postal_code
                                ? this.state.userData.billingAddress
                                    ?.postal_code
                                : ""
                            }
                            isEditable={true}
                          ></EditableText>
                        </>
                      )}
                      <div>
                        <br></br>
                        <br></br>
                      </div>
                      <Text style={{ fontFamily: "Graphik-Bold-App" }}>
                        Credit Card Information
                      </Text>
                      <CardNumberElement options={CARD_ELEMENT_OPTIONS} />
                      <CardExpiryElement options={CARD_ELEMENT_OPTIONS} />
                      <CardCvcElement options={CARD_ELEMENT_OPTIONS} />
                    </View>
                    <View style={this.styles.style.signUpScreen1PaymentColumn2}>
                      <JCButton
                        buttonType={ButtonTypes.TransparentNoPadding}
                        onPress={() => {
                          this.showSubscriptionSelector();
                        }}
                      >
                        Add another product
                      </JCButton>
                      {this.state.currentProduct?.map((item, index: number) => {
                        return this.renderProduct(item, index);
                      })}

                      <View style={this.styles.style.flexRow}>
                        <Text
                          style={{
                            fontFamily: "Graphik-Bold-App",
                            paddingTop: 10,
                            paddingBottom: 10,
                            paddingLeft: 45,
                            paddingRight: 145,
                          }}
                        >
                          Total
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Graphik-Bold-App",
                            paddingTop: 10,
                            paddingBottom: 10,
                          }}
                        >
                          {this.state.invoice
                            ? "$" + (this.state.invoice.total / 100).toFixed(2)
                            : "Processing..."}
                        </Text>
                      </View>

                      <JCButton
                        buttonType={ButtonTypes.Solid}
                        onPress={() => {
                          this.makePayment(stripe, elements);
                        }}
                        enabled={this.isMakePaymentEnabled()}
                      >
                        Process Payment
                      </JCButton>
                    </View>
                  </Content>
                  {this.renderAddProductModal()}
                </>
              );
            }}
          </BillingImpl.UserConsumer>
        )}
      </ElementsConsumer>
    );
  }
}

export default function Billing(props: Props): JSX.Element {
  const route = useRoute();
  const navigation = useNavigation();
  const [stripePromise, setStripePromise] = useState(() =>
    loadStripe(
      "pk_test_51HlyrYLTzrDhiQ921sERNUY2GQBDgpHDOUYMiNZ0lTeTsse9u8oQoBfLg6UzWaxcNkYhek4tkNWILTlAiajet27k00FFv6z0RB"
    )
  );
  return (
    <Elements stripe={stripePromise}>
      <BillingImpl {...props} navigation={navigation} route={route} />
    </Elements>
  );
}