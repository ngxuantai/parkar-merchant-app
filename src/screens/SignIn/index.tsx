import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppButton from "@src/components/common/AppButton";
import { Colors } from "@src/constants";
import { useAppDispatch, useAppSelector } from "@src/store/hooks";
import { AuthAction } from "@src/store/slices/authSlice";
import { Formik, FormikProps } from "formik";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationScreenProp } from "react-navigation";
import * as Yup from "yup";

type Props = {
  navigation: NavigationScreenProp<any, any>;
};
type LoginValue = {
  email: string;
  password: string;
};

const SignIn = (props: Props) => {
  const [isRemember, setIsRemember] = useState(true);
  const [hidePassword, setHidePassword] = useState(true);
  const dispatch = useAppDispatch();
  const formikRef = useRef<FormikProps<LoginValue>>();
  console.log("FormikRef", formikRef.current);
  const [isLoading, setIsLoading] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .required("Please enter email!")
      .email("Email invalid!")
      .nullable(),
    password: Yup.string().required("Please enter password").nullable(),
  });

  const toggleSwitch = async () =>
    setIsRemember((previousState) => !previousState);

  const login = async (values: any) => {
    try {
      setIsLoading(true);
      const result = await dispatch(
        AuthAction.login({
          email: values.email,
          password: values.password,
        }),
      ).unwrap();

      setIsLoading(false);
      console.log(result);
      if (result.error) {
        Alert.alert(`${result.error}`);
        return;
      }

      if (isRemember) {
        await AsyncStorage.setItem("email", values.email);
        await AsyncStorage.setItem("password", values.password);
      } else {
        await AsyncStorage.removeItem("email");
        await AsyncStorage.removeItem("password");
      }
      props.navigation.navigate("App");
    } catch (error: any) {
      setIsLoading(false);
      console.log("Login er ror", error);
      Alert.alert("Error");
    }
  };

  useEffect(() => {
    const saveIntoAsyncStorage = async () => {
      if (formikRef.current) {
        const email = await AsyncStorage.getItem("email");
        console.log("Email from storage", email);
        const password = await AsyncStorage.getItem("password");
        formikRef.current.setFieldValue("email", email);
        formikRef.current.setFieldValue("password", password);
      }
    };
    saveIntoAsyncStorage();
  }, [formikRef]);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <View style={{ height: "20%", justifyContent: "center" }}>
          <Text style={styles.title}>Sign in</Text>
        </View>
        <Formik
          innerRef={formikRef}
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={(values) => login(values)}>
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <View style={styles.controller}>
              <View style={styles.containerInput}>
                <View style={styles.groupInput}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={22}
                    color={Colors.light.text}
                  />
                  <TextInput
                    placeholder="parka@gmail.com"
                    onChangeText={handleChange("email")}
                    value={values.email}
                    style={styles.input}
                  />
                  <View style={{ width: 22 }} />
                </View>
                {errors.email && touched.email && (
                  <Text style={styles.validateError}>* {errors.email}</Text>
                )}
                <View style={styles.groupInput}>
                  <MaterialCommunityIcons
                    name="key-outline"
                    size={22}
                    color={Colors.light.text}
                  />
                  <TextInput
                    placeholder="Mật khẩu"
                    onChangeText={handleChange("password")}
                    value={values.password}
                    style={styles.input}
                    secureTextEntry={hidePassword}
                  />
                  <Octicons
                    name={hidePassword ? "eye-closed" : "eye"}
                    size={22}
                    color={Colors.light.text}
                    onPress={() => setHidePassword(!hidePassword)}
                  />
                </View>
                {errors.password && touched.password && (
                  <Text style={styles.validateError}>* {errors.password}</Text>
                )}
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  alignItems: "center",
                  marginTop: 10,
                  marginBottom: 20,
                }}>
                <Switch
                  trackColor={{
                    false: "#FFF",
                    true: Colors.light.tabIconSelected,
                  }}
                  thumbColor={isRemember ? "#FFF" : "#8F8F9D"}
                  onValueChange={toggleSwitch}
                  value={isRemember}
                  style={styles.switch}
                />
                <Text
                  style={{
                    color: Colors.light.text,
                    marginLeft: 5,
                  }}>
                  Remember me
                </Text>
              </View>
              <AppButton
                style={styles.btnSignIn}
                isLoading={isLoading}
                onPress={handleSubmit}>
                <Text
                  style={{ fontSize: 22, fontWeight: "600", color: "white" }}>
                  Sign in
                </Text>
              </AppButton>
            </View>
          )}
        </Formik>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.primary,
    height: "100%",
    alignItems: "center",
  },
  controller: {
    height: "80%",
    width: "100%",
    paddingLeft: 50,
    paddingRight: 50,
    paddingTop: 50,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: "center",
  },
  containerInput: {
    width: "100%",
  },
  groupInput: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: "#90A3BC",
  },
  input: {
    flex: 1,
    height: 50,
    marginLeft: 10,
    marginRight: 10,
    color: Colors.light.text,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFF",
  },
  btnSignIn: {
    height: 50,
    width: "100%",
    justifyContent: "center",
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.8 }],
    paddingLeft: 0,
    marginLeft: 0,
    marginTop: 5,
  },
  validateError: {
    color: "red",
    fontSize: 14,
    marginTop: 2,
    marginBottom: -12,
  },
});
export default SignIn;
