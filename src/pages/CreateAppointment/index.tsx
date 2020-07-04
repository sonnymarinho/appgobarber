import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { View, Platform, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,
  Content,
  ProvidersList,
  ProvidersListContainer,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
} from './styles';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api.client';

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

interface RouteParams {
  providerId: string;
}

interface AvailabilityItem {
  hour: number;
  available: boolean;
}


const CreateAppointment: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const route = useRoute();
  const { user } = useAuth();
  const { goBack, navigate } = useNavigation();
  const routeParams = route.params as RouteParams;
  const [ selectedProvider, setSelectedProvider ] = useState(routeParams.providerId);
  const [ showDatePicker, setShowDatePicker ] = useState(false);
  const [ selectedDate, setSelectedDate ] = useState(new Date());
  const [ selectedHour, setSelectedHour ] = useState(0);
  const [availability, setAvailability] = useState<AvailabilityItem[]>([])



  useEffect(() => {
    api.get('/providers').then(response => {
      setProviders(response.data);
    });

  }, [setProviders]);

  useEffect(() => {
    api.get(`/providers/${selectedProvider}/day-availability`, {
      params: {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1,
        day: selectedDate.getDate(),
      }
    }).then(response => {
      setAvailability(response.data);
    });

  }, [selectedDate, selectedProvider]);

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleToggleDatePicker = useCallback(()=> {
    setShowDatePicker(!showDatePicker);
  }, []);

  const handleDateChange = useCallback((event: any, date: Date | undefined) => {
    if (Platform.OS === 'android'){
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
    }

  }, [])

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate);
      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('appointments', {
        provider_id: selectedProvider,
        date,
      });

      navigate('AppointmentCreated', { date: date.getTime()})

    } catch (err) {
      Alert.alert(
        'Erro',
        'Ocorreu um erro ao tentar criar o agendamento',
      );
    }
  }, [navigate, selectedDate, selectedProvider, selectedHour]);

  const morningAvailability = useMemo(() => {
    return availability
    .filter(({ hour }) => hour < 12 )
    .map(({ hour, available })=>{
      return {
        hour,
        available,
        hourFormatted: format(new Date().setHours(hour), 'HH:00')
      }
    })
  }, [availability]);

  const afternoonAvailability = useMemo(() => {
    return availability
    .filter(({ hour }) => hour >= 12 )
    .map(({ hour, available })=>{
      return {
        hour,
        available,
        hourFormatted: format(new Date().setHours(hour), 'HH:00')
      }
    })
  }, [availability]);

  return <Container>
    <Header>
      <BackButton onPress={navigateBack}>
        <Icon name="chevron-left" size={24} color="#999591"></Icon>
      </BackButton>
      <HeaderTitle>Cabeleireiros</HeaderTitle>
      <UserAvatar source={{uri: user.avatar_url}}/>
    </Header>

    <Content>

    <ProvidersListContainer>

<ProvidersList
  horizontal
  showsHorizontalScrollIndicator={false}
  data={providers}
  keyExtractor={provider => provider.id}
  renderItem={({item: provider}) => (
    <ProviderContainer
      key={provider.id}
      onPress={() => {handleSelectProvider(provider.id)}}
      selected={provider.id === selectedProvider}
    >
      <ProviderAvatar source={{  uri: provider.avatar_url===null ? `https://api.adorable.io/avatars/285/${provider.name}@adorable.png` : provider.avatar_url }}/>
      <ProviderName selected={provider.id === selectedProvider}>{provider.name}</ProviderName>
    </ProviderContainer>
)}/>
</ProvidersListContainer>

  <Calendar>
    <Title>Escolha a data</Title>

    <OpenDatePickerButton onPress={handleToggleDatePicker}>
      <OpenDatePickerButtonText>Selecionar outra data</OpenDatePickerButtonText>
    </OpenDatePickerButton>
    {
      showDatePicker &&
            <DateTimePicker
            mode="date"
            display="calendar"
            onChange={handleDateChange}
            textColor="#f4ede8"
            value={selectedDate}/>

    }
    </Calendar>

    <Schedule>
      <Title>Escolha o horário</Title>
      <Section>
        <SectionTitle>Manhã</SectionTitle>
        <SectionContent>
          {morningAvailability.map(({ hour, hourFormatted, available }) => (
            <Hour
              key={hourFormatted}
              selected={selectedHour === hour}
              enabled={available}
              onPress={() => handleSelectHour(hour)}
              available={available}
            >
              <HourText selected={selectedHour === hour} >{hourFormatted}</HourText>
            </Hour>
          ))}
        </SectionContent>
        <SectionTitle>Tarde</SectionTitle>
        <SectionContent>
          {afternoonAvailability.map(({ hour, hourFormatted, available }) => (
            <Hour
              key={hourFormatted}
              selected={selectedHour === hour}
              enabled={available}
              onPress={() => handleSelectHour(hour)}
              available={available}
            >
            <HourText selected={selectedHour === hour} >{hourFormatted}</HourText>
          </Hour>
          ))}
        </SectionContent>
      </Section>
    </Schedule>

    <CreateAppointmentButton onPress={handleCreateAppointment}>
      <CreateAppointmentButtonText>Agendar</CreateAppointmentButtonText>
    </CreateAppointmentButton>

    </Content>

    </Container>
};

export default CreateAppointment;
