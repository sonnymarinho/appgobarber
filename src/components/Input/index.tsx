import React from 'react';
import { TextProperties } from 'react-native';

import { Container, TextInput, Icon } from './styles';

interface InputProps extends TextProperties {
  name: string;
  icon: string;
  placeholder: string;
}

const Input: React.FC<InputProps> = ({ name, icon, ...rest }) => {
  return (
    <>
      <Container>
        <Icon name={icon} size={20} color="#666360" />
        <TextInput placeholderTextColor="#666360" {...rest} />
      </Container>
    </>
  );
};

export default Input;
