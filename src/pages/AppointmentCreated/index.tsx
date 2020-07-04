import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import  Icon from 'react-native-vector-icons/Feather';

import {
  Container,
  Title,
  Description,
  OKButton,
  OKButtonText,
} from './styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'

interface RouteParams {
  date: number;
  provider_name: string;
}

const AppointmentCreated: React.FC = () => {

  const { reset } = useNavigation();
  const { params } = useRoute();

  const { date, provider_name} = params as RouteParams;

  const formatedDescription = useMemo(() => {
    return format(date, "EEEE', dia' dd 'de' MMMM 'de' yyyy 'às' HH:mm'h'", {locale: ptBR})
  }, [date, provider_name]);

  const handleOKPressed = useCallback(() => {
    reset({
      routes: [
        {name: 'Dashboard'}
      ],
      index: 0,
    });
  }, [reset]);

  return <Container>
    <Icon name="check" size={80} color='#04d361'></Icon>
    <Title>Agendamento Concluído</Title>
    <Description>
      {formatedDescription}
    </Description>
    <OKButton onPress={handleOKPressed}>
      <OKButtonText>OK</OKButtonText>
    </OKButton>
  </Container>;
};

export default AppointmentCreated;
