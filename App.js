//  App.js - Aplicativo de Agendamento e Acompanhamento de Serviços
//  Desenvolvido para a Dominus Tech, especializada em assistência técnica e venda de celulares.
//  Funcionalidades:
//  - Tela de Login/Cadastro com validação de email e senha.
//  - Tela de Acompanhamento de Serviços agendados, exibindo data e hora formatadas.
//  - Tela de Agendamento com seleção de serviço, data e horário, e confirmação via WhatsApp.
//  - Armazenamento local usando AsyncStorage, com chaves específicas para cada usuário.
//  - Navegação entre telas usando React Navigation.
 
//   Observações:
//  - O número do WhatsApp para contato é definido na constante ADMIN_WHATSAPP_NUMBER.
//  - O aplicativo é estilizado com um tema escuro e moderno, utilizando verde neon para destaques.

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const ADMIN_WHATSAPP_NUMBER = '5561-99999-9999'; // Substitua pelo número real da empresa (com código do país, sem espaços ou traços)


/* ------------------ TELA DE LOGIN ------------------ */

function LoginScreen({ setIsLogged }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [modoCadastro, setModoCadastro] = useState(false);

  // --- FUNÇÃO PARA VALIDAR O FORMATO DO E-MAIL ---
    const validarEmail = (email) => {
      // Regex simples para validar email: texto + @ + texto + . + texto
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };

  const handleLogin = async () => {
  if (!email || !senha) return alert('Preencha todos os campos!');

      // Verifica se o formato do email é válido antes de buscar no banco
      if (!validarEmail(email)) {
        return alert('Formato de e-mail inválido. Verifique se digitou corretamente.');
      }

    // 1. Tenta buscar um usuário com base no email fornecido
    const userKey = `user_${email}`;
    const savedUser = await AsyncStorage.getItem(userKey);

    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.email === email && user.senha === senha) {
        await AsyncStorage.setItem('currentUserEmail', email);
        setIsLogged(true);
      } else {
        alert('Usuário ou senha incorretos.');
      }
    } else {
      alert('Usuário ou senha incorretos.');
    }
  };

  const handleCadastro = async () => {
    if (!email || !senha) return alert('Preencha todos os campos!');

    //Validação de email
        if (!validarEmail(email)) {
          return alert('Por favor, insira um e-mail válido (ex: nome@dominio.com)');
        }

        //Validação de tamanho de senha
        if (senha.length < 6) {
          return alert('A senha deve ter pelo menos 6 caracteres.');
        }

    // 1. Verifica se um usuário com este email já existe
    const userKey = `user_${email}`;
    const existingUser = await AsyncStorage.getItem(userKey);

    if (existingUser) {
      alert('Este e-mail já está cadastrado. Faça login.');
      setModoCadastro(false);
      return;
    }
    // 2. Cria e salva o novo usuário na sua própria chave
    const newUser = { email, senha };
    await AsyncStorage.setItem(userKey, JSON.stringify(newUser));
    // 3. Limpa agendamentos antigos (se houver algum global por engano) e já loga o usuário novo
    await AsyncStorage.removeItem('agendamentos');
    await AsyncStorage.setItem('currentUserEmail', email);

    alert('Cadastro realizado com sucesso!');
    setIsLogged(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dominus Tech</Text>
      <Text style={styles.tag}>Assistência & Soluções Inteligentes</Text>
      <Text style={styles.subtitle}>
        {modoCadastro ? 'Crie sua conta e comece agora' : 'Acesse sua conta:'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={(text) => setEmail(text.toLowerCase().trim())} // .trim remove espaços vazios
        autoCapitalize="none"
        keyboardType="email-address"//muda o teclado para facilitar digitar @
      />
      <TextInput
        style={styles.input}
        placeholder="Digite sua senha"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={modoCadastro ? handleCadastro : handleLogin}>
        <Text style={styles.buttonText}>
          {modoCadastro ? 'Criar conta' : 'Acessar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setModoCadastro(!modoCadastro)}>
        <Text style={styles.toggleText}>
          {modoCadastro
            ? 'Já possui conta? Faça login'
            : 'Ainda não possui conta? Cadastre-se'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------- TELA DE ACOMPANHAMENTO ---------- */

function ServicesScreen() {
  const [agendamentos, setAgendamentos] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchAgendamentos = async () => {
        console.log('--- BUSCANDO AGENDAMENTOS ---');
        const email = await AsyncStorage.getItem('currentUserEmail');
        if (!email) {
          console.log('Busca falhou: Nenhum email de usuário encontrado.');
          return;
        }
        const storageKey = `agendamentos_${email}`;
        console.log('Chave de busca:', storageKey);

        const data = await AsyncStorage.getItem(storageKey);
        console.log('Dados brutos encontrados:', data);

        if (data) {
          setAgendamentos(JSON.parse(data));
          console.log('Dados atualizados no estado.');
        } else {
          setAgendamentos([]);
          console.log('Nenhum dado encontrado, estado definido como [].');
        }
      };

      fetchAgendamentos();
    }, [])
  );

  return (
    <View style={styles.containerTab}>
      <Text style={styles.title}>Acompanhamento de Serviços</Text>
      {agendamentos.length === 0 ? (
        <Text style={styles.text1}>Você ainda não possui serviços agendados.</Text>
      ) : (
        <FlatList
          data={agendamentos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            const agendamentoDate = new Date(item.data);

            if (isNaN(agendamentoDate.getTime())){
              return (
                <View style={styles.listItemContainer}>
                  <View style ={styles.itemContent}>
                
                 <Text style = {styles.text}>
                 • {item.servico} — {item.data} (Horário não informado)
                 </Text>
                </View>

                </View>
              );
            }
            

            const dataFormatada = agendamentoDate.toLocaleDateString("pt-BR");
            const horaFormatada = agendamentoDate.toLocaleTimeString("pt-BR" , { hour: '2-digit', minute: '2-digit'});

            return (
              <View style={styles.listItemContainer}>
                <View style={styles.itemContent}>

              <Text style = {styles.text}>
              • {item.servico} — {dataFormatada} às {horaFormatada}
              </Text>
              </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

/* -------------- TELA DE AGENDAMENTO -------------- */

function ScheduleScreen() {
  const [servico, setServico] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleAgendar = async () => {
    if (!servico) return alert('Escolha o tipo de serviço!');
    if (!date) return alert('Escolha uma data válida!');

    // Bloquear domingo
    if (date.getDay() === 0) return alert('Não atendemos aos domingos.');

    const hora = date.getHours();
    if (hora < 9 || hora >=19) {
      return alert("Horário inválido. Atendemos das 9:00 às 18:30.")
    }

    // 1. Descobre quem está logado
    const email = await AsyncStorage.getItem('currentUserEmail');
    if (!email) return alert('Erro: Usuário não identificado.');

    // 2. Define a chave de armazenamento especifica dele
    const storageKey = `agendamentos_${email}`;

    const newAgendamento = {
      servico,
      data: date.toISOString(),
    };

    // 3. Pega os agendamentos ANTIGOS deste usuário
    const stored = await AsyncStorage.getItem(storageKey);
    const agendamentos = stored ? JSON.parse(stored) : [];

    // 4. Adiciona o novo e salva de volta na chave DELE
    agendamentos.push(newAgendamento);

    console.log('--- SALVANDO AGENDAMENTO ---');
    console.log('Chave de salvamento:', storageKey);
    console.log('Dados salvos:', JSON.stringify(agendamentos));

    await AsyncStorage.setItem(storageKey, JSON.stringify(agendamentos));

    const dataFormatada = date.toLocaleDateString("pt-BR");
    const horaFormatada = date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

    const mensagem = `Olá, Dominus Tech! 👋\n\nDesejo confirmar meu agendamento:\n\n*Serviço:* ${servico}\n*Data:* ${dataFormatada}\n*Horário:* ${horaFormatada}\n\nAgradeço desde já!`;

    const url = `https://api.whatsapp.com/send?phone=${ADMIN_WHATSAPP_NUMBER}&text=${encodeURIComponent(mensagem)}`;

    try {
        // Mandamos abrir direto. Se o app não abrir, o navegador abre.
        await Linking.openURL(url);

        // Limpa os campos (Sucesso)
        setServico('');
        setDate(new Date());

      } catch (error) {
        // Só cai aqui se nem o navegador conseguir abrir o link (muito raro)
        console.error("Erro no Link:", error);
        alert('Agendamento salvo! Erro ao abrir o WhatsApp. Por favor, entre em contato conosco manualmente.');
        setServico('');
        setDate(new Date());
      }
    };

  const onChange = (event, selectedDate) => {
    setShowDatePicker(false);
    setShowTimePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newDate = new Date(selectedDate);
      if (selectedDate.getHours() < 9) {
        selectedDate.setHours(9,0,0);
      } else if (selectedDate.getHours() >= 18){
        selectedDate.setHours(18,30,0);
      }
      setDate(selectedDate);
    }
  };

  // Lógica de limite de horário
  const minTime = new Date(date);
  minTime.setHours(9,0,0);
  const maxTime = new Date(date);
  maxTime.setHours(18,30,0);

  let valorAtual = date;
  if (date < minTime) {
    valorAtual = minTime;
  }else if (date > maxTime){
    valorAtual = maxTime;
  }

  return (
    <View style={styles.containerTab}>
      <Text style={styles.agendamentos}>Agende um serviço</Text>

      {/* Seletor de serviço */}
<View style={styles.pickerContainer}>
  <Picker
    selectedValue={servico}
    onValueChange={(itemValue) => setServico(itemValue)}
    dropdownIconColor="#00FF00"
    style={{ color: '#FFFFFF'}}
  >
    <Picker.Item label="Selecione o tipo de serviço..." value="" />

    {/* SERVIÇOS */}
    <Picker.Item label="─────── SERVIÇOS TÉCNICOS ────────" value="titulo_servicos" enabled={false} color="#228B22" />

    <Picker.Item label="Desbloqueio de aparelho" value="Serviço de desbloqueio de aparelho" color="black" />
    <Picker.Item label="Formatação e limpeza de sistema" value="Serviço de formatação e limpeza de sistema" color="black" />
    <Picker.Item label="Reparo de placa" value="Serviço de reparo de placa" color="black" />
    <Picker.Item label="Atualização de software" value="Serviço de atualização de software" color="black" />

    {/* CELULARES */}
    <Picker.Item label="─────── DISPOSITIVOS MÓVEIS ───────" value="titulo_celulares" enabled={false} color="#228B22" />

    <Picker.Item label="iPhone 11 (64 GB) – R$ 1.199,00" value="Compra de iPhone 11 (64GB " color="black" />
    <Picker.Item label="iPhone 12 (64 GB) – R$ 1.499,00" value="Compra de iPhone 12 (64GB " color="black" />
    <Picker.Item label="iPhone 13 (128 GB) – R$ 2.399,00" value="Compra de iPhone 13 (128GB)" color="black" />
    <Picker.Item label="iPhone 14 (128 GB) – R$ 3.199,00" value="Compra de iPhone 14 (128GB)" color="black" />
    <Picker.Item label="iPhone 15 (128 GB) – R$ 4.299,00" value="Compra de iPhone 15 (128GB)" color="black" />

    <Picker.Item label="Samsung Galaxy S21 (128 GB) – R$ 1.599,00" value="Compra de Galaxy S21 (128GB)" color="black" />
    <Picker.Item label="Samsung Galaxy S22 (128 GB) – R$ 2.199,00" value="Compra de Galaxy S22 (128GB)" color="black" />
    <Picker.Item label="Samsung Galaxy S23 (256 GB) – R$ 3.199,00" value="Compra de Galaxy S23 (256GB)" color="black" />
    <Picker.Item label="Samsung A14 (64 GB) – R$ 699,00" value="Compra de Samsung A14 (64GB)" color="black" />
    <Picker.Item label="Samsung A34 (128 GB) – R$ 999,00" value="Compra de Samsung A34 (128GB)" color="black" />

    {/* ACESSÓRIOS */}
    <Picker.Item label="────────── ACESSÓRIOS ──────────" value="titulo_acessorios" enabled={false} color="#228B22" />

    <Picker.Item label="Carregador iPhone Original 20W – R$ 129,00" value="Compra de carregador iPhone Original 20W" color="black" />
    <Picker.Item label="Carregador Android Tipo C Turbo – R$ 89,00" value="Compra de carregador Android Tipo C Turbo" color="black" />
    <Picker.Item label="Fone Bluetooth (Baseus / JBL) – R$ 249,00" value="Compra de fone Bluetooth Baseus/JBL" color="black" />
    <Picker.Item label="Capinha para iPhone (Silicone / Transparente) – R$ 49,00" value="Compra de capinha para iPhone (silicone/transparente)" color="black" />
    <Picker.Item label="Capinha para Samsung (Silicone / Antichoque) – R$ 29,00" value="Compra de capinha para Samsung (silicone/antichoque)" color="black" />
    <Picker.Item label="Película de vidro 9D – R$ 39,00" value="Compra de película de vidro 9D" color="black" />
    <Picker.Item label="Cabo USB Tipo C (1 m / 2 m) – R$ 59,00" value="Compra de cabo USB Tipo C (1m/2m)" color="black" />
    <Picker.Item label="Cabo Lightning iPhone (Original / Reforçado) – R$ 79,00" value="Compra de cabo Lightning iPhone (original/reforçado)" color="black" />
    <Picker.Item label="Suporte veicular magnético – R$ 119,00" value="Compra de suporte veicular magnético" color="black" />
    <Picker.Item label="Powerbank (10.000mAh / 20.000mAh) – R$ 199,00" value="Compra de powerbank (10k/20k mAh)" color="black" />

  </Picker>
</View>


      {/* Botão do calendário */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowDatePicker(true)}>
        <Text style={styles.buttonText}>
          Selecionar data: {date.toLocaleDateString('pt-BR')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowTimePicker(true)}>
        <Text style={styles.buttonText}>
          Selecionar horário: {date.toLocaleTimeString("pt-BR", {hour: '2-digit', minute: '2-digit'})}
        </Text>
      </TouchableOpacity>

      {/* Seletor de horário */}
      {showTimePicker &&(
      <DateTimePicker
        value={valorAtual}
        mode="time"
        is24Hour={true}
        display="spinner"
        onChange={onChange}
        minimumDate={minTime}
        maximumDate={maxTime}
      />
      )}

      {showDatePicker &&(
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={onChange}
          minimumDate={new Date()}
          maximumDate={new Date(2026, 11, 31)}
        />
      )}

      {/* Botão de agendar */}
      <TouchableOpacity style={styles.button} onPress={handleAgendar}>
        <Text style={styles.buttonText}>Confirmar Agendamento pelo WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ------------------ NAVEGAÇÃO ------------------ */

function TabNavigator({ setIsLogged }) {
  const LogoutButton = () => (
    <TouchableOpacity
      onPress={async () => {
        // Ao sair, removemos APENAS a chave da sessão (quem está logado) não apagamos os dados de login (user_email) nem os agendamentos (agendamentos_email)
        await AsyncStorage.removeItem('currentUserEmail');
        setIsLogged(false);
      }}
      style={{
        backgroundColor: '#111',
        padding: 10,
        borderRadius: 10,
        margin: 10,
      }}>
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Encerrar sessão</Text>
    </TouchableOpacity>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0a0' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#000' },
        tabBarActiveTintColor: '#0f0',
        tabBarInactiveTintColor: '#fff',
      }}>
      <Tab.Screen
        name="Serviços"
        component={ServicesScreen}
        options={{
          headerRight: () => <LogoutButton />,
          tabBarIcon: ({focused, size }) => (
          <FontAwesome name="wrench" size={size} color={focused ? '#0f0' : '#fff'} />
          ),
        }}
      />
      <Tab.Screen name="Agendamento"
      component={ScheduleScreen}
      options={{

        tabBarIcon: ({focused, size}) => (
          <FontAwesome name="calendar" size={size} color={focused ? '#0f0' : '#fff'} />
        ),
      }}
      />
    </Tab.Navigator>
  );
}

/* ------------------ APP PRINCIPAL ------------------ */

export default function App() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      // Verifica se existe um "usuário atual" logado, em vez de apenas verificar se "um" usuário existe
      const userEmail = await AsyncStorage.getItem('currentUserEmail');
      if (userEmail) setIsLogged(true);
    };
    checkLogin();
  }, []);

  return (
    <NavigationContainer>
      {isLogged ? (
        <TabNavigator setIsLogged={setIsLogged} />
      ) : (
        <LoginScreen setIsLogged={setIsLogged} />
      )}
    </NavigationContainer>
  );
}

/* ------------------ ESTILOS ------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Fundo escuro e moderno
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  containerTab: {
    flex: 1,
    backgroundColor: '#121212', // Fundo escuro para as telas de navegação
    padding: 20,
  },
  title: {
    fontSize: 32, // Maior destaque para o título
    fontWeight: 'bold',
    color: '#00FF00', // Verde neon
    marginBottom: 0,
    textAlign: 'center',
  },
  tag:{
    fontSize: 12, // Maior destaque para o título
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 16, // Menor que o título para hierarquia visual
    marginBottom: 30,
    textAlign: 'center',
  },
  agendamentos:{
    fontSize: 32, // Maior destaque para o título
    fontWeight: 'bold',
    color: '#00FF00', // Verde neon
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    color: '#fff',
    marginBottom: 10,
    fontSize: 16,
  },
  text1: {
      color: 'rgba(255, 255, 255, 0.3)',
      marginBottom: 10,
      fontSize: 16,
      textAlign: 'center',
    },
  input: {
    backgroundColor: '#222222', // Fundo mais suave nos inputs
    color: '#fff',
    borderWidth: 1,
    borderColor: '#00FF00',
    borderRadius: 12, // Bordas arredondadas
    padding: 15,
    width: '100%',
    marginBottom: 20,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#00FF00',
    backgroundColor: '#333333',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#00FF00',
    padding: 15,
    borderRadius: 12, // Bordas arredondadas
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3, // Sombra suave
  },
  buttonText: {
    color: '#121212', // Cor contrastante com fundo verde
    fontWeight: 'bold',
    fontSize: 18,
  },
  toggleText: {
    color: '#00FF00',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#222222', // Fundo do item de lista
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 3, // Sombra leve
  },
  itemContent: {
    flex: 1,
    marginRight: 15,
  },
  deleteButton: {
    padding: 5,
    backgroundColor: '#FF3B30', // Cor de erro para o botão de deletar
    borderRadius: 8,
  },
  picker: {
    color: '#fff',
  },
  dateTimeButton: {
    backgroundColor: '#444444', // Fundo mais escuro para opções de data/hora
    padding: 12,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  tabBar: {
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tabIcon: {
    fontSize: 24,
    color: '#fff',
  },
  tabIconActive: {
    color: '#00FF00', // Ícones ativos com verde neon
  },
});
