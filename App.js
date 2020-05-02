import React, { useEffect, useState } from "react";
import { View, Button, Alert, Image, Text, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import * as firebase from "firebase";

export default function App() {
  const firebaseConfig = {
    apiKey: "AIzaSyDtONWGBmy7cuH7Y1t2y3yADa_R_5yCtkU",
    projectId: "reactnative-275502",
    authDomain: "reactnative-275502.firebaseapp.com",
    databaseURL: "https://reactnative-275502.firebaseio.com/",
    storageBucket: "reactnative-275502.appspot.com",
  };
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  useEffect(() => {
    console.disableYellowBox = true;
    getPermission();
  }, []);

  const [file, setFile] = useState({
    image: null,
    url: null,
    text: "",
  });

  async function getPermission() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status !== "granted") {
      Alert.alert("Sorry, we need camera roll permissions to make this work!");
    }
  }

  async function pickImageFromCamera() {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.cancelled) {
        uploadImageAsync(result.uri);
        setFile({ image: result.uri });
      }
    } catch (E) {}
  }

  async function uploadImageAsync(uri) {
    try {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const ref = firebase.storage().ref(new Date() + ".png");
      const snapshot = await ref.put(blob);
      setFile({
        url: snapshot.ref.getDownloadURL(),
      });
      blob.close();
      return await snapshot.ref.getDownloadURL();
    } catch (error) {}
  }

  async function pickGallery() {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.cancelled) {
        uploadImageAsync(result.uri);
        setFile({ image: result.uri });
      }
    } catch (E) {}
  }

  async function showURL() {
    setFile({
      text: file.url.i,
    });
  }

  return (
    <View>
      <Text style={styles.txtTitle}>DEMO FIREBASE STORAGE</Text>
      <Image
        style={styles.image}
        source={{ uri: file.image }}
        resizeMode="contain"
      />
      <Button
        color="#F00"
        title="Pick image from Camera"
        onPress={pickImageFromCamera}
      />
      <Button title="Pick image from Gallery" onPress={pickGallery} />
      <Button color="#F0F" title="Show Download URL" onPress={showURL} />
      <Text>{file.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", height: 200 },
  txtTitle: {
    fontSize: 18,
    color: "#F00",
  },
});
