import { Camera, } from "expo-camera";
import { Image, StyleSheet, Text, View } from "react-native";
import * as MediaLibrary from "expo-media-library";
import { useState, useRef, useEffect } from "react";
import usePermission from "./src/usePermisson";
import Button from "./src/components/Button";
import Timer from "./src/components/Timer";

export default function App() {
  const hasCameraPermissions = usePermission(Camera);
  const [type, setType] = useState(Camera.Constants.Type.front);
  const cameraRef = useRef();
  const [image, setImage] = useState(null);
  const [timerClicked, setTimerClicked] = useState(false);
  const [timer, setTimer] = useState(0);
  const [displayTimer, setDisplayTimer] = useState(timer);
  const [timerOn, setTimerOn] = useState(false);

  const takePicture = async () => {
    setTimerOn(true);
    setTimeout(async function () {
      if (cameraRef) {
        try {
          const data = await cameraRef.current.takePictureAsync();
          setImage(data.uri);
          setTimerOn(false);
        } catch (error) {
          console.log(error);
        }
      }
    }, timer * 1000);
  };

  useEffect(() => {
    if (!timerOn) {
      return;
    }
    setDisplayTimer(timer);

    const interval = setInterval(() => {
      setDisplayTimer((prevTimer) =>
        prevTimer > 0 ? prevTimer - 1 : clearInterval(interval)
      );
    }, 1000);
  }, [timerOn, setTimerOn, timer]);

  const savePicture = async () => {
    if (image) {
      try {
        const asset = await MediaLibrary.createAssetAsync(image);
        alert("Image saved!");
        setImage(null);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const onPressTimerItem = (time) => {
    setTimerClicked((prevState) => !prevState);
    setTimer(time);
  };

  if (hasCameraPermissions === false) {
    return <Text>No permission to access camera</Text>;
  }

  return (
    <View style={styles.container}>
      {timerClicked && <Timer onPress={onPressTimerItem} />}
      {!image ? (
        <Camera style={styles.camera} type={type} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <Button
              icon={"retweet"}
              title="Flip"
              onPress={() =>
                setType(
                  type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back
                )
              }
              color="#f1f1f1"
            />
            <View style={styles.timerContainer}>
              <Button
                icon={"back-in-time"}
                title="Timer"
                onPress={() => setTimerClicked((prevState) => !prevState)}
              />
              <Text style={styles.timerText}>{timer}s</Text>
            </View>
          </View>
          {timerOn && (
            <Text style={styles.displayTimerText}>{displayTimer}s</Text>
          )}
        </Camera>
      ) : (
        <Image style={styles.camera} source={{ uri: image }} />
      )}

      <View>
        {image ? (
          <View style={styles.takenImage}>
            <Button
              title={"Re-take"}
              icon="retweet"
              onPress={() => setImage(null)}
            />
            <Button title={"Save"} icon="check" onPress={savePicture} />
          </View>
        ) : (
          <Button title={"Photo"} icon={"camera"} onPress={takePicture} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    paddingBottom: 20,
  },
  camera: {
    flex: 1,
    position: "relative",
  },
  takenImage: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 50,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    color: "#f1f1f1",
    fontSize: 16,
    marginLeft: 10,
  },
  displayTimerText: {
    color: "#f1f1f1",
    fontSize: 50,
    fontWeight: "bold",
    textAlign: "center",
  },
});

