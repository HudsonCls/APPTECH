📱 Dominus Tech - App de Serviços e Agendamentos

📖 DescriçãoAplicativo mobile desenvolvido para a Dominus Tech, especializada em assistência técnica e venda de celulares e acessórios. O objetivo do app é facilitar a comunicação e o atendimento ao cliente, permitindo a criação de contas, o agendamento de serviços técnicos ou reserva de produtos, e o acompanhamento do histórico de solicitações diretamente pelo smartphone. Tudo isso integrado a um design moderno com tema escuro (Dark Mode) e destaques em verde neon.

O aplicativo conta com um fluxo completo para o usuário final:
🔐 Autenticação Local: 
Sistema de Login e Cadastro com validação de formato de e-mail e regras de segurança para a senha (mínimo de 6 caracteres).

📋 Acompanhamento de Serviços: 
Listagem em tempo real de todos os agendamentos realizados pelo usuário ativo, com formatação amigável de data e hora.

📅 Agendamento Inteligente: 
Seleção categorizada de serviços (Serviços Técnicos, Dispositivos Móveis e Acessórios).
Bloqueio de datas e horários indisponíveis (ex: fechado aos domingos e funcionamento restrito das 09h00 às 18h30).

💬 Integração com WhatsApp: Ao finalizar um agendamento, o app redireciona o usuário automaticamente para o WhatsApp da Dominus Tech com uma mensagem pré-formatada contendo os dados da solicitação.

🛠️ Tecnologias Utilizadas
O projeto foi construído utilizando o ecossistema React Native em conjunto com o Expo. 

As principais bibliotecas e dependências incluem: 
React Native: Framework principal para desenvolvimento mobile multiplataforma.

Expo: Plataforma e conjunto de ferramentas para facilitar o build e deploy.

React Navigation: Gerenciamento de rotas e navegação via Bottom Tabs (@react-navigation/native e @react-navigation/bottom-tabs).

AsyncStorage: Armazenamento local de dados (@react-native-async-storage/async-storage).

Picker: Componente de seleção em dropdown (@react-native-picker/picker).

DateTimePicker: Componente nativo para seleção de data e hora (@react-native-community/datetimepicker).

Expo Vector Icons: Biblioteca de ícones utilizando o padrão FontAwesome.


🏗️ Estrutura e Arquitetura de Dados (Storage)

O aplicativo utiliza o AsyncStorage como banco de dados local para persistência. A arquitetura foi pensada para isolar os dados de múltiplos usuários no mesmo dispositivo, funcionando da seguinte maneira:

Credenciais de Usuário (user_[email]): Quando uma conta é criada, os dados de autenticação são salvos em uma chave única atrelada ao e-mail.
Sessão Ativa (currentUserEmail): Mantém o estado de login. 

Quando o usuário acessa o app, essa chave guarda o e-mail da sessão atual, permitindo que o app pule a tela de login nas próximas aberturas. 
Ao deslogar, apenas essa chave é destruída.

Isolamento de Agendamentos (agendamentos_[email]): As listas de serviços solicitados são salvas em chaves exclusivas para cada usuário. Isso garante que a Tela de Acompanhamento renderize apenas os agendamentos de quem está logado no momento.

🚀 Como executar o projeto
Siga as instruções abaixo para rodar o projeto no seu ambiente de desenvolvimento.
Pré-requisitos:

Node.js instalado.
Gerenciador de pacotes (NPM ou Yarn).
App Expo Go instalado no seu celular (Android ou iOS) ou um Emulador configurado.

Passo a passo no GitHub:

Clone o repositório: git clone https://github.com/SEU_USUARIO/NOME_DO_REPOSITORIO.git
Acesse a pasta do projeto: cd NOME_DO_REPOSITORIO

Instale as dependências: npm install ou yarn install

Inicie o servidor do Expo: npx expo start

Rode no dispositivo:
Abra o aplicativo Expo Go no seu celular e escaneie o QR Code que aparecerá no terminal ou no navegador.
Alternativamente, pressione a no terminal para abrir no emulador Android ou i para o simulador iOS.

Feito Quebrando a "cuca" com muito café por [Hudson Calasans/github.com/HudsonCls].