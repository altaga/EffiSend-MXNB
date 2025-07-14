import { CameraView } from "expo-camera";
import React, { Component, createRef } from "react";
import { isValidUUID } from "../core/utils";

export default class CamQR extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scanning: true,
    };
    this.data = createRef(null);
  }

  handleBarcodeScanned = (result) => {
    let temp = result.data;
    console.log(temp);
    if (isValidUUID(temp) && this.state.scanning) {
      this.setState(
        {
          scanning: false,
        },
        () => {
          this.props.callbackAddress(temp);
        }
      );
    }
  };

  render() {
    return (
      <React.Fragment>
        <CameraView
          facing={this.props.facing}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={this.handleBarcodeScanned}
          style={{ height: "100%", width: "100%" }}
        />
      </React.Fragment>
    );
  }
}
