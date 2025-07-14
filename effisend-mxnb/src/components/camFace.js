import { CameraView } from "expo-camera";
import { ImageManipulator } from "expo-image-manipulator";
import React, { Component, createRef } from "react";
import { Alert } from "react-native";

export default class CamFace extends Component {
  constructor(props) {
    super(props);
    this.state = {
      take: false,
      cameraReady: false,
    };
    this.data = createRef(null);
    this.camera;
  }

  async takePicture() {
    const options = {
      quality: 1,
      base64: true,
    };
    const {
      base64: preImage,
      width,
      height,
    } = await this.camera.takePictureAsync(options);
    let image;
    if (width > 512 || height > 512) {
      const resizeOption = width > height ? { width: 512 } : { height: 512 };
      const render = await ImageManipulator.manipulate(preImage)
        .resize(resizeOption)
        .renderAsync();
      const { base64: imagePost } = await render.saveAsync({
        base64: true,
        format: "jpeg",
      });
      image = `${imagePost}`;
    } else {
      image = `${preImage.replace(/^data:image\/[a-z]+;base64,/, "")}`;
    }
    this.props.onImage(image);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.take !== this.props.take && this.props.take && this.state.cameraReady) {
      this.takePicture();
    }
  }

  render() {
    return (
      <React.Fragment>
        <CameraView
          onCameraReady={() => this.setState({ cameraReady: true })}
          ratio={"1:1"}
          facing={this.props.facing}
          ref={(ref) => (this.camera = ref)}
          style={{ height: "100%", width: "100%" }}
        />
      </React.Fragment>
    );
  }
}
