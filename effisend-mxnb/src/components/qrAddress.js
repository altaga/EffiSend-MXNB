import { Component } from 'react';
import QRCodeStyled from 'react-native-qrcode-styled';
import { normalizeFontSize } from '../core/utils';

export default class QrAddress extends Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps){
    if(prevProps.address !== this.props.address){
      console.log(this.props.address);
      this.forceUpdate();
    }
  }
  render() {
    return (
      <QRCodeStyled
        data={this.props.address}
        style={[
          {
            backgroundColor: 'white',
            borderRadius: 10,
          },
        ]}
        errorCorrectionLevel="H"
        padding={16}
        pieceSize={normalizeFontSize(7)}
        pieceBorderRadius={4}
        isPiecesGlued
        color={'black'}
      />
    );
  }
}
